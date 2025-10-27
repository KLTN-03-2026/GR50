"""
Database configuration and models for MySQL with SQLAlchemy
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, Date, Time, Boolean, Enum, ForeignKey, DECIMAL
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL
DATABASE_URL = os.getenv(
    'DATABASE_URL', 
    'mysql+aiomysql://root:190705@localhost:3306/medischedule'
)

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# ========================================
# Database Models
# ========================================

class Specialty(Base):
    __tablename__ = 'specialties'
    
    id = Column(String(36), primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    doctors = relationship("Doctor", back_populates="specialty")


class User(Base):
    __tablename__ = 'users'
    
    id = Column(String(36), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20))
    date_of_birth = Column(Date)
    address = Column(Text)
    role = Column(Enum('patient', 'doctor', 'department_head', 'admin'), nullable=False, default='patient')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    admin_permissions = relationship("AdminPermission", back_populates="user", uselist=False)
    sent_messages = relationship("ChatMessage", foreign_keys="ChatMessage.sender_id", back_populates="sender")
    ai_chats = relationship("AIChatHistory", back_populates="user")


class Patient(Base):
    __tablename__ = 'patients'
    
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    medical_history = Column(Text)
    allergies = Column(Text)
    blood_type = Column(String(10))
    emergency_contact = Column(String(100))
    emergency_phone = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="patient_profile")


class Doctor(Base):
    __tablename__ = 'doctors'
    
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    specialty_id = Column(String(36), ForeignKey('specialties.id', ondelete='SET NULL'))
    experience_years = Column(Integer, default=0)
    consultation_fee = Column(DECIMAL(10, 2), default=0.00)
    bio = Column(Text)
    status = Column(Enum('pending', 'approved', 'rejected'), default='pending')
    approved_by = Column(String(36))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    specialty = relationship("Specialty", back_populates="doctors")


class Appointment(Base):
    __tablename__ = 'appointments'
    
    id = Column(String(36), primary_key=True)
    patient_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    doctor_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    status = Column(Enum('pending', 'confirmed', 'completed', 'cancelled'), default='pending')
    symptoms = Column(Text)
    diagnosis = Column(Text)
    prescription = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    chat_messages = relationship("ChatMessage", back_populates="appointment", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = 'chat_messages'
    
    id = Column(String(36), primary_key=True)
    appointment_id = Column(String(36), ForeignKey('appointments.id', ondelete='CASCADE'), nullable=False)
    sender_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    appointment = relationship("Appointment", back_populates="chat_messages")
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")


class AIChatHistory(Base):
    __tablename__ = 'ai_chat_history'
    
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    session_id = Column(String(36), nullable=False)
    role = Column(Enum('user', 'assistant'), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="ai_chats")


class AdminPermission(Base):
    __tablename__ = 'admin_permissions'
    
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    can_manage_doctors = Column(Boolean, default=True)
    can_manage_patients = Column(Boolean, default=True)
    can_manage_appointments = Column(Boolean, default=True)
    can_view_stats = Column(Boolean, default=True)
    can_manage_specialties = Column(Boolean, default=True)
    can_create_admins = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="admin_permissions")
