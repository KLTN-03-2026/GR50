# 🏥 HƯỚNG DẪN CHẠY ỨNG DỤNG VỚI MySQL LOCAL

## ✅ ỨNG DỤNG ĐÃ LOẠI BỎ HOÀN TOÀN MongoDB - CHỈ DÙNG MySQL

---

## 📋 YÊU CẦU HỆ THỐNG

- **Windows 10/11** hoặc **Linux**
- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 20+** ([Download](https://nodejs.org/))
- **MySQL 8.0 / MariaDB 10.5+** ([Download MySQL](https://dev.mysql.com/downloads/installer/))

---

## 🚀 BƯỚC 1: CÀI ĐẶT MySQL

### Windows:
1. Download MySQL Installer từ https://dev.mysql.com/downloads/installer/
2. Chọn **Developer Default**
3. Đặt **Root Password**: `190705`
4. Port: `3306` (mặc định)
5. Hoàn tất cài đặt

### Linux (Ubuntu/Debian):
```bash
# Cài đặt MariaDB
sudo apt update
sudo apt install mariadb-server -y

# Khởi động MySQL
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Đặt password root
sudo mysql_secure_installation
```

### Kiểm tra MySQL:
```bash
mysql --version
```

---

## 🗄️ BƯỚC 2: TẠO DATABASE

### Kết nối MySQL:
```bash
# Windows & Linux
mysql -u root -p
```
Nhập password: `190705`

### Tạo database:
```sql
-- Tạo database với charset UTF-8
CREATE DATABASE medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kiểm tra
SHOW DATABASES;

-- Thoát
EXIT;
```

---

## 🔧 BƯỚC 3: CẤU HÌNH VÀ CHẠY BACKEND

### 3.1. Di chuyển đến thư mục backend:
```bash
cd /path/to/project/backend
```

### 3.2. Tạo và kích hoạt virtual environment:

**Windows:**
```cmd
python -m venv venv
venv\Scripts\activate
```

**Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3.3. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

### 3.4. Kiểm tra file `.env`:
File `backend/.env` đã được cấu hình sẵn:

```env
# MySQL Database Configuration
DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS Configuration
CORS_ORIGINS=*

# Environment
ENVIRONMENT=development

# OpenAI API (for AI features - optional)
EMERGENT_LLM_KEY=your-emergent-llm-key-here
```

**⚠️ QUAN TRỌNG:** 
- Nếu password MySQL của bạn khác `190705`, hãy sửa trong `DATABASE_URL`
- Format: `mysql+aiomysql://root:YOUR_PASSWORD@localhost:3306/medischedule`

### 3.5. Tạo bảng trong database:
```bash
python init_database.py
```

### 3.6. Tạo admin account:
```bash
python create_admin_mysql.py
```

### 3.7. Tạo dữ liệu mẫu:
```bash
python create_sample_simple.py
```

### 3.8. Chạy backend server:

**Windows:**
```cmd
python server.py
```

**Linux:**
```bash
python3 server.py
```

Hoặc dùng uvicorn:
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**✅ Backend sẽ chạy tại: http://localhost:8001**

---

## 🎨 BƯỚC 4: CẤU HÌNH VÀ CHẠY FRONTEND

### 4.1. Mở terminal MỚI và di chuyển đến thư mục frontend:
```bash
cd /path/to/project/frontend
```

### 4.2. Cài đặt dependencies:
```bash
npm install
# hoặc
yarn install
```

### 4.3. Kiểm tra file `.env`:
File `frontend/.env`:

```env
# Backend URL cho local development
REACT_APP_BACKEND_URL=http://localhost:8001

# WebSocket Port
WDS_SOCKET_PORT=3000

# Other configs
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

### 4.4. Chạy frontend:
```bash
npm start
# hoặc
yarn start
```

**✅ Frontend sẽ tự động mở tại: http://localhost:3000**

---

## 🔐 TÀI KHOẢN TEST (TẤT CẢ DÙNG PASSWORD: 12345678)

| Role | Email | Mô tả |
|------|-------|-------|
| **Admin** | admin@medischedule.com | Quản trị viên hệ thống |
| **Dept Head** | departmenthead@test.com | Trưởng khoa |
| **Doctor 1** | doctor1@test.com | Bác sĩ Tim mạch |
| **Doctor 2** | doctor2@test.com | Bác sĩ Nội khoa |
| **Doctor 3** | doctor3@test.com | Bác sĩ Ngoại khoa |
| **Patient 1** | patient1@test.com | Bệnh nhân |
| **Patient 2** | patient2@test.com | Bệnh nhân |
| **Patient 3** | patient3@test.com | Bệnh nhân |

---

## 🧪 KIỂM TRA ỨNG DỤNG

### 1. Kiểm tra Backend:
```bash
curl http://localhost:8001/health
```

Kết quả mong đợi:
```json
{
  "status": "healthy",
  "database": "mysql",
  "version": "1.0.0"
}
```

### 2. Kiểm tra Frontend:
Mở trình duyệt: **http://localhost:3000**

### 3. Test Login:
1. Vào http://localhost:3000
2. Click **Đăng nhập**
3. Nhập:
   - Email: `patient1@test.com`
   - Password: `12345678`
4. Click **Đăng nhập**
5. Dashboard bệnh nhân sẽ hiển thị

---

## 📊 CÁC BẢNG TRONG DATABASE

Ứng dụng sử dụng **9 bảng MySQL**:

1. **users** - Tài khoản người dùng (admin, doctor, patient, department_head)
2. **patients** - Thông tin bệnh nhân
3. **doctors** - Thông tin bác sĩ
4. **specialties** - Chuyên khoa
5. **appointments** - Lịch hẹn
6. **payments** - Thanh toán
7. **chat_messages** - Tin nhắn chat giữa bác sĩ và bệnh nhân
8. **ai_chat_history** - Lịch sử chat với AI
9. **admin_permissions** - Quyền quản trị viên

### Kiểm tra database:
```bash
mysql -u root -p190705 medischedule
```

```sql
-- Xem tất cả bảng
SHOW TABLES;

-- Xem số lượng users theo role
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Xem tất cả specialties
SELECT * FROM specialties;

-- Xem tất cả doctors
SELECT u.email, d.full_name, s.name_vi as specialty 
FROM doctors d 
JOIN users u ON d.user_id = u.id 
JOIN specialties s ON d.specialty_id = s.id;

-- Thoát
EXIT;
```

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi 1: MySQL không kết nối

**Triệu chứng:**
```
Can't connect to MySQL server on 'localhost'
```

**Giải pháp:**

**Windows:**
1. Mở Services (Win + R → `services.msc`)
2. Tìm **MySQL80**
3. Click chuột phải → **Start**

**Linux:**
```bash
sudo systemctl start mariadb
sudo systemctl status mariadb
```

### ❌ Lỗi 2: Wrong password

**Triệu chứng:**
```
Access denied for user 'root'@'localhost'
```

**Giải pháp:**
Sửa `backend/.env`:
```env
DATABASE_URL=mysql+aiomysql://root:YOUR_ACTUAL_PASSWORD@localhost:3306/medischedule
```

### ❌ Lỗi 3: Database không tồn tại

**Triệu chứng:**
```
Unknown database 'medischedule'
```

**Giải pháp:**
```bash
mysql -u root -p
CREATE DATABASE medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### ❌ Lỗi 4: Tables không tồn tại

**Triệu chứng:**
```
Table 'medischedule.users' doesn't exist
```

**Giải pháp:**
```bash
cd backend
python init_database.py
python create_admin_mysql.py
python create_sample_simple.py
```

### ❌ Lỗi 5: Port đã được sử dụng

**Backend (port 8001):**
```bash
# Tìm process
netstat -ano | findstr :8001  # Windows
lsof -i :8001                 # Linux

# Kill process
taskkill /PID [PID] /F        # Windows
kill -9 [PID]                 # Linux
```

**Frontend (port 3000):**
```bash
# Dùng port khác
set PORT=3001 && npm start    # Windows
PORT=3001 npm start           # Linux
```

---

## 🔄 TẠO LẠI DATABASE

Nếu cần reset database hoàn toàn:

```bash
# 1. Xóa và tạo lại database
mysql -u root -p
DROP DATABASE IF EXISTS medischedule;
CREATE DATABASE medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 2. Chạy lại scripts
cd backend
python init_database.py
python create_admin_mysql.py
python create_sample_simple.py
```

---

## 📁 CẤU TRÚC PROJECT

```
project/
├── backend/
│   ├── .env                     # ✅ MySQL config (DATABASE_URL)
│   ├── venv/                    # Virtual environment
│   ├── server.py                # FastAPI server
│   ├── database.py              # ✅ SQLAlchemy + aiomysql
│   ├── models.py                # ✅ SQLAlchemy models
│   ├── requirements.txt         # ✅ Python dependencies (no MongoDB)
│   ├── init_database.py         # Script tạo bảng
│   ├── create_admin_mysql.py    # Script tạo admin
│   ├── create_sample_simple.py  # Script tạo dữ liệu mẫu
│   └── uploads/                 # Thư mục lưu hình ảnh chat
│
└── frontend/
    ├── .env                     # Frontend config
    ├── node_modules/            # Node dependencies
    ├── package.json             # Dependencies list
    ├── public/                  # Static files
    └── src/                     # React source code
        ├── App.js
        ├── pages/
        ├── components/
        └── contexts/
```

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] MySQL đã cài đặt và chạy
- [ ] Database `medischedule` đã được tạo
- [ ] Backend dependencies đã cài đặt
- [ ] File `.env` đã cấu hình đúng
- [ ] Tables đã được tạo (9 bảng)
- [ ] Test accounts đã được tạo (8 accounts)
- [ ] Backend chạy tại http://localhost:8001
- [ ] Frontend chạy tại http://localhost:3000
- [ ] Login thành công với tài khoản test
- [ ] Các chức năng hoạt động (tìm bác sĩ, đặt lịch, chat)

---

## 🎉 HOÀN TẤT!

Ứng dụng của bạn đã **loại bỏ hoàn toàn MongoDB** và chỉ sử dụng **MySQL**!

**Truy cập ngay:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/api/docs

**Login với:**
- Email: `patient1@test.com`
- Password: `12345678`

---

## 💡 LỆNH NHANH (QUICK REFERENCE)

### Khởi động ứng dụng:
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # Linux
venv\Scripts\activate     # Windows
python server.py

# Terminal 2 - Frontend
cd frontend
npm start
```

### Kiểm tra MySQL:
```bash
mysql -u root -p190705 -e "USE medischedule; SELECT role, COUNT(*) FROM users GROUP BY role;"
```

### Restart services (nếu chạy trong container):
```bash
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, cung cấp:
1. Thông báo lỗi đầy đủ
2. Output của: `python --version`, `node --version`, `mysql --version`
3. Nội dung file `backend/.env` (ẩn password)
4. Backend logs từ terminal

**Chúc bạn làm việc hiệu quả! 🚀**
