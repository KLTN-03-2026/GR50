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

