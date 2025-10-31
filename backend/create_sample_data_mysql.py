"""
Create sample data for MySQL database (INT-based IDs)
"""
import asyncio
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from passlib.context import CryptContext
from sqlalchemy import select
import uuid
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

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_sample_data():
    async with AsyncSessionLocal() as db:
        print("Creating sample data...")

        # === SPECIALTIES ===
        specialties = [
            {"name": "Tim mạch", "description": "Chuyên khoa tim mạch"},
            {"name": "Nội khoa", "description": "Chuyên khoa nội tổng quát"},
            {"name": "Ngoại khoa", "description": "Chuyên khoa ngoại tổng quát"},
            {"name": "Nhi khoa", "description": "Chuyên khoa nhi"},
            {"name": "Sản phụ khoa", "description": "Chuyên khoa sản phụ khoa"},
            {"name": "Răng hàm mặt", "description": "Chuyên khoa răng hàm mặt"},
            {"name": "Da liễu", "description": "Chuyên khoa da liễu"},
            {"name": "Mắt", "description": "Chuyên khoa mắt"},
        ]

        for spec in specialties:
            result = await db.execute(select(DBSpecialty).where(DBSpecialty.name == spec["name"]))
            if not result.scalar_one_or_none():
                db.add(DBSpecialty(name=spec["name"], description=spec["description"]))
                print(f"✓ Created specialty: {spec['name']}")
        await db.commit()

        # === ADMIN ===
        result = await db.execute(select(DBUser).where(DBUser.email == "admin@medischedule.com"))
        admin = result.scalar_one_or_none()
        if not admin:
            admin_user = DBUser(
                email="admin@medischedule.com",
                username="admin",
                password=pwd_context.hash("12345678"),
                full_name="System Administrator",
                role="admin",
                user_id="a_01"
            )
            db.add(admin_user)
            await db.flush()

            db.add(DBAdminPermission(
                user_id=admin_user.id,
                can_manage_doctors=True,
                can_manage_patients=True,
                can_manage_appointments=True,
                can_view_stats=True,
                can_manage_specialties=True,
                can_create_admins=True
            ))
            print("✓ Created admin account")
        else:
            print("- Admin already exists")
        await db.commit()

        # === DEPARTMENT HEAD ===
        result = await db.execute(select(DBUser).where(DBUser.email == "departmenthead@test.com"))
        dept = result.scalar_one_or_none()
        if not dept:
            db.add(DBUser(
                email="departmenthead@test.com",
                username="deptheaduser",
                password=pwd_context.hash("12345678"),
                full_name="Department Head",
                role="department_head",
                user_id="dh_01"
            ))
            print("✓ Created department head account")
        await db.commit()

        # === DOCTORS ===
        doctors_data = [
            {"email": "doctor1@test.com", "username": "doctor1", "full_name": "Dr. Nguyễn Văn A", "specialty_idx": 0, "exp": 10, "fee": 200000},
            {"email": "doctor2@test.com", "username": "doctor2", "full_name": "Dr. Trần Thị B", "specialty_idx": 1, "exp": 8, "fee": 180000},
            {"email": "doctor3@test.com", "username": "doctor3", "full_name": "Dr. Lê Văn C", "specialty_idx": 2, "exp": 12, "fee": 250000},
        ]

        for idx, doc in enumerate(doctors_data, start=1):
            result = await db.execute(select(DBUser).where(DBUser.email == doc["email"]))
            if not result.scalar_one_or_none():
                db_user = DBUser(
                    email=doc["email"],
                    username=doc["username"],
                    password=pwd_context.hash("12345678"),
                    full_name=doc["full_name"],
                    role="doctor",
                    user_id=f"d_{idx:02d}"
                )
                db.add(db_user)
                await db.flush()
                db.add(DBDoctor(
                    user_id=db_user.id,
                    specialty_id=idx,
                    experience_years=doc["exp"],
                    consultation_fee=doc["fee"],
                    bio=f"Bác sĩ {doc['full_name']} với {doc['exp']} năm kinh nghiệm",
                    status="approved"
                ))
                print(f"✓ Created doctor: {doc['full_name']}")
        await db.commit()

        # === PATIENTS ===
        patients_data = [
            {"email": "patient1@test.com", "username": "patient1", "full_name": "Nguyễn Văn X"},
            {"email": "patient2@test.com", "username": "patient2", "full_name": "Trần Thị Y"},
            {"email": "patient3@test.com", "username": "patient3", "full_name": "Lê Văn Z"},
        ]

        for idx, pat in enumerate(patients_data, start=1):
            result = await db.execute(select(DBUser).where(DBUser.email == pat["email"]))
            if not result.scalar_one_or_none():
                db_user = DBUser(
                    email=pat["email"],
                    username=pat["username"],
                    password=pwd_context.hash("12345678"),
                    full_name=pat["full_name"],
                    role="patient",
                    user_id=f"p_{idx:02d}"
                )
                db.add(db_user)
                await db.flush()
                db.add(DBPatient(user_id=db_user.id))
                print(f"✓ Created patient: {pat['full_name']}")
        await db.commit()

        print("\n✅ Sample data created successfully!\n")

if __name__ == "__main__":
    asyncio.run(create_sample_data())
