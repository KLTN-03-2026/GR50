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

