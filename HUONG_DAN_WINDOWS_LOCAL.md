# HƯỚNG DẪN CHẠY LOCAL TRÊN WINDOWS

## 📋 YÊU CẦU HỆ THỐNG

- Windows 10/11
- Python 3.11+ ([Download tại đây](https://www.python.org/downloads/))
- Node.js 20+ ([Download tại đây](https://nodejs.org/))
- MySQL/MariaDB ([Download MySQL](https://dev.mysql.com/downloads/installer/) hoặc [Download MariaDB](https://mariadb.org/download/))
- Git ([Download tại đây](https://git-scm.com/download/win))

---

## 🚀 BƯỚC 1: CÀI ĐẶT MYSQL

### 1.1. Cài đặt MySQL Server
1. Download MySQL Installer từ https://dev.mysql.com/downloads/installer/
2. Chọn **MySQL Installer 8.0.x (Windows)**
3. Chạy file cài đặt và chọn **Developer Default**
4. Trong bước cấu hình:
   - **Root Password**: `190705` (hoặc password bạn muốn)
   - Port: `3306` (mặc định)
5. Hoàn tất cài đặt

### 1.2. Kiểm tra MySQL đã cài đặt
```cmd
mysql --version
```

### 1.3. Khởi động MySQL
- MySQL sẽ tự động chạy sau khi cài đặt
- Hoặc mở **Services** (services.msc) và tìm **MySQL80**, click **Start**

---

## 🚀 BƯỚC 2: TẠO DATABASE

### 2.1. Mở Command Prompt và kết nối MySQL
```cmd
mysql -u root -p
```
Nhập password: `190705` (hoặc password bạn đã đặt)

### 2.2. Chạy script tạo database
Trong MySQL prompt:
```sql
-- Tạo database
CREATE DATABASE medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kiểm tra
SHOW DATABASES;

-- Thoát
EXIT;
```

---

## 🚀 BƯỚC 3: CÀI ĐẶT BACKEND

### 3.1. Mở Command Prompt và di chuyển đến thư mục backend
```cmd
cd C:\path\to\your\project\backend
```
*(Thay đổi đường dẫn cho phù hợp)*

### 3.2. Tạo môi trường ảo Python
```cmd
python -m venv venv
```

### 3.3. Kích hoạt môi trường ảo
```cmd
venv\Scripts\activate
```

### 3.4. Cài đặt dependencies
```cmd
pip install -r requirements.txt
```

### 3.5. Cấu hình file .env
Tạo/sửa file `backend/.env`:
```env
# MySQL Database
DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS Configuration
CORS_ORIGINS=*

# Environment
ENVIRONMENT=development

# OpenAI API (for AI features)
EMERGENT_LLM_KEY=your-emergent-llm-key-here
```

**⚠️ Quan trọng**: Thay `190705` bằng password MySQL của bạn nếu khác!

### 3.6. Tạo bảng trong database
```cmd
python init_database.py
```

### 3.7. Tạo admin account
```cmd
python create_admin_mysql.py
```

### 3.8. Tạo dữ liệu mẫu
```cmd
python create_sample_simple.py
```

### 3.9. Chạy backend server
```cmd
python server.py
```

Hoặc:
```cmd
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**✅ Backend sẽ chạy tại: http://localhost:8001**

---

## 🚀 BƯỚC 4: CÀI ĐẶT FRONTEND

### 4.1. Mở Command Prompt MỚI và di chuyển đến thư mục frontend
```cmd
cd C:\path\to\your\project\frontend
```

### 4.2. Cài đặt Node.js dependencies
```cmd
npm install
```
Hoặc nếu dùng Yarn:
```cmd
yarn install
```

### 4.3. Cấu hình file .env
Tạo/sửa file `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 4.4. Chạy frontend
```cmd
npm start
```
Hoặc:
```cmd
yarn start
```

**✅ Frontend sẽ tự động mở tại: http://localhost:3000**

---

## 🔐 TÀI KHOẢN TEST (Password: 12345678)

### Admin (Quản trị viên)
```
Email:    admin@medischedule.com
Password: 12345678
```

### Department Head (Trưởng khoa)
```
Email:    departmenthead@test.com
Password: 12345678
```

### Doctors (Bác sĩ)
```
doctor1@test.com - Dr. Nguyễn Văn A (Tim mạch)
doctor2@test.com - Dr. Trần Thị B (Nội khoa)
doctor3@test.com - Dr. Lê Văn C (Ngoại khoa)
Password: 12345678
```

### Patients (Bệnh nhân)
```
patient1@test.com - Nguyễn Văn X
patient2@test.com - Trần Thị Y
patient3@test.com - Lê Văn Z
Password: 12345678
```

---

## 🧪 KIỂM TRA ỨNG DỤNG

### 1. Kiểm tra Backend API
Mở trình duyệt và truy cập:
```
http://localhost:8001/health
```

Bạn sẽ thấy:
```json
{
  "status": "healthy",
  "database": "mysql",
  "version": "1.0.0"
}
```

### 2. Kiểm tra Frontend
Mở trình duyệt:
```
http://localhost:3000
```

### 3. Test Login
1. Vào http://localhost:3000
2. Click **Đăng nhập**
3. Nhập:
   - Email: `patient1@test.com`
   - Password: `12345678`
4. Click **Đăng nhập**

---

## 🐛 TROUBLESHOOTING

### Lỗi 1: MySQL không kết nối được
**Lỗi**: `Can't connect to MySQL server`

**Giải pháp**:
1. Kiểm tra MySQL đang chạy:
   ```cmd
   # Mở Services (Win + R → services.msc)
   # Tìm "MySQL80" và click Start
   ```

2. Kiểm tra password trong `.env` file:
   ```env
   DATABASE_URL=mysql+aiomysql://root:YOUR_PASSWORD@localhost:3306/medischedule
   ```

3. Test kết nối MySQL:
   ```cmd
   mysql -u root -p
   ```

### Lỗi 2: Backend báo lỗi `ModuleNotFoundError`
**Giải pháp**:
```cmd
# Kích hoạt virtual environment
cd backend
venv\Scripts\activate

# Cài lại dependencies
pip install -r requirements.txt
```

### Lỗi 3: Frontend không kết nối được Backend
**Lỗi**: `Network Error` hoặc `Failed to fetch`

**Giải pháp**:
1. Kiểm tra Backend đang chạy tại `http://localhost:8001`
2. Kiểm tra file `frontend/.env`:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```
3. Khởi động lại frontend:
   ```cmd
   npm start
   ```

### Lỗi 4: Port 3000 hoặc 8001 đã được sử dụng
**Giải pháp**:

**Cho Backend** (thay port 8001):
```cmd
uvicorn server:app --reload --host 0.0.0.0 --port 8002
```
Và cập nhật `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8002
```

**Cho Frontend** (thay port 3000):
```cmd
set PORT=3001 && npm start
```

### Lỗi 5: Bcrypt error
**Lỗi**: `error reading bcrypt version`

**Giải pháp**: Đây chỉ là warning, không ảnh hưởng chức năng. Bỏ qua.

### Lỗi 6: Database tables không tồn tại
**Lỗi**: `Table 'medischedule.users' doesn't exist`

**Giải pháp**:
```cmd
cd backend
python init_database.py
python create_admin_mysql.py
python create_sample_simple.py
```

---

## 📝 LỆNH NHANH (QUICK COMMANDS)

### Khởi động tất cả
```cmd
# Terminal 1 - Backend
cd backend
venv\Scripts\activate
python server.py

# Terminal 2 - Frontend (mở terminal mới)
cd frontend
npm start
```

### Tạo lại database
```cmd
cd backend
venv\Scripts\activate
python init_database.py
python create_admin_mysql.py
python create_sample_simple.py
```

### Kiểm tra database
```cmd
mysql -u root -p190705 -e "USE medischedule; SELECT role, COUNT(*) as count FROM users GROUP BY role;"
```

---

## 📂 CẤU TRÚC THỨ MỤC

```
project/
├── backend/
│   ├── venv/                    # Virtual environment
│   ├── .env                     # Backend config
│   ├── server.py                # Main server file
│   ├── database.py              # Database config
│   ├── models.py                # SQLAlchemy models
│   ├── requirements.txt         # Python dependencies
│   ├── init_database.py         # Create tables
│   ├── create_admin_mysql.py    # Create admin
│   └── create_sample_simple.py  # Create sample data
│
└── frontend/
    ├── node_modules/            # Node dependencies
    ├── .env                     # Frontend config
    ├── package.json             # Node dependencies
    └── src/                     # React source code
```

---

## 🎉 HOÀN TẤT!

Nếu tất cả bước trên hoàn thành thành công:

1. ✅ Backend chạy tại: **http://localhost:8001**
2. ✅ Frontend chạy tại: **http://localhost:3000**
3. ✅ MySQL database: **medischedule**
4. ✅ 8 test accounts đã sẵn sàng

**Bắt đầu sử dụng ứng dụng ngay!** 🎊

---

## 💡 MẸO

1. **Luôn kích hoạt virtual environment** trước khi chạy backend:
   ```cmd
   cd backend
   venv\Scripts\activate
   ```

2. **Giữ 2 terminal mở** - một cho backend, một cho frontend

3. **Kiểm tra logs** nếu có lỗi:
   - Backend: Xem console của terminal backend
   - Frontend: Xem console của terminal frontend
   - MySQL: Xem MySQL error log trong Services

4. **Tắt ứng dụng**:
   - Backend: Nhấn `Ctrl + C` trong terminal backend
   - Frontend: Nhấn `Ctrl + C` trong terminal frontend

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, cung cấp thông tin sau:
1. Thông báo lỗi đầy đủ
2. Phiên bản Python: `python --version`
3. Phiên bản Node.js: `node --version`
4. Phiên bản MySQL: `mysql --version`
5. Hệ điều hành: Windows 10/11
