# 🏥 MediSchedule - Windows Local Edition

> **Hệ thống quản lý bệnh viện chạy hoàn toàn trên Windows Local**  
> **ID số tự động tăng - Không mã hóa UUID**

---

## 🎯 Tổng quan

Phiên bản này được tối ưu hóa để chạy hoàn toàn trên Windows local với:

- ✅ MySQL/MariaDB với ID số tự động tăng (1, 2, 3, 4...)
- ✅ Frontend chạy trên port 3050
- ✅ Backend chạy trên port 8001
- ✅ Không cần Docker, Kubernetes hay bất kỳ container nào
- ✅ Dễ dàng debug và phát triển

---

## 📋 Yêu cầu hệ thống

### Phần mềm cần cài đặt:

1. **Python 3.9+**
   - Tải: https://www.python.org/downloads/
   - ✅ Chọn "Add Python to PATH" khi cài đặt

2. **Node.js 16+**
   - Tải: https://nodejs.org/
   - Khuyến nghị: Version 18 LTS

3. **MySQL 8.0+** hoặc **MariaDB 10.11+**
   - Tải MySQL: https://dev.mysql.com/downloads/installer/
   - Hoặc MariaDB: https://mariadb.org/download/
   - ⚠️ **Quan trọng**: Password phải là `190705`

4. **Git** (tùy chọn)
   - Tải: https://git-scm.com/downloads

---

## 🚀 Hướng dẫn cài đặt chi tiết

### Bước 1: Cài đặt MySQL

#### 1.1 Tải và cài MySQL Installer

1. Truy cập: https://dev.mysql.com/downloads/installer/
2. Tải **mysql-installer-community** (~300MB)
3. Chạy installer:
   - Chọn **Developer Default**
   - Port: `3306` (mặc định)
   - Root Password: **`190705`** ⚠️ (bắt buộc)
   - Chọn **Use Legacy Authentication Method**

#### 1.2 Kiểm tra MySQL đã cài đặt

Mở **Command Prompt** (Nhấn Win + R, gõ `cmd`, Enter):

```cmd
mysql --version
```

Kết quả:
```
mysql  Ver 8.0.xx for Win64 on x86_64
```

#### 1.3 Đăng nhập MySQL

```cmd
mysql -u root -p190705
```

Nếu thành công, bạn sẽ thấy:
```
mysql>
```

Gõ `exit` để thoát.

---

### Bước 2: Tạo Database

#### 2.1 Tạo database medischedule

Trong Command Prompt, di chuyển đến thư mục project:

```cmd
cd C:\path\to\your\project
```

Chạy script tạo database:

```cmd
mysql -u root -p190705 < create_database_local.sql
```

✅ **Kết quả**: Database `medischedule` với 8 bảng đã được tạo:
- `users` (id: 1, 2, 3...)
- `patients` (id: 1, 2, 3...)
- `doctors` (id: 1, 2, 3...)
- `specialties` (id: 1, 2, 3...)
- `appointments` (id: 1, 2, 3...)
- `payments` (payment_id: 1, 2, 3...)
- `chat_messages` (id: 1, 2, 3...)
- `ai_chat_history` (id: 1, 2, 3...)
- `admin_permissions`

#### 2.2 Tạo dữ liệu mẫu

```cmd
cd backend
python create_sample_data_local.py
```

✅ **Dữ liệu đã tạo**:
- 1 Admin account
- 1 Department Head account
- 3 Doctor accounts
- 3 Patient accounts
- 8 Specialties

---

### Bước 3: Cài đặt Backend

#### 3.1 Tạo môi trường ảo (Virtual Environment)

```cmd
cd backend
python -m venv venv
```

#### 3.2 Kích hoạt môi trường ảo

```cmd
venv\Scripts\activate
```

Bạn sẽ thấy `(venv)` ở đầu dòng lệnh.

#### 3.3 Cài đặt thư viện Python

```cmd
pip install -r requirements.txt
```

⏳ Quá trình này mất ~2-5 phút.

#### 3.4 Kiểm tra file .env

File `backend/.env` phải có nội dung:

```env
DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule
JWT_SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080
CORS_ORIGINS=*
ENVIRONMENT=development
EMERGENT_LLM_KEY=your-emergent-llm-key-here
```

#### 3.5 Chạy Backend Server

```cmd
python server.py
```

hoặc

```cmd
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

✅ **Backend đang chạy**:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     Application startup complete.
```

🔗 **API Documentation**:
- Swagger UI: http://localhost:8001/api/docs
- ReDoc: http://localhost:8001/api/redoc
- Health Check: http://localhost:8001/health

---

### Bước 4: Cài đặt Frontend

#### 4.1 Mở Terminal mới

**Giữ nguyên terminal backend đang chạy**.  
Mở Command Prompt mới (Win + R → `cmd`).

#### 4.2 Di chuyển vào thư mục frontend

```cmd
cd C:\path\to\your\project\frontend
```

#### 4.3 Cài đặt Yarn (nếu chưa có)

```cmd
npm install -g yarn
```

#### 4.4 Cài đặt thư viện

```cmd
yarn install
```

⏳ Quá trình này mất ~3-7 phút.

#### 4.5 Kiểm tra file .env

File `frontend/.env` phải có nội dung:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
PORT=3050
WDS_SOCKET_PORT=3050
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

#### 4.6 Chạy Frontend Server

```cmd
yarn start
```

✅ **Frontend đang chạy**:
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3050
  On Your Network:  http://192.168.x.x:3050
```

Trình duyệt sẽ tự động mở ứng dụng.

---

## 🎉 Hoàn tất!

### Kiểm tra ứng dụng:

| Dịch vụ | URL | Trạng thái |
|---------|-----|------------|
| Frontend | http://localhost:3050 | ✅ |
| Backend API | http://localhost:8001 | ✅ |
| API Docs | http://localhost:8001/api/docs | 📖 |
| Health Check | http://localhost:8001/health | ❤️ |

---

## 👥 Tài khoản đăng nhập

### 🔐 Tất cả tài khoản đều dùng password: `12345678`

| Vai trò | Email | Mô tả |
|---------|-------|-------|
| 👨‍💼 **Admin** | admin@medischedule.com | Quản trị toàn bộ hệ thống |
| 👨‍⚕️ **Department Head** | departmenthead@test.com | Trưởng khoa quản lý bác sĩ/bệnh nhân |
| 👨‍⚕️ **Doctor 1** | doctor1@test.com | Bác sĩ Nội khoa |
| 👨‍⚕️ **Doctor 2** | doctor2@test.com | Bác sĩ Tim mạch |
| 👨‍⚕️ **Doctor 3** | doctor3@test.com | Bác sĩ Nhi khoa |
| 👤 **Patient 1** | patient1@test.com | Bệnh nhân |
| 👤 **Patient 2** | patient2@test.com | Bệnh nhân |
| 👤 **Patient 3** | patient3@test.com | Bệnh nhân |

---

## 🗄️ Quản lý Database

### Kết nối MySQL từ Command Line

```cmd
mysql -u root -p190705
```

### Các lệnh hữu ích

```sql
-- Sử dụng database medischedule
USE medischedule;

-- Xem danh sách bảng
SHOW TABLES;

-- Xem users (ID tự động tăng)
SELECT id, email, full_name, role FROM users;

-- Xem doctors với specialty
SELECT 
    d.id, 
    u.full_name, 
    s.name as specialty, 
    d.consultation_fee 
FROM doctors d 
JOIN users u ON d.user_id = u.id 
JOIN specialties s ON d.specialty_id = s.id;

-- Xem patients
SELECT 
    p.id, 
    u.full_name, 
    u.phone, 
    p.blood_type 
FROM patients p 
JOIN users u ON p.user_id = u.id;

-- Xem appointments
SELECT 
    a.id,
    pat.full_name as patient_name,
    doc.full_name as doctor_name,
    a.appointment_date,
    a.appointment_time,
    a.status
FROM appointments a
JOIN users pat ON a.patient_id = pat.id
JOIN users doc ON a.doctor_id = doc.id;

-- Đếm số lượng theo vai trò
SELECT role, COUNT(*) as total 
FROM users 
GROUP BY role;
```

---

## 💡 Cấu trúc Database với ID tự động

### ✅ Ưu điểm ID số tự động:

1. **Dễ đọc**: ID là 1, 2, 3, 4... thay vì a1b2c3d4-e5f6-...
2. **Dễ debug**: Dễ dàng tìm kiếm và kiểm tra
3. **Hiệu suất**: Nhanh hơn UUID (integer vs string)
4. **Tiết kiệm**: Chiếm ít dung lượng hơn

### 📊 Ví dụ cấu trúc:

```sql
-- Bảng users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- 1, 2, 3, 4...
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'department_head', 'admin'),
    ...
);

-- Ví dụ dữ liệu:
| id | email                    | full_name               | role        |
|----|--------------------------|-------------------------|-------------|
| 1  | admin@medischedule.com   | Quản trị viên hệ thống  | admin       |
| 2  | departmenthead@test.com  | Trưởng Khoa Nội         | department_head |
| 3  | doctor1@test.com         | Bác sĩ Nguyễn Văn A     | doctor      |
| 4  | patient1@test.com        | Nguyễn Thị D            | patient     |
```

---

## 🛠️ Troubleshooting (Khắc phục sự cố)

### ❌ Lỗi: "Access denied for user 'root'@'localhost'"

**Nguyên nhân**: Password MySQL không đúng

**Giải pháp**:

1. Reset password MySQL:
```cmd
mysqladmin -u root password 190705
```

2. Hoặc sửa file `backend/.env`:
```env
DATABASE_URL=mysql+aiomysql://root:YOUR_PASSWORD@localhost:3306/medischedule
```

---

### ❌ Lỗi: "Can't connect to MySQL server"

**Nguyên nhân**: MySQL service chưa chạy

**Giải pháp**:

1. Mở **Services**:
   - Nhấn `Win + R`
   - Gõ `services.msc`
   - Enter

2. Tìm **MySQL80** hoặc **MySQL**

3. Click chuột phải → **Start** hoặc **Restart**

---

### ❌ Lỗi: "Port 3050 already in use"

**Nguyên nhân**: Port đã được sử dụng bởi ứng dụng khác

**Giải pháp**:

1. Đổi port trong `frontend/.env`:
```env
PORT=3051
WDS_SOCKET_PORT=3051
```

2. Hoặc tìm và tắt ứng dụng đang dùng port 3050:
```cmd
netstat -ano | findstr :3050
taskkill /PID <PID_NUMBER> /F
```

---

### ❌ Lỗi: "Module not found"

**Backend**:
```cmd
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend**:
```cmd
cd frontend
yarn install
```

---

### ❌ Lỗi: "CORS policy blocked"

**Nguyên nhân**: Backend chưa cho phép Frontend kết nối

**Giải pháp**:

Kiểm tra `backend/.env`:
```env
CORS_ORIGINS=*
```

Restart backend server.

---

### ❌ Frontend không hiển thị dữ liệu

**Kiểm tra**:

1. Backend đang chạy: http://localhost:8001/health
2. Database có dữ liệu:
```cmd
mysql -u root -p190705
USE medischedule;
SELECT COUNT(*) FROM users;
```

3. Frontend config đúng URL:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 🎯 Tính năng đã triển khai

### ✅ Hoàn thành 100%

- ✅ Đăng ký / Đăng nhập
- ✅ Quản lý bệnh nhân
- ✅ Quản lý bác sĩ
- ✅ Đặt lịch khám (Online/Offline)
- ✅ Chat bệnh nhân - bác sĩ
- ✅ Chia sẻ hình ảnh trong chat
- ✅ Thanh toán (Mock - VietQR, Bank Transfer)
- ✅ Quản lý chuyên khoa
- ✅ Admin Dashboard
- ✅ Department Head Dashboard
- ✅ Đa ngôn ngữ (Tiếng Việt / English)
- ✅ Responsive Design

---

## 📱 Sử dụng ứng dụng

### 🏠 Trang chủ

1. Mở http://localhost:3050
2. Trang landing page với giới thiệu dịch vụ
3. Click **Đăng nhập** hoặc **Đăng ký**

### 👤 Đăng ký tài khoản mới

1. Click **Đăng ký**
2. Nhập thông tin:
   - Email
   - Username
   - Password (8-20 ký tự)
   - Họ tên
   - Số điện thoại
   - Ngày sinh
   - Địa chỉ
3. Click **Đăng ký**

### 🔐 Đăng nhập

1. Click **Đăng nhập**
2. Nhập email hoặc username
3. Nhập password
4. Click **Đăng nhập**

### 👨‍⚕️ Tìm bác sĩ (Patient)

1. Đăng nhập với tài khoản patient
2. Click **Tìm bác sĩ**
3. Chọn chuyên khoa
4. Xem danh sách bác sĩ
5. Click **Đặt lịch khám**

### 📅 Đặt lịch khám

1. Chọn bác sĩ
2. Chọn ngày khám
3. Chọn giờ khám
4. Chọn loại: **Online** hoặc **Offline**
5. Nhập triệu chứng
6. Click **Đặt lịch**

### 💳 Thanh toán

1. Vào menu **Thanh toán**
2. Xem danh sách đơn hàng
3. Click **Thanh toán ngay**
4. Chọn phương thức:
   - **Ví điện tử**: Quét mã VietQR
   - **Chuyển khoản**: Copy thông tin ngân hàng
5. Click **Xác nhận thanh toán**

### 💬 Chat với bác sĩ

1. Vào **Lịch hẹn**
2. Click vào lịch hẹn đã xác nhận
3. Mở chat
4. Gửi tin nhắn
5. Chia sẻ hình ảnh (click icon 🖼️)

---

## 🔧 Development (Phát triển)

### Cấu trúc thư mục

```
medischedule/
├── backend/
│   ├── server.py                 # Main FastAPI app
│   ├── models.py                 # SQLAlchemy models (Integer IDs)
│   ├── database.py               # Database connection
│   ├── chat_utils.py             # Chat image upload
│   ├── .env                      # Environment variables
│   ├── requirements.txt          # Python dependencies
│   └── uploads/                  # Uploaded images
│       └── chat_images/
├── frontend/
│   ├── src/
│   │   ├── pages/               # React pages
│   │   ├── components/          # Reusable components
│   │   ├── contexts/            # React contexts
│   │   └── App.js               # Main React app
│   ├── public/
│   ├── .env                     # Frontend config
│   └── package.json             # Node dependencies
├── create_database_local.sql    # Database schema
├── create_sample_data_local.py  # Sample data script
├── SETUP_WINDOWS_LOCAL.md       # Setup guide
└── README_WINDOWS_LOCAL.md      # This file
```

### Hot Reload

- **Backend**: Auto-reload khi thay đổi code Python
- **Frontend**: Auto-reload khi thay đổi code React

### Restart Services

**Backend**:
```cmd
# Ctrl + C để dừng
python server.py
```

**Frontend**:
```cmd
# Ctrl + C để dừng
yarn start
```

---

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user hiện tại

### Appointments

- `GET /api/appointments/my` - Lịch hẹn của tôi
- `POST /api/appointments` - Tạo lịch hẹn mới
- `PUT /api/appointments/{id}` - Cập nhật lịch hẹn
- `DELETE /api/appointments/{id}` - Hủy lịch hẹn

### Doctors

- `GET /api/doctors` - Danh sách bác sĩ
- `GET /api/doctors/{id}` - Chi tiết bác sĩ
- `GET /api/doctors/specialty/{specialty_id}` - Bác sĩ theo chuyên khoa

### Chat

- `GET /api/chat/{appointment_id}` - Tin nhắn của lịch hẹn
- `POST /api/chat/send` - Gửi tin nhắn
- `POST /api/chat/upload-image` - Upload hình ảnh

### Payments

- `GET /api/payments/my` - Lịch sử thanh toán
- `POST /api/payments/{id}/process` - Xử lý thanh toán

### Admin

- `GET /api/admin/stats` - Thống kê
- `GET /api/admin/users` - Quản lý users
- `POST /api/admin/create-user` - Tạo user

Xem đầy đủ: http://localhost:8001/api/docs

---

## 📞 Hỗ trợ

### Logs

**Backend logs**: Terminal đang chạy backend

**Frontend logs**: 
- Terminal đang chạy frontend
- Browser Console (F12)

**Database logs**:
```cmd
mysql -u root -p190705
SHOW ENGINE INNODB STATUS;
```

### Kiểm tra kết nối

```cmd
# Backend health check
curl http://localhost:8001/health

# Database connection
mysql -u root -p190705 -e "SELECT 1"

# Frontend
curl http://localhost:3050
```

---

## 🎓 Tips & Best Practices

### 1. Luôn backup database trước khi thay đổi

```cmd
mysqldump -u root -p190705 medischedule > backup.sql
```

### 2. Restore database từ backup

```cmd
mysql -u root -p190705 medischedule < backup.sql
```

### 3. Clear cache khi cập nhật code

**Backend**: Restart server (Ctrl + C, chạy lại)

**Frontend**:
```cmd
yarn start
# Hoặc
Ctrl + F5 trong browser
```

### 4. Xem logs chi tiết

**Backend**: Thêm vào `server.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend**: Mở Console (F12)

---

## 🚀 Next Steps

### Sau khi cài đặt thành công:

1. ✅ Đăng nhập với các tài khoản test
2. ✅ Tạo lịch hẹn test
3. ✅ Test chat và upload hình
4. ✅ Test thanh toán
5. ✅ Explore tất cả tính năng

### Nâng cao:

- Thêm bác sĩ mới
- Thêm chuyên khoa mới
- Customize giao diện
- Thêm tính năng mới

---

## 📄 License

MIT License - Free to use and modify

---

**Made with ❤️ for Windows Local Development**  
*Version 2.0 - Integer IDs Edition*  
*Last updated: 2025*
