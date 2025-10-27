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
from datetime import datetime, timezone, timedelta, date, time as dt_time
from passlib.context import CryptContext
from jose import jwt
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_, desc
from sqlalchemy.orm import selectinload, joinedload
from decimal import Decimal

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
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__truncate_error=True
)
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
        if isinstance(value, (datetime, date, dt_time)):
            result[column.name] = value.isoformat()
        elif isinstance(value, Decimal):
            result[column.name] = float(value)
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
        
        user_dict = db_to_dict(user)
        
        # Load admin permissions if user is admin
        if user.role == "admin":
            result = await db.execute(
                select(DBAdminPermission).where(DBAdminPermission.user_id == user.id)
            )
            perm = result.scalar_one_or_none()
            if perm:
                admin_permissions = db_to_dict(perm)
                del admin_permissions['user_id']
                user_dict['admin_permissions'] = admin_permissions
        
        return user_dict
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
    login: str  # Có thể là email hoặc username
    password: str
    
    @field_validator('login')
    @classmethod
    def validate_login(cls, v):
        return v.lower().strip()

class Specialty(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None

class SpecialtyCreate(BaseModel):
    name: str
    description: Optional[str] = None

class DoctorProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    specialty_id: str
    specialty_name: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    available_slots: List[dict] = []  # [{"day": "monday", "start_time": "09:00", "end_time": "17:00"}]
    status: str = "pending"  # pending, approved, rejected
    is_department_head: bool = False  # Trưởng khoa flag
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DoctorProfileUpdate(BaseModel):
    specialty_id: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None

class DoctorScheduleUpdate(BaseModel):
    available_slots: List[dict]

class AppointmentType:
    IN_PERSON = "in_person"
    ONLINE = "online"

class AppointmentStatus:
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    patient_name: Optional[str] = None
    doctor_id: str
    doctor_name: Optional[str] = None
    appointment_date: str  # YYYY-MM-DD
    appointment_time: str  # HH:MM
    symptoms: Optional[str] = None
    status: str = AppointmentStatus.PENDING
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentCreate(BaseModel):
    doctor_id: str
    appointment_date: str
    appointment_time: str
    symptoms: Optional[str] = None

class AppointmentStatusUpdate(BaseModel):
    status: str

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    appointment_id: str
    sender_id: str
    sender_name: Optional[str] = None
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessageCreate(BaseModel):
    appointment_id: str
    message: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v is None:
            return v
        import re
        # Remove spaces and dashes
        phone = re.sub(r'[\s\-]', '', v)
        if not re.match(r'^[0-9]{10,11}$', phone):
            raise ValueError('Số điện thoại phải có 10-11 chữ số')
        return phone

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8 or len(v) > 20:
            raise ValueError('Mật khẩu phải có độ dài từ 8-20 ký tự')
        if ' ' in v:
            raise ValueError('Mật khẩu không được chứa khoảng trắng')
        return v

class ForgotPasswordRequest(BaseModel):
    email: str
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if '@' not in v or '.' not in v.split('@')[1]:
            raise ValueError('Invalid email format')
        return v.lower()

class AIChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class AIChatResponse(BaseModel):
    response: str
    session_id: str

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
    
    # If registering as doctor or department_head, create doctor profile
    if user_data.role in [UserRole.DOCTOR, UserRole.DEPARTMENT_HEAD]:
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
    await db.refresh(db_user)
    
    # Get user dict for response
    user_dict = db_to_dict(db_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id, "role": user_data.role})
    
    return {
        "token": access_token,
        "user": user_dict
    }

@api_router.post("/auth/login")
async def login(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    # Find user by username or email
    result = await db.execute(
        select(DBUser).where(
            or_(DBUser.username == login_data.login, DBUser.email == login_data.login)
        )
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email/Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng kiểm tra lại!"
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
            del admin_permissions['user_id']
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    
    # Prepare user dict
    user_dict = db_to_dict(user)
    if admin_permissions:
        user_dict['admin_permissions'] = admin_permissions
    
    return {
        "token": access_token,
        "user": user_dict
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# ========================================
# Profile Routes
# ========================================

@api_router.put("/profile/update")
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile information - works for all roles"""
    user_id = current_user["id"]
    
    # Prepare update data
    update_data = {}
    if profile_data.full_name is not None:
        update_data["full_name"] = profile_data.full_name
    if profile_data.phone is not None:
        update_data["phone"] = profile_data.phone
    if profile_data.date_of_birth is not None:
        update_data["date_of_birth"] = datetime.fromisoformat(profile_data.date_of_birth).date()
    if profile_data.address is not None:
        update_data["address"] = profile_data.address
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Không có thông tin nào để cập nhật")
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    # Update user
    await db.execute(
        update(DBUser).where(DBUser.id == user_id).values(**update_data)
    )
    await db.commit()
    
    # Get updated user
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    updated_user = result.scalar_one()
    
    return {
        "message": "Cập nhật thông tin thành công",
        "user": db_to_dict(updated_user)
    }

@api_router.post("/profile/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Change user password - works for all roles"""
    user_id = current_user["id"]
    
    # Get user from database
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    user = result.scalar_one()
    
    # Verify current password
    if not verify_password(password_data.current_password, user.password):
        raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không đúng")
    
    # Hash and update new password
    hashed_password = hash_password(password_data.new_password)
    await db.execute(
        update(DBUser).where(DBUser.id == user_id).values(
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
        return {"message": "If email exists, reset link will be sent"}
    
    # TODO: Implement email sending logic
    # For now, just return success message
    return {"message": "If email exists, reset link will be sent"}

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
    specialty_data: SpecialtyCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if specialty already exists
    result = await db.execute(select(DBSpecialty).where(DBSpecialty.name == specialty_data.name))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Chuyên khoa đã tồn tại")
    
    specialty_id = str(uuid.uuid4())
    db_specialty = DBSpecialty(
        id=specialty_id,
        name=specialty_data.name,
        description=specialty_data.description
    )
    db.add(db_specialty)
    await db.commit()
    await db.refresh(db_specialty)
    
    return db_to_dict(db_specialty)

# ========================================
# Doctor Routes
# ========================================

@api_router.get("/doctors")
async def get_doctors(specialty_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    # Build query
    query = select(DBDoctor, DBUser, DBSpecialty).join(
        DBUser, DBDoctor.user_id == DBUser.id
    ).outerjoin(
        DBSpecialty, DBDoctor.specialty_id == DBSpecialty.id
    ).where(DBDoctor.status == "approved")
    
    if specialty_id:
        query = query.where(DBDoctor.specialty_id == specialty_id)
    
    result = await db.execute(query)
    rows = result.all()
    
    doctors = []
    for doctor, user, specialty in rows:
        doctor_dict = db_to_dict(doctor)
        doctor_dict["full_name"] = user.full_name
        doctor_dict["email"] = user.email
        if specialty:
            doctor_dict["specialty_name"] = specialty.name
        doctors.append(doctor_dict)
    
    return doctors

@api_router.get("/doctors/{doctor_id}")
async def get_doctor(doctor_id: str, db: AsyncSession = Depends(get_db)):
    # Get doctor with user and specialty info
    result = await db.execute(
        select(DBDoctor, DBUser, DBSpecialty).join(
            DBUser, DBDoctor.user_id == DBUser.id
        ).outerjoin(
            DBSpecialty, DBDoctor.specialty_id == DBSpecialty.id
        ).where(DBDoctor.user_id == doctor_id)
    )
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    doctor, user, specialty = row
    doctor_dict = db_to_dict(doctor)
    doctor_dict["full_name"] = user.full_name
    doctor_dict["email"] = user.email
    if specialty:
        doctor_dict["specialty_name"] = specialty.name
    
    return doctor_dict

@api_router.put("/doctors/profile")
async def update_doctor_profile(
    profile_data: DoctorProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user["role"] != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Doctor access required")
    
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await db.execute(
            update(DBDoctor).where(DBDoctor.user_id == current_user["id"]).values(**update_data)
        )
        await db.commit()
    
    # Get updated doctor
    result = await db.execute(
        select(DBDoctor).where(DBDoctor.user_id == current_user["id"])
    )
    doctor = result.scalar_one()
    return db_to_dict(doctor)

@api_router.put("/doctors/schedule")
async def update_doctor_schedule(
    schedule_data: DoctorScheduleUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user["role"] != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Doctor access required")
    
    # Note: available_slots is not in current MySQL schema
    # This endpoint may need schema update
    # For now, just return success
    return {"message": "Schedule updated (feature pending schema update)"}

# ========================================
# Appointment Routes
# ========================================

@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(
    appointment_data: AppointmentCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user["role"] != UserRole.PATIENT:
        raise HTTPException(status_code=403, detail="Patient access required")
    
    # Get doctor name
    result = await db.execute(select(DBUser).where(DBUser.id == appointment_data.doctor_id))
    doctor_user = result.scalar_one_or_none()
    if not doctor_user:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Create appointment
    appointment_id = str(uuid.uuid4())
    db_appointment = DBAppointment(
        id=appointment_id,
        patient_id=current_user["id"],
        doctor_id=appointment_data.doctor_id,
        appointment_date=datetime.fromisoformat(appointment_data.appointment_date).date(),
        appointment_time=datetime.fromisoformat(f"2000-01-01 {appointment_data.appointment_time}").time(),
        symptoms=appointment_data.symptoms,
        status=AppointmentStatus.PENDING
    )
    db.add(db_appointment)
    await db.commit()
    await db.refresh(db_appointment)
    
    # Prepare response
    appointment_dict = db_to_dict(db_appointment)
    appointment_dict["patient_name"] = current_user["full_name"]
    appointment_dict["doctor_name"] = doctor_user.full_name
    
    return appointment_dict

@api_router.get("/appointments/my")
async def get_my_appointments(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] == UserRole.PATIENT:
        # Get appointments for patient with doctor info
        result = await db.execute(
            select(DBAppointment, DBUser).join(
                DBUser, DBAppointment.doctor_id == DBUser.id
            ).where(DBAppointment.patient_id == current_user["id"]).order_by(desc(DBAppointment.appointment_date))
        )
        rows = result.all()
        
        appointments = []
        for appointment, doctor_user in rows:
            apt_dict = db_to_dict(appointment)
            apt_dict["patient_name"] = current_user["full_name"]
            apt_dict["doctor_name"] = doctor_user.full_name
            appointments.append(apt_dict)
        
        return appointments
    
    elif current_user["role"] == UserRole.DOCTOR:
        # Get appointments for doctor with patient info
        result = await db.execute(
            select(DBAppointment, DBUser).join(
                DBUser, DBAppointment.patient_id == DBUser.id
            ).where(DBAppointment.doctor_id == current_user["id"]).order_by(desc(DBAppointment.appointment_date))
        )
        rows = result.all()
        
        appointments = []
        for appointment, patient_user in rows:
            apt_dict = db_to_dict(appointment)
            apt_dict["patient_name"] = patient_user.full_name
            apt_dict["doctor_name"] = current_user["full_name"]
            appointments.append(apt_dict)
        
        return appointments
    
    else:
        raise HTTPException(status_code=403, detail="Invalid role")

@api_router.put("/appointments/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    status_data: AppointmentStatusUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user["role"] != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Doctor access required")
    
    # Get appointment
    result = await db.execute(select(DBAppointment).where(DBAppointment.id == appointment_id))
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if appointment.doctor_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not your appointment")
    
    # Update status
    await db.execute(
        update(DBAppointment).where(DBAppointment.id == appointment_id).values(
            status=status_data.status,
            updated_at=datetime.now(timezone.utc)
        )
    )
    await db.commit()
    
    # Get updated appointment
    result = await db.execute(select(DBAppointment).where(DBAppointment.id == appointment_id))
    updated = result.scalar_one()
    
    return db_to_dict(updated)

# ========================================
# Chat Routes
# ========================================

@api_router.post("/chat/send")
async def send_message(
    message_data: ChatMessageCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify appointment exists and user is part of it
    result = await db.execute(select(DBAppointment).where(DBAppointment.id == message_data.appointment_id))
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if current_user["id"] not in [appointment.patient_id, appointment.doctor_id]:
        raise HTTPException(status_code=403, detail="Not your appointment")
    
    # Create message
    message_id = str(uuid.uuid4())
    db_message = DBChatMessage(
        id=message_id,
        appointment_id=message_data.appointment_id,
        sender_id=current_user["id"],
        message=message_data.message
    )
    db.add(db_message)
    await db.commit()
    await db.refresh(db_message)
    
    message_dict = db_to_dict(db_message)
    message_dict["sender_name"] = current_user["full_name"]
    
    return message_dict

@api_router.get("/chat/{appointment_id}")
async def get_chat_messages(
    appointment_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify appointment exists and user is part of it
    result = await db.execute(select(DBAppointment).where(DBAppointment.id == appointment_id))
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if current_user["id"] not in [appointment.patient_id, appointment.doctor_id]:
        raise HTTPException(status_code=403, detail="Not your appointment")
    
    # Get messages with sender info
    result = await db.execute(
        select(DBChatMessage, DBUser).join(
            DBUser, DBChatMessage.sender_id == DBUser.id
        ).where(DBChatMessage.appointment_id == appointment_id).order_by(DBChatMessage.created_at)
    )
    rows = result.all()
    
    messages = []
    for message, sender in rows:
        msg_dict = db_to_dict(message)
        msg_dict["sender_name"] = sender.full_name
        messages.append(msg_dict)
    
    return messages

# ========================================
# Admin Routes
# ========================================

@api_router.get("/admin/doctors")
async def admin_get_doctors(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get all doctors with user and specialty info
    result = await db.execute(
        select(DBDoctor, DBUser, DBSpecialty).join(
            DBUser, DBDoctor.user_id == DBUser.id
        ).outerjoin(
            DBSpecialty, DBDoctor.specialty_id == DBSpecialty.id
        )
    )
    rows = result.all()
    
    doctors = []
    for doctor, user, specialty in rows:
        doctor_dict = db_to_dict(doctor)
        doctor_dict["full_name"] = user.full_name
        doctor_dict["email"] = user.email
        if specialty:
            doctor_dict["specialty_name"] = specialty.name
        doctors.append(doctor_dict)
    
    return doctors

@api_router.put("/admin/doctors/{doctor_id}/approve")
async def admin_approve_doctor(
    doctor_id: str,
    status: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Update doctor status
    await db.execute(
        update(DBDoctor).where(DBDoctor.user_id == doctor_id).values(
            status=status,
            approved_by=current_user["id"],
            updated_at=datetime.now(timezone.utc)
        )
    )
    await db.commit()
    
    # Get updated doctor
    result = await db.execute(select(DBDoctor).where(DBDoctor.user_id == doctor_id))
    doctor = result.scalar_one()
    
    return db_to_dict(doctor)

@api_router.get("/admin/patients")
async def admin_get_patients(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get all patients
    result = await db.execute(select(DBUser).where(DBUser.role == UserRole.PATIENT))
    patients = result.scalars().all()
    
    return [db_to_dict(p) for p in patients]

@api_router.get("/admin/stats")
async def admin_get_stats(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get statistics
    total_patients_result = await db.execute(select(func.count()).select_from(DBUser).where(DBUser.role == UserRole.PATIENT))
    total_patients = total_patients_result.scalar()
    
    total_doctors_result = await db.execute(select(func.count()).select_from(DBUser).where(DBUser.role == UserRole.DOCTOR))
    total_doctors = total_doctors_result.scalar()
    
    total_appointments_result = await db.execute(select(func.count()).select_from(DBAppointment))
    total_appointments = total_appointments_result.scalar()
    
    pending_appointments_result = await db.execute(select(func.count()).select_from(DBAppointment).where(DBAppointment.status == AppointmentStatus.PENDING))
    pending_appointments = pending_appointments_result.scalar()
    
    confirmed_appointments_result = await db.execute(select(func.count()).select_from(DBAppointment).where(DBAppointment.status == AppointmentStatus.CONFIRMED))
    confirmed_appointments = confirmed_appointments_result.scalar()
    
    completed_appointments_result = await db.execute(select(func.count()).select_from(DBAppointment).where(DBAppointment.status == AppointmentStatus.COMPLETED))
    completed_appointments = completed_appointments_result.scalar()
    
    cancelled_appointments_result = await db.execute(select(func.count()).select_from(DBAppointment).where(DBAppointment.status == AppointmentStatus.CANCELLED))
    cancelled_appointments = cancelled_appointments_result.scalar()
    
    pending_doctors_result = await db.execute(select(func.count()).select_from(DBDoctor).where(DBDoctor.status == "pending"))
    pending_doctors = pending_doctors_result.scalar()
    
    approved_doctors_result = await db.execute(select(func.count()).select_from(DBDoctor).where(DBDoctor.status == "approved"))
    approved_doctors = approved_doctors_result.scalar()
    
    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "pending_appointments": pending_appointments,
        "confirmed_appointments": confirmed_appointments,
        "completed_appointments": completed_appointments,
        "cancelled_appointments": cancelled_appointments,
        "online_consultations": 0,  # Not tracked in current schema
        "in_person_consultations": 0,  # Not tracked in current schema
        "pending_doctors": pending_doctors,
        "approved_doctors": approved_doctors
    }

# Admin - Create Admin Account with Permissions
@api_router.post("/admin/create-admin")
async def create_admin_account(
    user_data: UserCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if current admin has permission to create admins
    current_permissions = current_user.get("admin_permissions") or {}
    if not current_permissions.get("can_create_admins", False):
        raise HTTPException(status_code=403, detail="You don't have permission to create admin accounts")
    
    # Force role to be admin
    user_data.role = UserRole.ADMIN
    
    # Check if user exists
    result = await db.execute(select(DBUser).where(DBUser.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Set default permissions if not provided
    if not user_data.admin_permissions:
        user_data.admin_permissions = {
            "can_manage_doctors": True,
            "can_manage_patients": True,
            "can_manage_appointments": True,
            "can_view_stats": True,
            "can_manage_specialties": True,
            "can_create_admins": False
        }
    
    # Create admin user
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
        role=UserRole.ADMIN
    )
    db.add(db_user)
    
    # Create admin permissions
    db_permissions = DBAdminPermission(
        user_id=user_id,
        can_manage_doctors=user_data.admin_permissions.get("can_manage_doctors", True),
        can_manage_patients=user_data.admin_permissions.get("can_manage_patients", True),
        can_manage_appointments=user_data.admin_permissions.get("can_manage_appointments", True),
        can_view_stats=user_data.admin_permissions.get("can_view_stats", True),
        can_manage_specialties=user_data.admin_permissions.get("can_manage_specialties", True),
        can_create_admins=user_data.admin_permissions.get("can_create_admins", False)
    )
    db.add(db_permissions)
    
    await db.commit()
    await db.refresh(db_user)
    
    user_dict = db_to_dict(db_user)
    user_dict['admin_permissions'] = user_data.admin_permissions
    
    return {"message": "Admin created successfully", "user": user_dict}

@api_router.get("/admin/admins")
async def get_all_admins(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get all admin users with their permissions
    result = await db.execute(
        select(DBUser, DBAdminPermission).outerjoin(
            DBAdminPermission, DBUser.id == DBAdminPermission.user_id
        ).where(DBUser.role == UserRole.ADMIN)
    )
    rows = result.all()
    
    admins = []
    for user, permissions in rows:
        admin_dict = db_to_dict(user)
        if permissions:
            perms = db_to_dict(permissions)
            del perms['user_id']
            admin_dict['admin_permissions'] = perms
        admins.append(admin_dict)
    
    return admins

@api_router.put("/admin/update-permissions")
async def update_admin_permissions(
    admin_id: str,
    permissions: AdminPermissions,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    current_permissions = current_user.get("admin_permissions") or {}
    if not current_permissions.get("can_create_admins", False):
        raise HTTPException(status_code=403, detail="You don't have permission to modify admin permissions")
    
    # Update permissions
    result = await db.execute(select(DBAdminPermission).where(DBAdminPermission.user_id == admin_id))
    existing_perms = result.scalar_one_or_none()
    
    if existing_perms:
        await db.execute(
            update(DBAdminPermission).where(DBAdminPermission.user_id == admin_id).values(
                can_manage_doctors=permissions.can_manage_doctors,
                can_manage_patients=permissions.can_manage_patients,
                can_manage_appointments=permissions.can_manage_appointments,
                can_view_stats=permissions.can_view_stats,
                can_manage_specialties=permissions.can_manage_specialties,
                can_create_admins=permissions.can_create_admins
            )
        )
    else:
        db_permissions = DBAdminPermission(
            user_id=admin_id,
            can_manage_doctors=permissions.can_manage_doctors,
            can_manage_patients=permissions.can_manage_patients,
            can_manage_appointments=permissions.can_manage_appointments,
            can_view_stats=permissions.can_view_stats,
            can_manage_specialties=permissions.can_manage_specialties,
            can_create_admins=permissions.can_create_admins
        )
        db.add(db_permissions)
    
    await db.commit()
    
    return {"message": "Permissions updated successfully"}

@api_router.delete("/admin/delete-admin/{admin_id}")
async def delete_admin(
    admin_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    current_permissions = current_user.get("admin_permissions") or {}
    if not current_permissions.get("can_create_admins", False):
        raise HTTPException(status_code=403, detail="You don't have permission to delete admins")
    
    if admin_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    # Delete admin
    result = await db.execute(select(DBUser).where(DBUser.id == admin_id))
    admin = result.scalar_one_or_none()
    
    if not admin or admin.role != UserRole.ADMIN:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    await db.delete(admin)
    await db.commit()
    
    return {"message": "Admin deleted successfully"}

@api_router.delete("/admin/delete-user/{user_id}")
async def admin_delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get user
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Cannot delete self
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    # Delete user (cascade will handle related records)
    await db.delete(user)
    await db.commit()
    
    return {"message": "User deleted successfully"}

@api_router.post("/admin/create-user")
async def admin_create_user(
    user_data: UserCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if email exists
    result = await db.execute(select(DBUser).where(DBUser.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email đã được đăng ký")
    
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
    
    # Create role-specific profiles
    if user_data.role in [UserRole.DOCTOR, UserRole.DEPARTMENT_HEAD]:
        doctor_id = str(uuid.uuid4())
        db_doctor = DBDoctor(
            id=doctor_id,
            user_id=user_id,
            specialty_id=user_data.specialty_id,
            experience_years=user_data.experience_years or 0,
            consultation_fee=user_data.consultation_fee or 0.0,
            bio=user_data.bio,
            status='approved'  # Admin-created doctors are auto-approved
        )
        db.add(db_doctor)
    elif user_data.role == UserRole.PATIENT:
        patient_id = str(uuid.uuid4())
        db_patient = DBPatient(
            id=patient_id,
            user_id=user_id
        )
        db.add(db_patient)
    
    await db.commit()
    await db.refresh(db_user)
    
    return {"message": "User created successfully", "user": db_to_dict(db_user)}

# ========================================
# Health Check
# ========================================

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "database": "mysql"}

# ========================================
# Department Head Routes
# ========================================

@api_router.post("/department-head/create-user")
async def department_head_create_user(
    user_data: UserCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user["role"] != UserRole.DEPARTMENT_HEAD:
        raise HTTPException(status_code=403, detail="Department Head access required")
    
    # Department Head can only create patient and doctor accounts
    if user_data.role not in [UserRole.PATIENT, UserRole.DOCTOR]:
        raise HTTPException(status_code=403, detail="You can only create patient or doctor accounts")
    
    # Check if email exists
    result = await db.execute(select(DBUser).where(DBUser.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email đã được đăng ký")
    
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
    
    # Create role-specific profiles
    if user_data.role == UserRole.DOCTOR:
        doctor_id = str(uuid.uuid4())
        db_doctor = DBDoctor(
            id=doctor_id,
            user_id=user_id,
            specialty_id=user_data.specialty_id,
            experience_years=user_data.experience_years or 0,
            consultation_fee=user_data.consultation_fee or 0.0,
            bio=user_data.bio,
            status='approved'  # Department Head-created doctors are auto-approved
        )
        db.add(db_doctor)
    elif user_data.role == UserRole.PATIENT:
        patient_id = str(uuid.uuid4())
        db_patient = DBPatient(
            id=patient_id,
            user_id=user_id
        )
        db.add(db_patient)
    
    await db.commit()
    await db.refresh(db_user)
    
    return {"message": "User created successfully", "user": db_to_dict(db_user)}

@api_router.get("/department-head/doctors")
async def department_head_get_doctors(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != UserRole.DEPARTMENT_HEAD:
        raise HTTPException(status_code=403, detail="Department Head access required")
    
    # Get all doctors with user and specialty info
    result = await db.execute(
        select(DBDoctor, DBUser, DBSpecialty).join(
            DBUser, DBDoctor.user_id == DBUser.id
        ).outerjoin(
            DBSpecialty, DBDoctor.specialty_id == DBSpecialty.id
        )
    )
    rows = result.all()
    
    doctors = []
    for doctor, user, specialty in rows:
        doctor_dict = db_to_dict(doctor)
        doctor_dict["user_info"] = {
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone
        }
        doctor_dict["full_name"] = user.full_name
        doctor_dict["email"] = user.email
        if specialty:
            doctor_dict["specialty_name"] = specialty.name
        doctors.append(doctor_dict)
    
    return doctors

@api_router.get("/department-head/patients")
async def department_head_get_patients(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != UserRole.DEPARTMENT_HEAD:
        raise HTTPException(status_code=403, detail="Department Head access required")
    
    # Get all patients
    result = await db.execute(select(DBUser).where(DBUser.role == UserRole.PATIENT))
    patients = result.scalars().all()
    
    return [db_to_dict(p) for p in patients]

@api_router.delete("/department-head/remove-patient/{patient_id}")
async def department_head_remove_patient(
    patient_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user["role"] != UserRole.DEPARTMENT_HEAD:
        raise HTTPException(status_code=403, detail="Department Head access required")
    
    # Get patient user
    result = await db.execute(select(DBUser).where(and_(DBUser.id == patient_id, DBUser.role == UserRole.PATIENT)))
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Delete patient (cascade will handle related records)
    await db.delete(patient)
    await db.commit()
    
    return {"message": "Patient removed successfully"}

@api_router.get("/department-head/stats")
async def department_head_get_stats(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user["role"] != UserRole.DEPARTMENT_HEAD:
        raise HTTPException(status_code=403, detail="Department Head access required")
    
    # Get statistics
    total_doctors_result = await db.execute(select(func.count()).select_from(DBUser).where(DBUser.role == UserRole.DOCTOR))
    total_doctors = total_doctors_result.scalar()
    
    approved_doctors_result = await db.execute(select(func.count()).select_from(DBDoctor).where(DBDoctor.status == "approved"))
    approved_doctors = approved_doctors_result.scalar()
    
    pending_doctors_result = await db.execute(select(func.count()).select_from(DBDoctor).where(DBDoctor.status == "pending"))
    pending_doctors = pending_doctors_result.scalar()
    
    total_patients_result = await db.execute(select(func.count()).select_from(DBUser).where(DBUser.role == UserRole.PATIENT))
    total_patients = total_patients_result.scalar()
    
    total_appointments_result = await db.execute(select(func.count()).select_from(DBAppointment))
    total_appointments = total_appointments_result.scalar()
    
    completed_appointments_result = await db.execute(select(func.count()).select_from(DBAppointment).where(DBAppointment.status == AppointmentStatus.COMPLETED))
    completed_appointments = completed_appointments_result.scalar()
    
    return {
        "total_doctors": total_doctors,
        "approved_doctors": approved_doctors,
        "pending_doctors": pending_doctors,
        "total_patients": total_patients,
        "total_appointments": total_appointments,
        "completed_appointments": completed_appointments
    }

# ========================================
# AI Routes
# ========================================

@api_router.post("/ai/chat", response_model=AIChatResponse)
async def ai_chat(
    chat_request: AIChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """AI health consultation chatbot"""
    if current_user["role"] != UserRole.PATIENT:
        raise HTTPException(status_code=403, detail="Only patients can use AI chat")
    
    try:
        # Import OpenAI
        from openai import OpenAI
        
        # Get API key
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        client = OpenAI(api_key=api_key)
        
        # Generate session ID if not provided
        session_id = chat_request.session_id or str(uuid.uuid4())
        
        # Get chat history for this session
        result = await db.execute(
            select(DBAIChatHistory).where(
                and_(
                    DBAIChatHistory.user_id == current_user["id"],
                    DBAIChatHistory.session_id == session_id
                )
            ).order_by(DBAIChatHistory.created_at)
        )
        history = result.scalars().all()
        
        # Build messages array
        messages = [
            {"role": "system", "content": "You are a helpful medical assistant. Provide health advice and information, but always recommend consulting a doctor for serious concerns."}
        ]
        
        for msg in history:
            messages.append({"role": msg.role, "content": msg.content})
        
        messages.append({"role": "user", "content": chat_request.message})
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=500
        )
        
        ai_response = response.choices[0].message.content
        
        # Save user message
        user_msg = DBAIChatHistory(
            id=str(uuid.uuid4()),
            user_id=current_user["id"],
            session_id=session_id,
            role="user",
            content=chat_request.message
        )
        db.add(user_msg)
        
        # Save AI response
        ai_msg = DBAIChatHistory(
            id=str(uuid.uuid4()),
            user_id=current_user["id"],
            session_id=session_id,
            role="assistant",
            content=ai_response
        )
        db.add(ai_msg)
        
        await db.commit()
        
        return {"response": ai_response, "session_id": session_id}
    
    except Exception as e:
        logger.error(f"AI chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@api_router.post("/ai/recommend-doctor")
async def ai_recommend_doctor(
    recommendation_request: DoctorRecommendationRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """AI-powered doctor recommendation based on symptoms"""
    if current_user["role"] != UserRole.PATIENT:
        raise HTTPException(status_code=403, detail="Only patients can get doctor recommendations")
    
    try:
        # Import OpenAI
        from openai import OpenAI
        
        # Get API key
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        client = OpenAI(api_key=api_key)
        
        # Get all specialties
        result = await db.execute(select(DBSpecialty))
        specialties = result.scalars().all()
        specialty_list = "\n".join([f"- {s.name}: {s.description}" for s in specialties])
        
        # Call OpenAI to analyze symptoms
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"You are a medical triage assistant. Based on patient symptoms, recommend the most appropriate medical specialty. Available specialties:\n{specialty_list}\n\nRespond with just the specialty name."},
                {"role": "user", "content": f"Patient symptoms: {recommendation_request.symptoms}"}
            ],
            max_tokens=50
        )
        
        recommended_specialty = response.choices[0].message.content.strip()
        
        # Find matching specialty
        result = await db.execute(
            select(DBSpecialty).where(DBSpecialty.name.like(f"%{recommended_specialty}%"))
        )
        specialty = result.scalar_one_or_none()
        
        if specialty:
            # Get doctors in this specialty
            result = await db.execute(
                select(DBDoctor, DBUser).join(
                    DBUser, DBDoctor.user_id == DBUser.id
                ).where(
                    and_(
                        DBDoctor.specialty_id == specialty.id,
                        DBDoctor.status == "approved"
                    )
                )
            )
            rows = result.all()
            
            doctors = []
            for doctor, user in rows:
                doctor_dict = db_to_dict(doctor)
                doctor_dict["full_name"] = user.full_name
                doctor_dict["specialty_name"] = specialty.name
                doctors.append(doctor_dict)
            
            return {
                "recommended_specialty": specialty.name,
                "specialty_id": specialty.id,
                "doctors": doctors,
                "reason": f"Based on your symptoms, we recommend seeing a {specialty.name} specialist."
            }
        else:
            return {
                "recommended_specialty": "General Practitioner",
                "specialty_id": None,
                "doctors": [],
                "reason": "We recommend consulting a general practitioner for initial assessment."
            }
    
    except Exception as e:
        logger.error(f"AI recommendation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@api_router.post("/ai/summarize-conversation/{appointment_id}")
async def ai_summarize_conversation(
    appointment_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """AI-powered conversation summarization"""
    # Verify appointment exists and user has access
    result = await db.execute(select(DBAppointment).where(DBAppointment.id == appointment_id))
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if current_user["id"] not in [appointment.patient_id, appointment.doctor_id]:
        raise HTTPException(status_code=403, detail="You don't have access to this appointment")
    
    try:
        # Get chat messages
        result = await db.execute(
            select(DBChatMessage, DBUser).join(
                DBUser, DBChatMessage.sender_id == DBUser.id
            ).where(DBChatMessage.appointment_id == appointment_id).order_by(DBChatMessage.created_at)
        )
        rows = result.all()
        
        if not rows:
            raise HTTPException(status_code=404, detail="No conversation found")
        
        # Build conversation text
        conversation = "\n".join([f"{sender.full_name}: {message.message}" for message, sender in rows])
        
        # Import OpenAI
        from openai import OpenAI
        
        # Get API key
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        client = OpenAI(api_key=api_key)
        
        # Call OpenAI to summarize
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a medical assistant. Summarize the following doctor-patient conversation, highlighting key symptoms, diagnosis, and treatment recommendations."},
                {"role": "user", "content": conversation}
            ],
            max_tokens=300
        )
        
        summary = response.choices[0].message.content
        
        return {"summary": summary}
    
    except Exception as e:
        logger.error(f"AI summarization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@api_router.get("/ai/chat-history")
async def get_ai_chat_history(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get AI chat history for current user"""
    if current_user["role"] != UserRole.PATIENT:
        raise HTTPException(status_code=403, detail="Only patients can access chat history")
    
    # Get all chat history grouped by session
    result = await db.execute(
        select(DBAIChatHistory).where(
            DBAIChatHistory.user_id == current_user["id"]
        ).order_by(DBAIChatHistory.created_at)
    )
    history = result.scalars().all()
    
    # Group by session
    sessions = {}
    for msg in history:
        if msg.session_id not in sessions:
            sessions[msg.session_id] = []
        sessions[msg.session_id].append(db_to_dict(msg))
    
    return {
        "sessions": sessions,
        "total_messages": len(history)
    }

# Include router in app
app.include_router(api_router, prefix=API_PREFIX)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Healthcare API with MySQL", "docs": f"{API_PREFIX}/docs"}

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "database": "mysql",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# Run server directly with python server.py
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    host = os.environ.get("HOST", "0.0.0.0")
    
    logger.info(f"Starting MediSchedule Backend Server...")
    logger.info(f"Host: {host}")
    logger.info(f"Port: {port}")
    logger.info(f"API Docs: http://localhost:{port}{API_PREFIX}/docs")
    logger.info(f"Health Check: http://localhost:{port}/health")
    
    uvicorn.run(
        "server:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
