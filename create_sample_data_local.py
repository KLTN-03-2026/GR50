import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from datetime import datetime, date, time
from models import User, Patient, Doctor, Specialty, Appointment, Payment, AdminPermission
from database import Base

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database connection
DATABASE_URL = "mysql+aiomysql://root:190705@localhost:3306/medischedule"

async def create_sample_data():
    print("🚀 Bắt đầu tạo dữ liệu mẫu cho Windows Local...")
    
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            print("\n📋 Tạo Specialties (Chuyên khoa)...")
            specialties_data = [
                {"name": "Nội khoa", "description": "Khám và điều trị các bệnh về nội tạng"},
                {"name": "Ngoại khoa", "description": "Phẫu thuật và điều trị các bệnh ngoại khoa"},
                {"name": "Tim mạch", "description": "Chuyên khoa về tim và mạch máu"},
                {"name": "Thần kinh", "description": "Điều trị các bệnh về thần kinh"},
                {"name": "Da liễu", "description": "Chuyên khoa về da và các bệnh về da"},
                {"name": "Nhi khoa", "description": "Khám và điều trị bệnh cho trẻ em"},
                {"name": "Sản phụ khoa", "description": "Chăm sóc sức khỏe phụ nữ và thai sản"},
                {"name": "Tai mũi họng", "description": "Điều trị các bệnh về tai, mũi, họng"}
            ]
            
            for spec_data in specialties_data:
                specialty = Specialty(**spec_data)
                session.add(specialty)
            
            await session.commit()
            print("✅ Đã tạo 8 chuyên khoa")
            
            print("\n👨‍💼 Tạo Admin account...")
            admin_user = User(
                email="admin@medischedule.com",
                username="admin",
                password=pwd_context.hash("12345678"),
                full_name="Quản trị viên hệ thống",
                phone="0123456789",
                role="admin",
                date_of_birth=date(1985, 1, 1),
                address="Hà Nội, Việt Nam"
            )
            session.add(admin_user)
            await session.flush()
            
            admin_permission = AdminPermission(
                user_id=admin_user.id,
                can_manage_doctors=True,
                can_manage_patients=True,
                can_manage_appointments=True,
                can_view_stats=True,
                can_manage_specialties=True,
                can_create_admins=True
            )
            session.add(admin_permission)
            await session.commit()
            print(f"✅ Admin account created: admin@medischedule.com / 12345678 (ID: {admin_user.id})")
            
            print("\n👨‍⚕️ Tạo Department Head account...")
            dept_head_user = User(
                email="departmenthead@test.com",
                username="depthead",
                password=pwd_context.hash("12345678"),
                full_name="Trưởng Khoa Nội",
                phone="0987654321",
                role="department_head",
                date_of_birth=date(1980, 5, 15),
                address="TP. Hồ Chí Minh, Việt Nam"
            )
            session.add(dept_head_user)
            await session.commit()
            print(f"✅ Department Head account created: departmenthead@test.com / 12345678 (ID: {dept_head_user.id})")
            
            print("\n👨‍⚕️ Tạo Doctor accounts...")
            doctors_data = [
                {
                    "email": "doctor1@test.com",
                    "username": "doctor1",
                    "full_name": "Bác sĩ Nguyễn Văn A",
                    "phone": "0901234567",
                    "specialty_id": 1,  # Nội khoa
                    "experience_years": 10,
                    "consultation_fee": 200000,
                    "bio": "Chuyên gia về nội khoa với 10 năm kinh nghiệm"
                },
                {
                    "email": "doctor2@test.com",
                    "username": "doctor2",
                    "full_name": "Bác sĩ Trần Thị B",
                    "phone": "0902345678",
                    "specialty_id": 3,  # Tim mạch
                    "experience_years": 15,
                    "consultation_fee": 300000,
                    "bio": "Chuyên gia về tim mạch với 15 năm kinh nghiệm"
                },
                {
                    "email": "doctor3@test.com",
                    "username": "doctor3",
                    "full_name": "Bác sĩ Lê Văn C",
                    "phone": "0903456789",
                    "specialty_id": 6,  # Nhi khoa
                    "experience_years": 8,
                    "consultation_fee": 150000,
                    "bio": "Chuyên gia về nhi khoa với 8 năm kinh nghiệm"
                }
            ]
            
            for doc_data in doctors_data:
                doctor_user = User(
                    email=doc_data["email"],
                    username=doc_data["username"],
                    password=pwd_context.hash("12345678"),
                    full_name=doc_data["full_name"],
                    phone=doc_data["phone"],
                    role="doctor",
                    date_of_birth=date(1985, 3, 20),
                    address="Hà Nội, Việt Nam"
                )
                session.add(doctor_user)
                await session.flush()
                
                doctor_profile = Doctor(
                    user_id=doctor_user.id,
                    specialty_id=doc_data["specialty_id"],
                    experience_years=doc_data["experience_years"],
                    consultation_fee=doc_data["consultation_fee"],
                    bio=doc_data["bio"],
                    status="approved"
                )
                session.add(doctor_profile)
                print(f"✅ Doctor created: {doc_data['email']} / 12345678 (ID: {doctor_user.id})")
            
            await session.commit()
            print("✅ Đã tạo 3 bác sĩ")
            
            print("\n👥 Tạo Patient accounts...")
            patients_data = [
                {
                    "email": "patient1@test.com",
                    "username": "patient1",
                    "full_name": "Nguyễn Thị D",
                    "phone": "0911111111"
                },
                {
                    "email": "patient2@test.com",
                    "username": "patient2",
                    "full_name": "Trần Văn E",
                    "phone": "0922222222"
                },
                {
                    "email": "patient3@test.com",
                    "username": "patient3",
                    "full_name": "Lê Thị F",
                    "phone": "0933333333"
                }
            ]
            
            for pat_data in patients_data:
                patient_user = User(
                    email=pat_data["email"],
                    username=pat_data["username"],
                    password=pwd_context.hash("12345678"),
                    full_name=pat_data["full_name"],
                    phone=pat_data["phone"],
                    role="patient",
                    date_of_birth=date(1990, 7, 10),
                    address="Hà Nội, Việt Nam"
                )
                session.add(patient_user)
                await session.flush()
                
                patient_profile = Patient(
                    user_id=patient_user.id,
                    blood_type="O+",
                    emergency_contact="Người thân",
                    emergency_phone="0999999999"
                )
                session.add(patient_profile)
                print(f"✅ Patient created: {pat_data['email']} / 12345678 (ID: {patient_user.id})")
            
            await session.commit()
            print("✅ Đã tạo 3 bệnh nhân")
            
            print("\n" + "="*60)
            print("🎉 TẠO DỮ LIỆU MẪU THÀNH CÔNG!")
            print("="*60)
            print("\n📋 DANH SÁCH TÀI KHOẢN TEST:")
            print("\n👨‍💼 Admin:")
            print("   Email: admin@medischedule.com")
            print("   Password: 12345678")
            print("\n👨‍⚕️ Department Head:")
            print("   Email: departmenthead@test.com")
            print("   Password: 12345678")
            print("\n👨‍⚕️ Doctors:")
            print("   Email: doctor1@test.com / doctor2@test.com / doctor3@test.com")
            print("   Password: 12345678")
            print("\n👥 Patients:")
            print("   Email: patient1@test.com / patient2@test.com / patient3@test.com")
            print("   Password: 12345678")
            print("\n" + "="*60)
            
        except Exception as e:
            print(f"\n❌ LỖI: {e}")
            await session.rollback()
            raise
        finally:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_sample_data())
