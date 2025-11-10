"""
Create sample data for MySQL database on LOCAL WINDOWS machine
Run this on your Windows machine: python create_sample_data_local.py
"""
import asyncio
from datetime import datetime
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

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_sample_data():
    print("=" * 60)
    print("CREATING SAMPLE DATA FOR LOCAL WINDOWS MYSQL DATABASE")
    print("=" * 60)
    print()
    
    try:
        async with AsyncSessionLocal() as db:
            print("✓ Connected to MySQL database")
            print()
            
            # === SPECIALTIES ===
            print("Creating specialties...")
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

            specialty_count = 0
            for spec in specialties:
                result = await db.execute(select(DBSpecialty).where(DBSpecialty.name == spec["name"]))
                if not result.scalar_one_or_none():
                    db.add(DBSpecialty(name=spec["name"], description=spec["description"]))
                    print(f"  ✓ Created specialty: {spec['name']}")
                    specialty_count += 1
                else:
                    print(f"  - Specialty already exists: {spec['name']}")
            await db.commit()
            print(f"  → {specialty_count} new specialties created")
            print()

            # === ADMIN ===
            print("Creating admin account...")
            result = await db.execute(select(DBUser).where(DBUser.email == "admin@medischedule.com"))
            admin = result.scalar_one_or_none()
            if not admin:
                admin_user = DBUser(
                    email="admin@medischedule.com",
                    username="admin",
                    password=pwd_context.hash("12345678"),
                    full_name="System Administrator",
                    role="admin"
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
                print("  ✓ Created admin account: admin@medischedule.com")
            else:
                print("  - Admin already exists")
            await db.commit()
            print()

            # === DEPARTMENT HEAD ===
            print("Creating department head account...")
            result = await db.execute(select(DBUser).where(DBUser.email == "departmenthead@test.com"))
            dept = result.scalar_one_or_none()
            if not dept:
                db.add(DBUser(
                    email="departmenthead@test.com",
                    username="deptheaduser",
                    password=pwd_context.hash("12345678"),
                    full_name="Department Head",
                    role="department_head"
                ))
                print("  ✓ Created department head: departmenthead@test.com")
            else:
                print("  - Department head already exists")
            await db.commit()
            print()

            # === DOCTORS ===
            print("Creating doctor accounts...")
            doctors_data = [
                {"email": "doctor1@test.com", "username": "doctor1", "full_name": "Dr. Nguyễn Văn A", "specialty_idx": 0, "exp": 10, "fee": 200000},
                {"email": "doctor2@test.com", "username": "doctor2", "full_name": "Dr. Trần Thị B", "specialty_idx": 1, "exp": 8, "fee": 180000},
                {"email": "doctor3@test.com", "username": "doctor3", "full_name": "Dr. Lê Văn C", "specialty_idx": 2, "exp": 12, "fee": 250000},
            ]

            doctor_count = 0
            for idx, doc in enumerate(doctors_data, start=1):
                result = await db.execute(select(DBUser).where(DBUser.email == doc["email"]))
                if not result.scalar_one_or_none():
                    db_user = DBUser(
                        email=doc["email"],
                        username=doc["username"],
                        password=pwd_context.hash("12345678"),
                        full_name=doc["full_name"],
                        role="doctor"
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
                    print(f"  ✓ Created doctor: {doc['full_name']}")
                    doctor_count += 1
                else:
                    print(f"  - Doctor already exists: {doc['full_name']}")
            await db.commit()
            print(f"  → {doctor_count} new doctors created")
            print()

            # === PATIENTS ===
            print("Creating patient accounts...")
            patients_data = [
                {"email": "patient1@test.com", "username": "patient1", "full_name": "Nguyễn Văn X"},
                {"email": "patient2@test.com", "username": "patient2", "full_name": "Trần Thị Y"},
                {"email": "patient3@test.com", "username": "patient3", "full_name": "Lê Văn Z"},
            ]

            patient_count = 0
            for idx, pat in enumerate(patients_data, start=1):
                result = await db.execute(select(DBUser).where(DBUser.email == pat["email"]))
                if not result.scalar_one_or_none():
                    db_user = DBUser(
                        email=pat["email"],
                        username=pat["username"],
                        password=pwd_context.hash("12345678"),
                        full_name=pat["full_name"],
                        role="patient"
                    )
                    db.add(db_user)
                    await db.flush()
                    db.add(DBPatient(user_id=db_user.id))
                    print(f"  ✓ Created patient: {pat['full_name']}")
                    patient_count += 1
                else:
                    print(f"  - Patient already exists: {pat['full_name']}")
            await db.commit()
            print(f"  → {patient_count} new patients created")
            print()

            print("=" * 60)
            print("✅ SAMPLE DATA CREATED SUCCESSFULLY!")
            print("=" * 60)
            print()
            print("ACCOUNT INFORMATION:")
            print("-" * 60)
            print("All accounts use password: 12345678")
            print()
            print("Admin:")
            print("  Email: admin@medischedule.com")
            print("  Password: 12345678")
            print()
            print("Department Head:")
            print("  Email: departmenthead@test.com")
            print("  Password: 12345678")
            print()
            print("Doctors:")
            print("  doctor1@test.com / 12345678 (Tim mạch)")
            print("  doctor2@test.com / 12345678 (Nội khoa)")
            print("  doctor3@test.com / 12345678 (Ngoại khoa)")
            print()
            print("Patients:")
            print("  patient1@test.com / 12345678")
            print("  patient2@test.com / 12345678")
            print("  patient3@test.com / 12345678")
            print()
            print("You can now start the backend server:")
            print("  python server.py")
            print("=" * 60)
            
    except Exception as e:
        print()
        print("=" * 60)
        print("❌ ERROR OCCURRED:")
        print("=" * 60)
        print(f"Error: {str(e)}")
        print()
        print("TROUBLESHOOTING:")
        print("1. Make sure MySQL is running")
        print("2. Check your .env file has correct DATABASE_URL")
        print("3. Make sure database 'medischedule' exists")
        print("4. Run: mysql -u root -p190705 < create_database_integer_id.sql")
        print("=" * 60)
        raise

if __name__ == "__main__":
    asyncio.run(create_sample_data())
