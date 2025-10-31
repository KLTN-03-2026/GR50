# 🏥 HƯỚNG DẪN CHẠY APP TRÊN LOCALHOST

## ⚠️ LƯU Ý QUAN TRỌNG
App này chỉ chạy được trên **LOCALHOST** với MySQL database. Không thể deploy lên Preview URL của Emergent do Emergent chỉ hỗ trợ MongoDB.

---

## 🔧 YÊU CẦU HỆ THỐNG

### 1. Cài đặt MySQL/MariaDB
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mariadb-server mariadb-client

# macOS
brew install mysql

# Windows
# Download từ: https://dev.mysql.com/downloads/mysql/
```

### 2. Khởi động MySQL
```bash
# Linux
sudo mysqld_safe &

# macOS
brew services start mysql

# Windows
# Khởi động MySQL service từ Services
```

### 3. Tạo Database
```bash
# Login vào MySQL với password: 190705
mysql -u root -p190705

# Tạo database
CREATE DATABASE medischedule;
```

---

## 🚀 KHỞI ĐỘNG APP

### Backend (Port 8001)
```bash
cd /app/backend

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo bảng database
python3 << 'PYTHON'
import asyncio
from database import engine, Base
from models import *

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('✅ Tables created!')
    
asyncio.run(create_tables())
PYTHON

# Tạo admin account
python3 create_admin_mysql.py

# Tạo sample data
python3 -c "
import asyncio
import uuid
from datetime import datetime, date
from passlib.context import CryptContext
from sqlalchemy import select
from database import AsyncSessionLocal
from models import User, Patient, Doctor, Specialty

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

async def create_users():
    async with AsyncSessionLocal() as db:
        # Tạo specialties
        specs = [
            {'name': 'Nội khoa', 'description': 'Chuyên khoa nội tổng quát'},
            {'name': 'Ngoại khoa', 'description': 'Chuyên khoa ngoại'},
            {'name': 'Tim mạch', 'description': 'Chuyên khoa tim mạch'},
        ]
        for spec_data in specs:
            specialty = Specialty(
                id=str(uuid.uuid4()),
                name=spec_data['name'],
                description=spec_data['description'],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(specialty)
        await db.commit()
        
        result = await db.execute(select(Specialty).limit(5))
        specialties = result.scalars().all()
        
        # Tạo doctors
        for i in range(1, 4):
            doctor_user_id = str(uuid.uuid4())
            doctor_user = User(
                id=doctor_user_id,
                email=f'doctor{i}@test.com',
                username=f'doctor{i}',
                password=pwd_context.hash('12345678'),
                full_name=f'Dr. Nguyễn Văn {chr(64+i)}',
                phone=f'090000000{i}',
                date_of_birth=date(1985, 1, i),
                role='doctor',
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(doctor_user)
            
            doctor_profile = Doctor(
                id=str(uuid.uuid4()),
                user_id=doctor_user_id,
                specialty_id=specialties[i % len(specialties)].id,
                experience_years=10 + i,
                consultation_fee=200000.0 + (i * 50000),
                bio=f'Bác sĩ chuyên khoa với {10+i} năm kinh nghiệm',
                status='approved',
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(doctor_profile)
        
        # Tạo patients
        for i in range(1, 4):
            patient_user_id = str(uuid.uuid4())
            patient_user = User(
                id=patient_user_id,
                email=f'patient{i}@test.com',
                username=f'patient{i}',
                password=pwd_context.hash('12345678'),
                full_name=f'Nguyễn Thị {chr(64+i)}',
                phone=f'091000000{i}',
                date_of_birth=date(1990, 1, i),
                role='patient',
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(patient_user)
            
            patient_profile = Patient(
                id=str(uuid.uuid4()),
                user_id=patient_user_id,
                medical_history=f'Bệnh sử {i}',
                blood_type='O',
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(patient_profile)
        
        await db.commit()
        print('✅ Sample data created!')

asyncio.run(create_users())
"

# Khởi động backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend (Port 3000)
```bash
cd /app/frontend

# Cài đặt dependencies
yarn install

# Khởi động frontend
yarn start
```

---

## 🔐 TÀI KHOẢN TEST

### Admin
- Email: `admin@medischedule.com`
- Password: `12345678`

### Bác sĩ
- `doctor1@test.com` / `12345678`
- `doctor2@test.com` / `12345678`
- `doctor3@test.com` / `12345678`

### Bệnh nhân
- `patient1@test.com` / `12345678`
- `patient2@test.com` / `12345678`
- `patient3@test.com` / `12345678`

---

## 🌐 TRUY CẬP APP

Sau khi khởi động cả Backend và Frontend:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **API Documentation:** http://localhost:8001/docs

---

## ✅ TÍNH NĂNG ĐÃ CÓ

1. ✅ Đăng nhập / Đăng ký
2. ✅ Quản lý bệnh nhân (Admin, Department Head)
3. ✅ Quản lý bác sĩ (Admin, Department Head)
4. ✅ Đặt lịch khám
5. ✅ Chat giữa bác sĩ và bệnh nhân
6. ✅ Chia sẻ hình ảnh trong chat
7. ✅ Quản lý thanh toán
8. ✅ Dashboard cho từng role (Admin, Doctor, Patient, Department Head)
9. ✅ Đa ngôn ngữ (Tiếng Việt / English)

---

## 🔧 TROUBLESHOOTING

### Lỗi kết nối MySQL
```bash
# Kiểm tra MySQL đang chạy
ps aux | grep mysqld

# Khởi động MySQL nếu chưa chạy
sudo mysqld_safe &

# Kiểm tra password MySQL trong .env
cat /app/backend/.env | grep MYSQL_PASSWORD
```

### Lỗi backend không khởi động
```bash
# Kiểm tra logs
tail -f /var/log/supervisor/backend.err.log

# Hoặc chạy trực tiếp để xem lỗi
cd /app/backend
python3 server.py
```

### Lỗi frontend không compile
```bash
# Xóa node_modules và cài lại
cd /app/frontend
rm -rf node_modules
yarn install
yarn start
```

---

## 📝 GHI CHÚ

- App này **CHỈ CHẠY ĐƯỢC TRÊN LOCALHOST** với MySQL
- **KHÔNG THỂ** deploy lên Emergent platform (Preview URL sẽ không hoạt động)
- Nếu muốn deploy online, cần sử dụng platform khác hỗ trợ MySQL như:
  - AWS (RDS MySQL)
  - Heroku + ClearDB
  - DigitalOcean + MySQL
  - Google Cloud Platform
  - VPS riêng với MySQL

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. MySQL đã khởi động chưa
2. Database `medischedule` đã tạo chưa
3. Backend port 8001 có bị chiếm chưa
4. Frontend port 3000 có bị chiếm chưa
