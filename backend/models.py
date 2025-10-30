from sqlalchemy import (
    Column, String, Integer, Float, Text, DateTime, Date, Time, Boolean, Enum, ForeignKey, DECIMAL, func
)
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database import Base

# ==============================
# USER
# ==============================
class User(Base):
    __tablename__ = 'users'
    __table_args__ = {"extend_existing": True}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20))
    date_of_birth = Column(Date)
    address = Column(Text)
    role = Column(Enum('patient', 'doctor', 'department_head', 'admin'), default='patient')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Quan hệ
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    admin_permissions = relationship("AdminPermission", back_populates="user", uselist=False)
    sent_messages = relationship("ChatMessage", foreign_keys="[ChatMessage.sender_id]", back_populates="sender")
    received_messages = relationship("ChatMessage", foreign_keys="[ChatMessage.receiver_id]", back_populates="receiver")
    ai_chats = relationship("AIChatHistory", back_populates="user")


# ==============================
# PATIENT
# ==============================
class Patient(Base):
    __tablename__ = 'patients'
    __table_args__ = {"extend_existing": True}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    medical_history = Column(Text)
    allergies = Column(Text)
    blood_type = Column(String(10))
    emergency_contact = Column(String(100))
    emergency_phone = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="patient_profile")


# ==============================
# DOCTOR
# ==============================
class Doctor(Base):
    __tablename__ = 'doctors'
    __table_args__ = {"extend_existing": True}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    specialty_id = Column(String(36), ForeignKey('specialties.id', ondelete='SET NULL'))
    experience_years = Column(Integer, default=0)
    consultation_fee = Column(DECIMAL(10, 2), default=0.00)
    bio = Column(Text)
    status = Column(Enum('pending', 'approved', 'rejected'), default='pending')
    approved_by = Column(String(36))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="doctor_profile")
    specialty = relationship("Specialty", back_populates="doctors")


# ==============================
# SPECIALTY
# ==============================
class Specialty(Base):
    __tablename__ = 'specialties'
    __table_args__ = {"extend_existing": True}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    doctors = relationship("Doctor", back_populates="specialty")


# ==============================
# APPOINTMENT
# ==============================
class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    date = Column(Date)
    time = Column(Time)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    payment = relationship("Payment", back_populates="appointment", uselist=False)
    chat_messages = relationship("ChatMessage", back_populates="appointment")


# ==============================
# PAYMENT
# ==============================
class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    amount = Column(Float)
    method = Column(String(50))
    status = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    appointment = relationship("Appointment", back_populates="payment")
    


# ==============================
# CHAT MESSAGE
# ==============================
class ChatMessage(Base):
    __tablename__ = "chat_messages"
    __table_args__ = {"extend_existing": True}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    appointment_id = Column(String(36), ForeignKey("appointments.id"))
    sender_id = Column(String(36), ForeignKey("users.id"))
    message = Column(Text)
    image_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    appointment = relationship("Appointment", back_populates="chat_messages")
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")                                              
    receiver_id = Column(String(36), ForeignKey("users.id"))
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")

# ==============================
# ADMIN PERMISSION
# ==============================
class AdminPermission(Base):
    __tablename__ = 'admin_permissions'
    __table_args__ = {"extend_existing": True}

    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    can_manage_doctors = Column(Boolean, default=True)
    can_manage_patients = Column(Boolean, default=True)
    can_manage_appointments = Column(Boolean, default=True)
    can_view_stats = Column(Boolean, default=True)
    can_manage_specialties = Column(Boolean, default=True)
    can_create_admins = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="admin_permissions")


# ==============================
# AI CHAT HISTORY
# ==============================
class AIChatHistory(Base):
    __tablename__ = 'ai_chat_history'
    __table_args__ = {"extend_existing": True}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    session_id = Column(String(36), nullable=False)
    role = Column(Enum('user', 'assistant'), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="ai_chats")
print("=== Base registered classes ===")
for cls in Base.registry._class_registry.keys():
    print(" -", cls)
