import asyncio
from database import AsyncSessionLocal
from models import User as DBUser, Patient as DBPatient, Doctor as DBDoctor, Specialty as DBSpecialty
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_sample():
    async with AsyncSessionLocal() as db:
        # Create specialties
        specialties = [
            ("Tim mạch", "Chuyên khoa tim mạch"),
            ("Nội khoa", "Chuyên khoa nội tổng quát"),
            ("Ngoại khoa", "Chuyên khoa phẫu thuật"),
            ("Da liễu", "Chuyên khoa da liễu"),
            ("Nhi khoa", "Chuyên khoa nhi"),
            ("Sản khoa", "Chuyên khoa sản phụ khoa"),
            ("Mắt", "Chuyên khoa mắt"),
            ("Tai mũi họng", "Chuyên khoa tai mũi họng")
        ]
        
        spec_ids = []
        for name, desc in specialties:
            spec = DBSpecialty(name=name, description=desc)
            db.add(spec)
            await db.flush()
            spec_ids.append(spec.id)
        
        await db.commit()
        print(f"✓ Created {len(specialties)} specialties")
        
        # Create department head
        dept_head = DBUser(
            email="departmenthead@test.com",
            username="departmenthead",
            password=pwd_context.hash("12345678"),
            full_name="Trưởng Khoa",
            role="department_head"
        )
        db.add(dept_head)
        await db.commit()
        print("✓ Created department head")
        
        # Create 3 doctors
        for i in range(1, 4):
            doctor_user = DBUser(
                email=f"doctor{i}@test.com",
                username=f"doctor{i}",
                password=pwd_context.hash("12345678"),
                full_name=f"Bác sĩ {i}",
                phone=f"098765432{i}",
                role="doctor"
            )
            db.add(doctor_user)
            await db.flush()
            
            doctor_profile = DBDoctor(
                user_id=doctor_user.id,
                specialty_id=spec_ids[i % len(spec_ids)],
                experience_years=5 + i,
                consultation_fee=200000.00,
                bio=f"Bác sĩ có {5+i} năm kinh nghiệm",
                status="approved"
            )
            db.add(doctor_profile)
        
        await db.commit()
        print("✓ Created 3 doctors")
        
        # Create 3 patients
        for i in range(1, 4):
            patient_user = DBUser(
                email=f"patient{i}@test.com",
                username=f"patient{i}",
                password=pwd_context.hash("12345678"),
                full_name=f"Bệnh nhân {i}",
                phone=f"099988877{i}",
                role="patient"
            )
            db.add(patient_user)
            await db.flush()
            
            patient_profile = DBPatient(
                user_id=patient_user.id,
                blood_type="O",
                emergency_contact=f"Người nhà {i}",
                emergency_phone=f"098765000{i}"
            )
            db.add(patient_profile)
        
        await db.commit()
        print("✓ Created 3 patients")
        
        print("\n✅ Sample data created successfully!")
        print("\nTest accounts:")
        print("Admin: admin@medischedule.com / 12345678")
        print("Department Head: departmenthead@test.com / 12345678")
        print("Doctor: doctor1@test.com / 12345678")
        print("Patient: patient1@test.com / 12345678")

if __name__ == "__main__":
    asyncio.run(create_sample())
