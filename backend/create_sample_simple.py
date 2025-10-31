"""
Create simple sample data for MySQL database
"""
import asyncio
import uuid
import hashlib
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
    Appointment as DBAppointment
)

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__truncate_error=True
)

def prepare_password_for_bcrypt(password: str) -> str:
    if len(password.encode('utf-8')) > 72:
        return hashlib.sha256(password.encode('utf-8')).hexdigest()
    return password

async def create_sample_data():
    async with AsyncSessionLocal() as db:
        print("Creating sample data...")

        # === SPECIALTIES ===
        specialties_data = [
            {"name": "Tim mạch", "description": "Chuyên khoa tim mạch"},
            {"name": "Nội khoa", "description": "Chuyên khoa nội tổng quát"},
            {"name": "Ngoại khoa", "description": "Chuyên khoa ngoại tổng quát"},
            {"name": "Nhi khoa", "description": "Chuyên khoa nhi"},
            {"name": "Sản phụ khoa", "description": "Chuyên khoa sản phụ khoa"},
            {"name": "Răng hàm mặt", "description": "Chuyên khoa răng hàm mặt"},
            {"name": "Da liễu", "description": "Chuyên khoa da liễu"},
            {"name": "Mắt", "description": "Chuyên khoa mắt"},
        ]

        specialty_ids = []
        for spec in specialties_data:
            result = await db.execute(select(DBSpecialty).where(DBSpecialty.name == spec["name"]))
            existing = result.scalar_one_or_none()
            if not existing:
                spec_id = str(uuid.uuid4())
                db.add(DBSpecialty(id=spec_id, name=spec["name"], description=spec["description"]))
                specialty_ids.append(spec_id)
                print(f"✓ Created specialty: {spec['name']}")
            else:
                specialty_ids.append(existing.id)
                print(f"- Specialty already exists: {spec['name']}")
        
        await db.commit()

        # === DEPARTMENT HEAD ===
        result = await db.execute(select(DBUser).where(DBUser.email == "departmenthead@test.com"))
        if not result.scalar_one_or_none():
            dept_id = str(uuid.uuid4())
            raw_password = "12345678"
            prepared = prepare_password_for_bcrypt(raw_password)
            hashed = pwd_context.hash(prepared)
            
            db.add(DBUser(
                id=dept_id,
                email="departmenthead@test.com",
                username="deptheaduser",
                password=hashed,
                full_name="Department Head",
                phone="0123456001",
                role="department_head"
            ))
            print("✓ Created department head account")
        else:
            print("- Department head already exists")
        
        await db.commit()

        # === DOCTORS ===
        doctors_data = [
            {"email": "doctor1@test.com", "username": "doctor1", "full_name": "Dr. Nguyễn Văn A", "specialty_idx": 0, "exp": 10, "fee": 200000},
            {"email": "doctor2@test.com", "username": "doctor2", "full_name": "Dr. Trần Thị B", "specialty_idx": 1, "exp": 8, "fee": 180000},
            {"email": "doctor3@test.com", "username": "doctor3", "full_name": "Dr. Lê Văn C", "specialty_idx": 2, "exp": 12, "fee": 250000},
        ]

        doctor_user_ids = []
        for doc in doctors_data:
            result = await db.execute(select(DBUser).where(DBUser.email == doc["email"]))
            if not result.scalar_one_or_none():
                user_id = str(uuid.uuid4())
                raw_password = "12345678"
                prepared = prepare_password_for_bcrypt(raw_password)
                hashed = pwd_context.hash(prepared)
                
                db_user = DBUser(
                    id=user_id,
                    email=doc["email"],
                    username=doc["username"],
                    password=hashed,
                    full_name=doc["full_name"],
                    phone=f"09{doc['username'][-1]}000000",
                    role="doctor"
                )
                db.add(db_user)
                await db.flush()

                doctor_id = str(uuid.uuid4())
                db.add(DBDoctor(
                    id=doctor_id,
                    user_id=user_id,
                    specialty_id=specialty_ids[doc["specialty_idx"]],
                    experience_years=doc["exp"],
                    consultation_fee=doc["fee"],
                    bio=f"Bác sĩ chuyên khoa {specialties_data[doc['specialty_idx']]['name']}",
                    status="approved"
                ))
                
                doctor_user_ids.append(user_id)
                print(f"✓ Created doctor: {doc['full_name']}")
            else:
                print(f"- Doctor already exists: {doc['email']}")
        
        await db.commit()

        # === PATIENTS ===
        patients_data = [
            {"email": "patient1@test.com", "username": "patient1", "full_name": "Nguyễn Văn X"},
            {"email": "patient2@test.com", "username": "patient2", "full_name": "Trần Thị Y"},
            {"email": "patient3@test.com", "username": "patient3", "full_name": "Lê Văn Z"},
        ]

        patient_user_ids = []
        for pat in patients_data:
            result = await db.execute(select(DBUser).where(DBUser.email == pat["email"]))
            if not result.scalar_one_or_none():
                user_id = str(uuid.uuid4())
                raw_password = "12345678"
                prepared = prepare_password_for_bcrypt(raw_password)
                hashed = pwd_context.hash(prepared)
                
                db_user = DBUser(
                    id=user_id,
                    email=pat["email"],
                    username=pat["username"],
                    password=hashed,
                    full_name=pat["full_name"],
                    phone=f"08{pat['username'][-1]}000000",
                    role="patient",
                    date_of_birth=date(1990, 1, 1),
                    address="Hồ Chí Minh"
                )
                db.add(db_user)
                await db.flush()

                patient_id = str(uuid.uuid4())
                db.add(DBPatient(
                    id=patient_id,
                    user_id=user_id,
                    blood_type="O",
                    emergency_contact=pat["full_name"],
                    emergency_phone=f"08{pat['username'][-1]}000000"
                ))
                
                patient_user_ids.append(user_id)
                print(f"✓ Created patient: {pat['full_name']}")
            else:
                print(f"- Patient already exists: {pat['email']}")
        
        await db.commit()

        print("\n✅ Sample data creation completed!")
        print("\nTest accounts (password: 12345678):")
        print("- admin@medischedule.com")
        print("- departmenthead@test.com")
        print("- doctor1@test.com")
        print("- doctor2@test.com")
        print("- doctor3@test.com")
        print("- patient1@test.com")
        print("- patient2@test.com")
        print("- patient3@test.com")

if __name__ == "__main__":
    try:
        asyncio.run(create_sample_data())
    except RuntimeError as e:
        if "Event loop is closed" in str(e):
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(create_sample_data())
            loop.close()
        else:
            raise
