# 🪟 Hướng dẫn cài đặt MediSchedule trên Windows Local

> Cài đặt và chạy ứng dụng hoàn toàn trên máy tính Windows của bạn với ID số tự động tăng

---

## 📋 Yêu cầu hệ thống

- **Windows 10/11**
- **Python 3.9+** - [Tải về](https://www.python.org/downloads/)
- **Node.js 16+** - [Tải về](https://nodejs.org/)
- **MySQL 8.0+** hoặc **MariaDB 10.11+** - [Tải về](https://dev.mysql.com/downloads/installer/)
- **Git** (tùy chọn) - [Tải về](https://git-scm.com/downloads)

---

## 🚀 Bước 1: Cài đặt MySQL

### 1.1 Tải và cài đặt MySQL

1. Tải **MySQL Installer** từ: https://dev.mysql.com/downloads/installer/
2. Chọn **mysql-installer-community** (khoảng 300MB)
3. Chạy installer và chọn **Developer Default**
4. Trong quá trình cài đặt:
   - **Root Password**: `190705` (quan trọng!)
   - Chọn **Use Legacy Authentication Method**
   - Port mặc định: `3306`

### 1.2 Kiểm tra MySQL đã cài đặt

Mở **Command Prompt** (cmd) và chạy:

```cmd
mysql --version
```

Kết quả mong đợi:
```
mysql  Ver 8.0.xx for Win64 on x86_64
```

### 1.3 Đăng nhập MySQL

```cmd
mysql -u root -p190705
```

Nếu thành công, bạn sẽ thấy:
```
mysql>
```

Gõ `exit` để thoát.

---

## 🗄️ Bước 2: Tạo Database

### 2.1 Chạy script tạo database

Trong thư mục gốc của project:

```cmd
mysql -u root -p190705 < create_database_local.sql
```

✅ **Database `medischedule` đã được tạo với 8 bảng:**
- `users` - ID: 1, 2, 3, 4...
- `patients` - ID: 1, 2, 3...
- `doctors` - ID: 1, 2, 3...
- `specialties` - ID: 1, 2, 3...
- `appointments` - ID: 1, 2, 3...
- `payments` - ID: 1, 2, 3...
- `chat_messages` - ID: 1, 2, 3...
- `ai_chat_history` - ID: 1, 2, 3...
- `admin_permissions`

### 2.2 Tạo dữ liệu mẫu

```cmd
cd backend
python create_sample_data_local.py
```

✅ **Dữ liệu mẫu đã được tạo:**
- 1 Admin
- 1 Department Head
- 3 Doctors
- 3 Patients
- 8 Specialties

---

## 🔧 Bước 3: Cài đặt Backend (FastAPI)

### 3.1 Di chuyển vào thư mục backend

```cmd
cd backend
```

### 3.2 Tạo môi trường ảo (Virtual Environment)

```cmd
python -m venv venv
```

### 3.3 Kích hoạt môi trường ảo

```cmd
venv\Scripts\activate
```

Bạn sẽ thấy `(venv)` ở đầu dòng lệnh.

### 3.4 Cài đặt các thư viện Python

```cmd
pip install -r requirements.txt
```

### 3.5 Kiểm tra file .env

Mở file `backend/.env` và đảm bảo có nội dung:

```env
DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule
JWT_SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080
CORS_ORIGINS=*
ENVIRONMENT=development
EMERGENT_LLM_KEY=your-emergent-llm-key-here
```

### 3.6 Chạy Backend Server

```cmd
python server.py
```

hoặc

```cmd
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

✅ **Backend đang chạy tại:**
```
http://localhost:8001
```

📖 **API Documentation:**
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

---

## ⚛️ Bước 4: Cài đặt Frontend (React)

### 4.1 Mở cửa sổ Command Prompt mới

Giữ nguyên cửa sổ backend đang chạy, mở cmd mới.

### 4.2 Di chuyển vào thư mục frontend

```cmd
cd frontend
```

### 4.3 Cài đặt Yarn (nếu chưa có)

```cmd
npm install -g yarn
```

### 4.4 Cài đặt các thư viện

```cmd
yarn install
```

### 4.5 Kiểm tra file .env

Mở file `frontend/.env` và đảm bảo có nội dung:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
PORT=3050
WDS_SOCKET_PORT=3050
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

### 4.6 Chạy Frontend Server

```cmd
yarn start
```

✅ **Frontend đang chạy tại:**
```
http://localhost:3050
```

Trình duyệt sẽ tự động mở ứng dụng.

---

## 🎉 Hoàn tất!

### Kiểm tra ứng dụng:

1. **Frontend**: http://localhost:3050
2. **Backend API**: http://localhost:8001
3. **API Docs**: http://localhost:8001/docs

### Tài khoản đăng nhập:

```
👨‍💼 Admin:
   Email: admin@medischedule.com
   Password: 12345678

👨‍⚕️ Department Head:
   Email: departmenthead@test.com
   Password: 12345678

👨‍⚕️ Doctors:
   Email: doctor1@test.com
   Email: doctor2@test.com
   Email: doctor3@test.com
   Password: 12345678

👥 Patients:
   Email: patient1@test.com
   Email: patient2@test.com
   Email: patient3@test.com
   Password: 12345678
```

---

## 🔍 Kiểm tra Database

### Xem dữ liệu trong MySQL:

```cmd
mysql -u root -p190705
```

Trong MySQL shell:

```sql
USE medischedule;

-- Xem danh sách bảng
SHOW TABLES;

-- Xem users (ID tự động tăng)
SELECT id, email, full_name, role FROM users;

-- Xem doctors
SELECT d.id, u.full_name, s.name as specialty, d.consultation_fee 
FROM doctors d 
JOIN users u ON d.user_id = u.id 
JOIN specialties s ON d.specialty_id = s.id;

-- Xem patients
SELECT p.id, u.full_name, u.phone, p.blood_type 
FROM patients p 
JOIN users u ON p.user_id = u.id;
```

---

## 🛠️ Troubleshooting

### ❌ Lỗi: "Access denied for user 'root'@'localhost'"

**Giải pháp**: Kiểm tra lại password MySQL

```cmd
mysql -u root -p
```

Nhập password: `190705`

Nếu không đúng, reset password MySQL:

```cmd
mysqladmin -u root password 190705
```

### ❌ Lỗi: "Can't connect to MySQL server"

**Giải pháp**: Khởi động lại MySQL service

1. Mở **Services** (nhấn `Win + R`, gõ `services.msc`)
2. Tìm **MySQL80** hoặc **MySQL**
3. Click chuột phải → **Start** hoặc **Restart**

### ❌ Lỗi: "Port 3050 already in use"

**Giải pháp**: Đổi port trong `frontend/.env`

```env
PORT=3051
WDS_SOCKET_PORT=3051
```

### ❌ Lỗi: "Module not found"

**Backend**:
```cmd
cd backend
pip install -r requirements.txt
```

**Frontend**:
```cmd
cd frontend
yarn install
```

### ❌ Frontend không kết nối được Backend

**Kiểm tra**:

1. Backend đang chạy: http://localhost:8001/health
2. CORS đã bật trong `backend/.env`: `CORS_ORIGINS=*`
3. Frontend đã cấu hình đúng URL trong `.env`:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

---

## 📊 Cấu trúc Database với ID tự động

### Ví dụ bảng Users:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- 1, 2, 3, 4...
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'department_head', 'admin'),
    ...
);
```

### Tất cả ID là số nguyên tự động tăng:

- ✅ User ID: 1, 2, 3, 4, 5...
- ✅ Patient ID: 1, 2, 3...
- ✅ Doctor ID: 1, 2, 3...
- ✅ Appointment ID: 1, 2, 3...
- ✅ Payment ID: 1, 2, 3...
- ❌ Không còn UUID như: `a1b2c3d4-e5f6...`

---

## 🎯 Tính năng đã cài đặt

- ✅ Đăng ký / Đăng nhập
- ✅ Quản lý bệnh nhân
- ✅ Quản lý bác sĩ
- ✅ Đặt lịch khám
- ✅ Chat bệnh nhân - bác sĩ (có chia sẻ hình ảnh)
- ✅ Thanh toán (Mock)
- ✅ Quản lý chuyên khoa
- ✅ Admin dashboard
- ✅ Department Head dashboard
- ✅ Đa ngôn ngữ (Tiếng Việt / English)

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:

1. **Backend logs**: Xem terminal đang chạy backend
2. **Frontend logs**: Xem console trong trình duyệt (F12)
3. **MySQL logs**: Kiểm tra kết nối database

---

**Made with ❤️ for Windows Local**  
*ID tự động tăng - Dễ dàng quản lý*
