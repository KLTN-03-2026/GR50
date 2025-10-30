"""
Create sample data for MySQL database
"""
import asyncio
import os
import uuid
from datetime import datetime, date, time
from pathlib import Path
from dotenv import load_dotenv
from passlib.context import CryptContext
from sqlalchemy import select
from database import AsyncSessionLocal
from models import (
    User as DBUser, 
    Patient as DBPatient, 
    Doctor as DBDoctor,
    Specialty as DBSpecialty, 
    AdminPermission as DBAdminPermission
)

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

async def create_sample_data():
    async with AsyncSessionLocal() as db:
        print("Creating sample data...")
        
        # Create specialties
        specialties = [
            {"name": "Tim mạch", "description": "Chuyên khoa tim mạch"},
            {"name": "Nội khoa", "description": "Chuyên khoa nội tổng quát"},
            {"name": "Ngoại khoa", "description": "Chuyên khoa ngoại tổng quát"},
            {"name": "Nhi khoa", "description": "Chuyên khoa nhi"},
            {"name": "Sản phụ khoa", "description": "Chuyên khoa sản phụ khoa"},
            {"name": "Răng hàm mặt", "description": "Chuyên khoa răng hàm mặt"},
            {"name": "Da liễu", "description": "Chuyên khoa da liễu"},
            {"name": "Mắt", "description": "Chuyên khoa mắt"}
        ]
        
        specialty_ids = []
        for spec in specialties:
            result = await db.execute(select(DBSpecialty).where(DBSpecialty.name == spec["name"]))
            existing = result.scalar_one_or_none()
            if not existing:
                spec_id = str(uuid.uuid4())
                db_specialty = DBSpecialty(
                    id=spec_id,
                    name=spec["name"],
                    description=spec["description"]
                )
                db.add(db_specialty)
                specialty_ids.append(spec_id)
                print(f"✓ Created specialty: {spec['name']}")
            else:
                specialty_ids.append(existing.id)
                print(f"- Specialty already exists: {spec['name']}")
        
        await db.commit()
        
        # Create admin if not exists
        result = await db.execute(select(DBUser).where(DBUser.email == "admin@medischedule.com"))
        admin = result.scalar_one_or_none()
        if not admin:
            admin_id = str(uuid.uuid4())
            admin_user = DBUser(
                id=admin_id,
                email="admin@medischedule.com",
                username="admin",
                password=pwd_context.hash("12345678"),
                full_name="System Administrator",
                phone="0123456789",
                role="admin"
            )
            db.add(admin_user)
            
            admin_permissions = DBAdminPermission(
                user_id=admin_id,
                can_manage_doctors=True,
                can_manage_patients=True,
                can_manage_appointments=True,
                can_view_stats=True,
                can_manage_specialties=True,
                can_create_admins=True
            )
            db.add(admin_permissions)
            print("✓ Created admin account")
        else:
            print("- Admin already exists")
        
        await db.commit()
        
        # Create department head
        result = await db.execute(select(DBUser).where(DBUser.email == "departmenthead@test.com"))
        dept_head = result.scalar_one_or_none()
        if not dept_head:
            dept_head_id = str(uuid.uuid4())
            dept_head_user = DBUser(
                id=dept_head_id,
                email="departmenthead@test.com",
                username="deptheaduser",
                password=pwd_context.hash("12345678"),
                full_name="Department Head",
                phone="0123456790",
                role="department_head"
            )
            db.add(dept_head_user)
            print("✓ Created department head account")
        else:
            print("- Department head already exists")
        
        await db.commit()
        
        # Create sample doctors
        doctors_data = [
            {"email": "doctor1@test.com", "username": "doctor1", "full_name": "Dr. Nguyễn Văn A", "phone": "0123456781", "specialty_idx": 0, "exp": 10, "fee": 200000},
            {"email": "doctor2@test.com", "username": "doctor2", "full_name": "Dr. Trần Thị B", "phone": "0123456782", "specialty_idx": 1, "exp": 8, "fee": 180000},
            {"email": "doctor3@test.com", "username": "doctor3", "full_name": "Dr. Lê Văn C", "phone": "0123456783", "specialty_idx": 2, "exp": 12, "fee": 250000},
        ]
        
        for doc in doctors_data:
            result = await db.execute(select(DBUser).where(DBUser.email == doc["email"]))
            existing = result.scalar_one_or_none()
            if not existing:
                user_id = str(uuid.uuid4())
                doctor_id = str(uuid.uuid4())
                
                db_user = DBUser(
                    id=user_id,
                    email=doc["email"],
                    username=doc["username"],
                    password=pwd_context.hash("12345678"),
                    full_name=doc["full_name"],
                    phone=doc["phone"],
                    role="doctor"
                )
                db.add(db_user)
                
                db_doctor = DBDoctor(
                    id=doctor_id,
                    user_id=user_id,
                    specialty_id=specialty_ids[doc["specialty_idx"]] if doc["specialty_idx"] < len(specialty_ids) else None,
                    experience_years=doc["exp"],
                    consultation_fee=doc["fee"],
                    bio=f"Bác sĩ {doc['full_name']} với {doc['exp']} năm kinh nghiệm",
                    status="approved"
                )
                db.add(db_doctor)
                print(f"✓ Created doctor: {doc['full_name']}")
            else:
                print(f"- Doctor already exists: {doc['email']}")
        
        await db.commit()
        
        # Create sample patients
        patients_data = [
            {"email": "patient1@test.com", "username": "patient1", "full_name": "Nguyễn Văn X", "phone": "0123456791"},
            {"email": "patient2@test.com", "username": "patient2", "full_name": "Trần Thị Y", "phone": "0123456792"},
            {"email": "patient3@test.com", "username": "patient3", "full_name": "Lê Văn Z", "phone": "0123456793"},
        ]
        
        for pat in patients_data:
            result = await db.execute(select(DBUser).where(DBUser.email == pat["email"]))
            existing = result.scalar_one_or_none()
            if not existing:
                user_id = str(uuid.uuid4())
                patient_id = str(uuid.uuid4())
                
                db_user = DBUser(
                    id=user_id,
                    email=pat["email"],
                    username=pat["username"],
                    password=pwd_context.hash("12345678"),
                    full_name=pat["full_name"],
                    phone=pat["phone"],
                    role="patient"
                )
                db.add(db_user)
                
                db_patient = DBPatient(
                    id=patient_id,
                    user_id=user_id
                )
                db.add(db_patient)
                print(f"✓ Created patient: {pat['full_name']}")
            else:
                print(f"- Patient already exists: {pat['email']}")
        
        await db.commit()
        
        print("\n" + "="*50)
        print("✅ Sample data created successfully!")
        print("="*50)
        print("\n📋 TEST ACCOUNTS:")
        print("-" * 50)
        print("Admin:")
        print("  Email: admin@medischedule.com")
        print("  Password: 12345678")
        print("\nDepartment Head:")
        print("  Email: departmenthead@test.com")
        print("  Password: 12345678")
        print("\nDoctors:")
        print("  Email: doctor1@test.com | Password: 12345678")
        print("  Email: doctor2@test.com | Password: 12345678")
        print("  Email: doctor3@test.com | Password: 12345678")
        print("\nPatients:")
        print("  Email: patient1@test.com | Password: 12345678")
        print("  Email: patient2@test.com | Password: 12345678")
        print("  Email: patient3@test.com | Password: 12345678")
        print("-" * 50)

if __name__ == "__main__":
    asyncio.run(create_sample_data())
