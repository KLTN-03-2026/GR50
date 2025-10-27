from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta, date, time
from passlib.context import CryptContext
from jose import jwt
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_
from sqlalchemy.orm import selectinload, joinedload

# Import database models and session
from database import (
    engine, AsyncSessionLocal, get_db, Base,
    User as DBUser, Patient as DBPatient, Doctor as DBDoctor,
    Specialty as DBSpecialty, Appointment as DBAppointment,
    ChatMessage as DBChatMessage, AIChatHistory as DBAIChatHistory,
    AdminPermission as DBAdminPermission
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Application Settings
API_PREFIX = "/api"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        logger.info("Connecting to MySQL database...")
        # Test database connection
        async with AsyncSessionLocal() as session:
            await session.execute(select(1))
        logger.info("Successfully connected to MySQL database")
    except Exception as e:
        logger.error(f"Failed to connect to MySQL: {e}")
        if os.environ.get("ENVIRONMENT", "development") == "production":
            raise
        logger.warning("Running in development mode with database issues")
    
    yield
    
    # Shutdown
    logger.info("Closing database connections...")
    await engine.dispose()
    logger.info("Database connections closed")

# Create the main app with metadata
app = FastAPI(
    title="Healthcare API",
    description="Backend API for the Healthcare Management System",
    version="1.0.0",
    docs_url=f"{API_PREFIX}/docs",
    redoc_url=f"{API_PREFIX}/redoc",
    openapi_url=f"{API_PREFIX}/openapi.json",
    lifespan=lifespan
)

# Create a router with versioned API prefix
api_router = APIRouter()

# Configure CORS
origins = os.environ.get("CORS_ORIGINS", "*").split(",")
if "*" in origins:
    origins = ["*"]
else:
    origins.extend([
        "http://localhost:3000",  # React development server
        "http://localhost:8000",  # FastAPI development server
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security settings
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# JWT settings
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production")
if SECRET_KEY == "your-secret-key-change-in-production":
    logger.warning("Using development JWT_SECRET_KEY. Change this in production!")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24 * 7))  # 7 days default

# Response Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class HTTPError(BaseModel):
    detail: str

class SuccessResponse(BaseModel):
    message: str
    data: Optional[Dict[str, Any]] = None

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    try:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logger.error(f"Error creating access token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create access token"
        )

# Middleware for error handling
@app.middleware("http")
async def error_handler(request: Request, call_next):
    try:
        return await call_next(request)
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"detail": e.detail}
        )
    except Exception as e:
        logger.error(f"Unhandled error: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"}
        )

# Helper function to convert DB model to dict
def db_to_dict(db_obj) -> dict:
    """Convert SQLAlchemy model to dict"""
    if db_obj is None:
        return None
    result = {}
    for column in db_obj.__table__.columns:
        value = getattr(db_obj, column.name)
        if isinstance(value, (datetime, date, time)):
            result[column.name] = value.isoformat()
        else:
            result[column.name] = value
    return result

# Authentication middleware
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        
        result = await db.execute(select(DBUser).where(DBUser.id == user_id))
        user = result.scalar_one_or_none()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return db_to_dict(user)
    except jwt.ExpiredSignatureError:
        logger.warning(f"Expired token attempt")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired"
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token attempt: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during authentication"
        )

# Router will be included at the end of file after all routes are defined

# Models
class UserRole:
    PATIENT = "patient"
    DOCTOR = "doctor"
    DEPARTMENT_HEAD = "department_head"
    ADMIN = "admin"

    @classmethod
    def is_valid(cls, role: str) -> bool:
        return role in {cls.PATIENT, cls.DOCTOR, cls.DEPARTMENT_HEAD, cls.ADMIN}

class AdminPermissions(BaseModel):
    can_manage_doctors: bool = True
    can_manage_patients: bool = True
    can_manage_appointments: bool = True
    can_view_stats: bool = True
    can_manage_specialties: bool = True
    can_create_admins: bool = False  # Only root admin should have this

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    username: str
    full_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    role: str = UserRole.PATIENT
    admin_permissions: Optional[dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: str
    phone: str
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    role: str = UserRole.PATIENT
    specialty_id: Optional[str] = None  # For doctor registration
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    bio: Optional[str] = None
    admin_permissions: Optional[dict] = None
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if '@' not in v or '.' not in v.split('@')[1]:
            raise ValueError('Invalid email format')
        return v.lower()
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        import re
        if not v or len(v) < 3:
            raise ValueError('Username phải có ít nhất 3 ký tự')
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Username chỉ được chứa chữ cái, số và dấu gạch dưới')
        return v.lower()
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8 or len(v) > 20:
            raise ValueError('Mật khẩu phải có độ dài từ 8-20 ký tự')
        if ' ' in v:
            raise ValueError('Mật khẩu không được chứa khoảng trắng')
        return v
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        import re
        if not v:
            raise ValueError('Số điện thoại là bắt buộc')
        # Remove spaces and dashes
        phone = re.sub(r'[\s\-]', '', v)
        if not re.match(r'^[0-9]{10,11}$', phone):
            raise ValueError('Số điện thoại phải có 10-11 chữ số')
        return phone

class UserLogin(BaseModel):
    username: str
    password: str

class DoctorCreate(BaseModel):
    specialty_id: str
    experience_years: int = 0
    consultation_fee: float = 0.0
    bio: Optional[str] = None

class DoctorUpdate(BaseModel):
    specialty_id: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    bio: Optional[str] = None
    status: Optional[str] = None

class AppointmentCreate(BaseModel):
    doctor_id: str
    appointment_date: str
    appointment_time: str
    symptoms: Optional[str] = None

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    diagnosis: Optional[str] = None
    prescription: Optional[str] = None
    notes: Optional[str] = None

class ChatMessageCreate(BaseModel):
    message: str

class Specialty(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    # Doctor-specific fields
    specialty_id: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    bio: Optional[str] = None

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class AIChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class DoctorRecommendationRequest(BaseModel):
    symptoms: str

# ========================================
# Auth Routes
# ========================================

@api_router.post("/auth/register")
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result = await db.execute(select(DBUser).where(DBUser.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email đã được đăng ký")
    
    # Check if username exists
    result = await db.execute(select(DBUser).where(DBUser.username == user_data.username))
    existing_username = result.scalar_one_or_none()
    if existing_username:
        raise HTTPException(status_code=400, detail="Tên đăng nhập đã được sử dụng")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user_id = str(uuid.uuid4())
    db_user = DBUser(
        id=user_id,
        email=user_data.email,
        username=user_data.username,
        password=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
        date_of_birth=datetime.fromisoformat(user_data.date_of_birth).date() if user_data.date_of_birth else None,
        address=user_data.address,
        role=user_data.role
    )
    db.add(db_user)
    
    # If registering as doctor, create doctor profile
    if user_data.role == UserRole.DOCTOR:
        doctor_id = str(uuid.uuid4())
        db_doctor = DBDoctor(
            id=doctor_id,
            user_id=user_id,
            specialty_id=user_data.specialty_id,
            experience_years=user_data.experience_years or 0,
            consultation_fee=user_data.consultation_fee or 0.0,
            bio=user_data.bio,
            status='pending'
        )
        db.add(db_doctor)
    
    # If registering as patient, create patient profile
    elif user_data.role == UserRole.PATIENT:
        patient_id = str(uuid.uuid4())
        db_patient = DBPatient(
            id=patient_id,
            user_id=user_id
        )
        db.add(db_patient)
    
    await db.commit()
    
    # Get user dict for response
    user_dict = db_to_dict(db_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict
    }

@api_router.post("/auth/login")
async def login(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    # Find user by username or email
    result = await db.execute(
        select(DBUser).where(
            or_(DBUser.username == login_data.username, DBUser.email == login_data.username)
        )
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng"
        )
    
    # Load admin permissions if user is admin
    admin_permissions = None
    if user.role == UserRole.ADMIN:
        result = await db.execute(
            select(DBAdminPermission).where(DBAdminPermission.user_id == user.id)
        )
        perm = result.scalar_one_or_none()
        if perm:
            admin_permissions = db_to_dict(perm)
            del admin_permissions['user_id']  # Remove user_id from permissions dict
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    # Prepare user dict
    user_dict = db_to_dict(user)
    if admin_permissions:
        user_dict['admin_permissions'] = admin_permissions
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Load admin permissions if user is admin
    if current_user['role'] == UserRole.ADMIN:
        result = await db.execute(
            select(DBAdminPermission).where(DBAdminPermission.user_id == current_user['id'])
        )
        perm = result.scalar_one_or_none()
        if perm:
            admin_permissions = db_to_dict(perm)
            del admin_permissions['user_id']
            current_user['admin_permissions'] = admin_permissions
    
    return current_user

# ========================================
# Profile Routes
# ========================================

@api_router.put("/profile/update")
async def update_profile(
    profile_data: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Update user basic info
    update_data = {}
    if profile_data.full_name:
        update_data['full_name'] = profile_data.full_name
    if profile_data.phone:
        update_data['phone'] = profile_data.phone
    if profile_data.date_of_birth:
        update_data['date_of_birth'] = datetime.fromisoformat(profile_data.date_of_birth).date()
    if profile_data.address:
        update_data['address'] = profile_data.address
    
    if update_data:
        update_data['updated_at'] = datetime.now(timezone.utc)
        await db.execute(
            update(DBUser).where(DBUser.id == current_user['id']).values(**update_data)
        )
    
    # If doctor, update doctor-specific fields
    if current_user['role'] == UserRole.DOCTOR:
        doctor_update = {}
        if profile_data.specialty_id:
            doctor_update['specialty_id'] = profile_data.specialty_id
        if profile_data.experience_years is not None:
            doctor_update['experience_years'] = profile_data.experience_years
        if profile_data.consultation_fee is not None:
            doctor_update['consultation_fee'] = profile_data.consultation_fee
        if profile_data.bio:
            doctor_update['bio'] = profile_data.bio
        
        if doctor_update:
            doctor_update['updated_at'] = datetime.now(timezone.utc)
            await db.execute(
                update(DBDoctor).where(DBDoctor.user_id == current_user['id']).values(**doctor_update)
            )
    
    await db.commit()
    
    # Get updated user
    result = await db.execute(select(DBUser).where(DBUser.id == current_user['id']))
    updated_user = result.scalar_one()
    
    return {"message": "Cập nhật thông tin thành công", "user": db_to_dict(updated_user)}

@api_router.post("/profile/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get user from database
    result = await db.execute(select(DBUser).where(DBUser.id == current_user['id']))
    user = result.scalar_one()
    
    # Verify current password
    if not verify_password(password_data.current_password, user.password):
        raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không đúng")
    
    # Validate new password
    if len(password_data.new_password) < 8 or len(password_data.new_password) > 20:
        raise HTTPException(status_code=400, detail="Mật khẩu phải có độ dài từ 8-20 ký tự")
    
    # Hash and update new password
    hashed_password = hash_password(password_data.new_password)
    await db.execute(
        update(DBUser).where(DBUser.id == current_user['id']).values(
            password=hashed_password,
            updated_at=datetime.now(timezone.utc)
        )
    )
    await db.commit()
    
    return {"message": "Đổi mật khẩu thành công"}

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(DBUser).where(DBUser.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user:
        # Return success even if user not found (security best practice)
        return {"message": "Nếu email tồn tại, bạn sẽ nhận được email đặt lại mật khẩu"}
    
    # TODO: Implement email sending logic
    # For now, just return success message
    return {"message": "Nếu email tồn tại, bạn sẽ nhận được email đặt lại mật khẩu"}

# ========================================
# Specialty Routes
# ========================================

@api_router.get("/specialties", response_model=List[Specialty])
async def get_specialties(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBSpecialty))
    specialties = result.scalars().all()
    return [db_to_dict(s) for s in specialties]

@api_router.post("/specialties", response_model=Specialty)
async def create_specialty(
    specialty: Specialty,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Only admins can create specialties
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Chỉ admin mới có quyền tạo chuyên khoa")
    
    # Check if specialty already exists
    result = await db.execute(select(DBSpecialty).where(DBSpecialty.name == specialty.name))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Chuyên khoa đã tồn tại")
    
    specialty_id = str(uuid.uuid4())
    db_specialty = DBSpecialty(
        id=specialty_id,
        name=specialty.name,
        description=specialty.description
    )
    db.add(db_specialty)
    await db.commit()
    
    return db_to_dict(db_specialty)

# Continue with remaining endpoints...
# This is a starting framework. I'll add more endpoints in the next iteration.

# Include router in app
app.include_router(api_router, prefix=API_PREFIX)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "mysql"}
