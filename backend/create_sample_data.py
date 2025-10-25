import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from passlib.context import CryptContext
import uuid
from datetime import datetime, timezone

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def create_sample_data():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Creating sample data...")
    
    # Get or create specialties first
    specialties = []
    specialty_names = [
        "Nội khoa", "Ngoại khoa", "Nhi khoa", "Sản phụ khoa", 
        "Tim mạch", "Thần kinh", "Da liễu", "Tai mũi họng"
    ]
    
    for name in specialty_names:
        existing = await db.specialties.find_one({"name": name})
        if not existing:
            specialty = {
                "id": str(uuid.uuid4()),
                "name": name,
                "description": f"Chuyên khoa {name}",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.specialties.insert_one(specialty)
            specialties.append(specialty)
            print(f"✓ Created specialty: {name}")
        else:
            specialties.append(existing)
    
    # Create sample patients
    patients_data = [
        {
            "email": "patient1@test.com",
            "username": "patient1",
            "password": "12345678",
            "full_name": "Nguyễn Văn A",
            "phone": "0901234567",
            "date_of_birth": "1990-01-15",
            "address": "123 Lê Lợi, Q1, TP.HCM"
        },
        {
            "email": "patient2@test.com",
            "username": "patient2",
            "password": "12345678",
            "full_name": "Trần Thị B",
            "phone": "0902345678",
            "date_of_birth": "1985-05-20",
            "address": "456 Nguyễn Huệ, Q1, TP.HCM"
        },
        {
            "email": "patient3@test.com",
            "username": "patient3",
            "password": "12345678",
            "full_name": "Lê Văn C",
            "phone": "0903456789",
            "date_of_birth": "1995-08-10",
            "address": "789 Hai Bà Trưng, Q3, TP.HCM"
        }
    ]
    
    for patient in patients_data:
        existing = await db.users.find_one({"email": patient["email"]})
        if not existing:
            user_data = {
                "id": str(uuid.uuid4()),
                "email": patient["email"],
                "username": patient["username"],
                "password": pwd_context.hash(patient["password"]),
                "full_name": patient["full_name"],
                "role": "patient",
                "phone": patient["phone"],
                "date_of_birth": patient["date_of_birth"],
                "address": patient["address"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_data)
            print(f"✓ Created patient: {patient['full_name']} ({patient['email']})")
    
    # Create sample doctors
    doctors_data = [
        {
            "email": "doctor1@test.com",
            "username": "doctor1",
            "password": "12345678",
            "full_name": "BS. Phạm Minh D",
            "phone": "0904567890",
            "specialty": "Tim mạch",
            "bio": "Bác sĩ chuyên khoa Tim mạch với 15 năm kinh nghiệm",
            "experience_years": 15,
            "consultation_fee": 300000
        },
        {
            "email": "doctor2@test.com",
            "username": "doctor2",
            "password": "12345678",
            "full_name": "BS. Hoàng Thị E",
            "phone": "0905678901",
            "specialty": "Nhi khoa",
            "bio": "Bác sĩ chuyên khoa Nhi với 10 năm kinh nghiệm",
            "experience_years": 10,
            "consultation_fee": 250000
        },
        {
            "email": "doctor3@test.com",
            "username": "doctor3",
            "password": "12345678",
            "full_name": "BS. Võ Văn F",
            "phone": "0906789012",
            "specialty": "Nội khoa",
            "bio": "Bác sĩ chuyên khoa Nội với 12 năm kinh nghiệm",
            "experience_years": 12,
            "consultation_fee": 280000
        }
    ]
    
    for doctor in doctors_data:
        existing = await db.users.find_one({"email": doctor["email"]})
        if not existing:
            # Find specialty
            specialty = await db.specialties.find_one({"name": doctor["specialty"]})
            if not specialty:
                print(f"✗ Specialty not found: {doctor['specialty']}")
                continue
            
            user_id = str(uuid.uuid4())
            user_data = {
                "id": user_id,
                "email": doctor["email"],
                "username": doctor["username"],
                "password": pwd_context.hash(doctor["password"]),
                "full_name": doctor["full_name"],
                "role": "doctor",
                "phone": doctor["phone"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_data)
            
            # Create doctor profile
            doctor_profile = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "specialty_id": specialty["id"],
                "bio": doctor["bio"],
                "experience_years": doctor["experience_years"],
                "consultation_fee": doctor["consultation_fee"],
                "status": "approved",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.doctor_profiles.insert_one(doctor_profile)
            print(f"✓ Created doctor: {doctor['full_name']} ({doctor['email']})")
    
    # Create sample department head
    dept_head_data = {
        "email": "departmenthead@test.com",
        "username": "dephead",
        "password": "12345678",
        "full_name": "Trưởng khoa Nguyễn Văn G",
        "phone": "0907890123"
    }
    
    existing = await db.users.find_one({"email": dept_head_data["email"]})
    if not existing:
        user_data = {
            "id": str(uuid.uuid4()),
            "email": dept_head_data["email"],
            "username": dept_head_data["username"],
            "password": pwd_context.hash(dept_head_data["password"]),
            "full_name": dept_head_data["full_name"],
            "role": "department_head",
            "phone": dept_head_data["phone"],
            "admin_permissions": {
                "can_manage_doctors": True,
                "can_manage_patients": True,
                "can_manage_appointments": True,
                "can_view_stats": True,
                "can_manage_specialties": False,
                "can_create_admins": False
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_data)
        print(f"✓ Created department head: {dept_head_data['full_name']} ({dept_head_data['email']})")
    
    print("\n" + "="*60)
    print("Sample data created successfully!")
    print("="*60)
    print("\nLogin credentials:")
    print("\n📋 PATIENTS:")
    print("  Email: patient1@test.com | Username: patient1 | Password: 123456")
    print("  Email: patient2@test.com | Username: patient2 | Password: 123456")
    print("  Email: patient3@test.com | Username: patient3 | Password: 123456")
    print("\n👨‍⚕️ DOCTORS:")
    print("  Email: doctor1@test.com | Username: doctor1 | Password: 123456")
    print("  Email: doctor2@test.com | Username: doctor2 | Password: 123456")
    print("  Email: doctor3@test.com | Username: doctor3 | Password: 123456")
    print("\n👔 DEPARTMENT HEAD:")
    print("  Email: departmenthead@test.com | Username: dephead | Password: 123456")
    print("\n🔐 ADMIN:")
    print("  Email: admin@medischedule.com | Username: admin | Password: 123456")
    print("="*60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_sample_data())
