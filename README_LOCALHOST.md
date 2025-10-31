# 🏥 MediSchedule - Hướng Dẫn Chạy Trên Localhost

## ✅ Trạng Thái Hiện Tại
Ứng dụng đã được cấu hình hoàn chỉnh để chạy trên localhost với MySQL database.

### Cài Đặt Đã Hoàn Thành
- ✅ MySQL/MariaDB server đã được cài đặt và khởi động
- ✅ Database `medischedule` đã được tạo
- ✅ 8 tables đã được tạo (users, patients, doctors, specialties, appointments, chat_messages, ai_chat_history, admin_permissions)
- ✅ Admin account và sample data đã được tạo
- ✅ Backend đã kết nối MySQL thành công
- ✅ Frontend đang chạy
- ✅ Authentication system hoạt động 100%

---

## 🔐 Tài Khoản Test

### Admin
```
Email: admin@medischedule.com
Password: 12345678
```

### Department Head (Trưởng Khoa)
```
Email: departmenthead@test.com
Password: 12345678
```

### Doctors (Bác Sĩ)
```
Email: doctor1@test.com | Password: 12345678
Email: doctor2@test.com | Password: 12345678
Email: doctor3@test.com | Password: 12345678
```

### Patients (Bệnh Nhân)
```
Email: patient1@test.com | Password: 12345678
Email: patient2@test.com | Password: 12345678
Email: patient3@test.com | Password: 12345678
```

---

## 🚀 Cách Chạy Ứng Dụng

### 1. Kiểm Tra Services
```bash
sudo supervisorctl status
```

Kết quả mong đợi:
```
backend    RUNNING
frontend   RUNNING
```

### 2. Khởi Động MySQL (Nếu chưa chạy)
```bash
# Kiểm tra MySQL
mysql -u root -p190705 -e "SHOW DATABASES;"

# Nếu MySQL chưa chạy:
mysqld_safe --datadir='/var/lib/mysql' > /tmp/mysql.log 2>&1 &
```

### 3. Restart Services (Nếu cần)
```bash
# Restart tất cả
sudo supervisorctl restart all

# Hoặc restart riêng lẻ
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

### 4. Kiểm Tra Backend Logs
```bash
# Xem logs backend
tail -f /var/log/supervisor/backend.err.log

# Xem logs frontend
tail -f /var/log/supervisor/frontend.err.log
```

---

## 🔧 Cấu Hình Database

### MySQL Connection
```
Host: localhost
Port: 3306
User: root
Password: 190705
Database: medischedule
```

### File Cấu Hình
Backend `.env` file (`/app/backend/.env`):
```env
# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=190705
MYSQL_DATABASE=medischedule

# Database URL for SQLAlchemy
DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

---

## 📋 Kiểm Tra Database

### Kết Nối MySQL
```bash
mysql -u root -p190705 medischedule
```

### Xem Tables
```sql
SHOW TABLES;
```

Kết quả:
```
+------------------------+
| Tables_in_medischedule |
+------------------------+
| admin_permissions      |
| ai_chat_history        |
| appointments           |
| chat_messages          |
| doctors                |
| patients               |
| specialties            |
| users                  |
+------------------------+
```

### Xem Users
```sql
SELECT id, email, username, role FROM users;
```

---

## 🧪 Test Authentication

### Test Login API
```bash
# Patient login
curl -X POST https://type-safety-backend.preview.emergentagent.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"patient1@test.com","password":"12345678"}'

# Admin login
curl -X POST https://type-safety-backend.preview.emergentagent.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin@medischedule.com","password":"12345678"}'
```

### Test Registration API
```bash
curl -X POST https://type-safety-backend.preview.emergentagent.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@test.com",
    "username":"newuser",
    "password":"12345678",
    "full_name":"Người Dùng Mới",
    "phone":"0123456789",
    "date_of_birth":"1990-01-01",
    "address":"123 Test St",
    "role":"patient"
  }'
```

---

## 🗂️ Cấu Trúc Project

```
/app/
├── backend/
│   ├── server.py                    # Main server file (MySQL version)
│   ├── database.py                  # SQLAlchemy models
│   ├── create_database.sql          # SQL schema
│   ├── create_admin_mysql.py        # Admin creation script
│   ├── create_sample_data_mysql.py  # Sample data script
│   ├── requirements.txt             # Python dependencies
│   └── .env                         # Environment variables
├── frontend/
│   ├── src/                         # React source code
│   ├── package.json                 # Node dependencies
│   └── .env                         # Frontend environment
└── README_LOCALHOST.md              # This file
```

---

## 🛠️ Troubleshooting

### Backend Không Kết Nối MySQL
```bash
# Kiểm tra MySQL
mysql -u root -p190705 -e "SELECT 'MySQL OK' as status;"

# Restart MySQL
killall mysqld
mysqld_safe --datadir='/var/lib/mysql' > /tmp/mysql.log 2>&1 &

# Restart backend
sudo supervisorctl restart backend
```

### Frontend Không Load
```bash
# Kiểm tra frontend logs
tail -f /var/log/supervisor/frontend.err.log

# Restart frontend
sudo supervisorctl restart frontend
```

### Database Connection Error
```bash
# Kiểm tra .env file
cat /app/backend/.env | grep DATABASE_URL

# Test MySQL connection
python /app/backend/test_mysql_connection.py
```

---

## 📦 Dependencies

### Backend (Python)
- fastapi
- uvicorn
- sqlalchemy==2.0.23
- aiomysql==0.2.0
- mysql-connector-python
- passlib[bcrypt]
- python-jose[cryptography]
- python-dotenv

### Frontend (React)
- react
- react-router-dom
- axios
- tailwindcss

---

## 🎯 Các Tính Năng Chính

### Admin
- ✅ Quản lý bác sĩ (duyệt/từ chối/xóa)
- ✅ Quản lý bệnh nhân
- ✅ Quản lý chuyên khoa
- ✅ Tạo tài khoản (patient, doctor, department_head)
- ✅ Quản lý admin khác với phân quyền
- ✅ Xem thống kê hệ thống

### Department Head (Trưởng Khoa)
- ✅ Tạo tài khoản bác sĩ và bệnh nhân
- ✅ Quản lý bác sĩ trong khoa
- ✅ Quản lý bệnh nhân
- ✅ Xem thống kê
- ❌ Không thể tạo admin hoặc department_head

### Doctor (Bác Sĩ)
- ✅ Xem và quản lý lịch hẹn
- ✅ Cập nhật hồ sơ cá nhân
- ✅ Chat với bệnh nhân
- ✅ Xem thống kê cá nhân

### Patient (Bệnh Nhân)
- ✅ Đăng ký tài khoản
- ✅ Tìm kiếm bác sĩ
- ✅ Đặt lịch hẹn
- ✅ Xem lịch hẹn
- ✅ Chat với bác sĩ
- ✅ Thanh toán (VietQR, Bank Transfer)

---

## 📞 Support

Nếu gặp vấn đề, vui lòng kiểm tra:
1. MySQL service đang chạy
2. Backend logs không có lỗi
3. Frontend logs không có lỗi
4. Database connection string đúng trong .env
5. Tất cả dependencies đã được cài đặt

---

## ✅ Testing Results

**Authentication System: 100% PASS** ✅
- Patient login: ✅ PASS
- Admin login: ✅ PASS
- Doctor login: ✅ PASS
- Department Head login: ✅ PASS
- New patient registration: ✅ PASS
- Wrong password rejection: ✅ PASS
- Duplicate email rejection: ✅ PASS

**Database: MySQL Connected** ✅
**Backend: Running** ✅
**Frontend: Running** ✅

---

**Chúc bạn sử dụng ứng dụng thành công! 🎉**
