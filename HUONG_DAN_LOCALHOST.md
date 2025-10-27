# 🚀 HƯỚNG DẪN CHẠY MEDISCHEDULE TRÊN LOCALHOST

## 📋 YÊU CẦU HỆ THỐNG

- Python 3.8+
- Node.js 16+
- MySQL 5.7+ hoặc MariaDB 10+
- Git

---

## ⚙️ BƯỚC 1: CÀI ĐẶT MYSQL

### Windows:
1. Tải MySQL từ: https://dev.mysql.com/downloads/installer/
2. Cài đặt và đặt password root: `190705`
3. Khởi động MySQL service

### Mac:
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
# Đặt password root: 190705
```

### Linux:
```bash
sudo apt-get install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
# Đặt password root: 190705
```

---

## 🗄️ BƯỚC 2: TẠO DATABASE

Mở MySQL command line và chạy:

```sql
CREATE DATABASE medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kiểm tra database đã tạo
SHOW DATABASES;
```

---

## 📥 BƯỚC 3: CLONE VÀ CÀI ĐẶT

### 3.1. Clone repository (hoặc download code)
```bash
cd /path/to/your/projects
# Nếu có git repo: git clone <repo-url>
# Hoặc: giải nén code đã download
```

### 3.2. Cài đặt Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

**Danh sách thư viện chính:**
- fastapi
- uvicorn
- sqlalchemy
- aiomysql
- passlib
- python-jose
- python-dotenv
- pydantic

### 3.3. Cài đặt Frontend Dependencies
```bash
cd ../frontend
yarn install
# Hoặc: npm install
```

---

## 🔧 BƯỚC 4: CẤU HÌNH BACKEND

### 4.1. Tạo file `.env` trong thư mục `backend/`

```bash
cd backend
```

Tạo file `.env` với nội dung:

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
JWT_SECRET_KEY=your-secret-key-change-in-production-12345
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS Configuration
CORS_ORIGINS=*

# Environment
ENVIRONMENT=development

# OpenAI API (optional - for AI features)
EMERGENT_LLM_KEY=your-emergent-llm-key-here
```

⚠️ **QUAN TRỌNG**: Thay `190705` bằng password MySQL của bạn!

### 4.2. Tạo tables trong database

```bash
cd backend
python init_database.py
```

Kết quả mong đợi:
```
INFO:__main__:Creating database tables...
INFO:__main__:✅ All tables created successfully!
```

### 4.3. Tạo dữ liệu mẫu

```bash
python create_sample_data_mysql.py
```

Kết quả:
```
✓ Created specialty: Tim mạch
✓ Created specialty: Nội khoa
...
✓ Created admin account
✓ Created doctor: Dr. Nguyễn Văn A
✓ Created patient: Nguyễn Văn X
```

---

## 🌐 BƯỚC 5: CẤU HÌNH FRONTEND

### 5.1. Tạo file `.env` trong thư mục `frontend/`

```bash
cd frontend
```

Tạo file `.env` với nội dung:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

⚠️ **QUAN TRỌNG**: Backend phải chạy trên port 8001!

---

## 🚀 BƯỚC 6: CHẠY ỨNG DỤNG

### 6.1. Chạy Backend (Terminal 1)
```bash
cd backend
python server.py
```

Kết quả mong đợi:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     Application startup complete.
INFO:server:Connecting to MySQL database...
INFO:server:Successfully connected to MySQL database
```

### 6.2. Chạy Frontend (Terminal 2)
```bash
cd frontend
yarn start
# Hoặc: npm start
```

Trình duyệt sẽ tự động mở: `http://localhost:3000`

---

## 👤 TÀI KHOẢN TEST

Sau khi tạo sample data, bạn có thể dùng các tài khoản sau:

### 🏥 ADMIN (Quản trị viên)
```
Email: admin@medischedule.com
Password: 12345678
```

### 👨‍⚕️ BÁC SĨ (Doctors)
```
Email: doctor1@test.com | Password: 12345678
Email: doctor2@test.com | Password: 12345678
Email: doctor3@test.com | Password: 12345678
```

### 🏥 BỆNH NHÂN (Patients)
```
Email: patient1@test.com | Password: 12345678
Email: patient2@test.com | Password: 12345678
Email: patient3@test.com | Password: 12345678
```

### 👔 TRƯỞNG KHOA (Department Head)
```
Email: departmenthead@test.com
Password: 12345678
```

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi 1: "Can't connect to MySQL server"

**Nguyên nhân**: MySQL chưa chạy hoặc sai thông tin kết nối

**Giải pháp**:
```bash
# Kiểm tra MySQL có chạy không
# Windows: Task Manager -> Services -> MySQL
# Mac: brew services list
# Linux: sudo systemctl status mysql

# Kiểm tra kết nối
mysql -u root -p190705 -e "SELECT 'Connection OK' as status;"
```

### ❌ Lỗi 2: "500 Internal Server Error" khi đăng ký

**Nguyên nhân**: Lỗi bcrypt với password dài

**Giải pháp**: Đã fix trong code, đảm bảo password <= 72 ký tự

### ❌ Lỗi 3: "401 Unauthorized" khi đăng nhập

**Nguyên nhân**: 
- Chưa tạo sample data
- Sai email/password
- Database trống

**Giải pháp**:
```bash
# Tạo lại sample data
cd backend
python create_sample_data_mysql.py

# Kiểm tra users trong database
mysql -u root -p190705 -D medischedule -e "SELECT email, role FROM users;"
```

### ❌ Lỗi 4: Backend không khởi động

**Nguyên nhân**: Thiếu dependencies hoặc port 8001 đang bị dùng

**Giải pháp**:
```bash
# Cài lại dependencies
pip install -r requirements.txt

# Kiểm tra port 8001
# Windows: netstat -ano | findstr :8001
# Mac/Linux: lsof -i :8001

# Kill process nếu cần
# Windows: taskkill /PID <PID> /F
# Mac/Linux: kill -9 <PID>
```

### ❌ Lỗi 5: Frontend không kết nối được Backend

**Nguyên nhân**: Sai REACT_APP_BACKEND_URL

**Giải pháp**:
```bash
# Kiểm tra file frontend/.env
cat frontend/.env

# Phải là: REACT_APP_BACKEND_URL=http://localhost:8001

# Restart frontend sau khi sửa .env
cd frontend
yarn start
```

### ❌ Lỗi 6: CORS Error

**Nguyên nhân**: Frontend gọi API từ domain khác

**Giải pháp**: Đã cấu hình CORS trong backend, đảm bảo backend/.env có:
```env
CORS_ORIGINS=*
```

---

## 🧪 KIỂM TRA HỆ THỐNG

### Test Backend API:
```bash
# Health check
curl http://localhost:8001/api/health

# Test login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "patient1@test.com", "password": "12345678"}'
```

Kết quả mong đợi: Nhận được token JWT

### Test Frontend:
1. Mở http://localhost:3000
2. Click "Đăng nhập"
3. Nhập: `patient1@test.com` / `12345678`
4. Nếu thành công → Chuyển đến dashboard

---

## 📚 CẤU TRÚC DATABASE

MediSchedule sử dụng 8 bảng:

1. **users** - Tất cả người dùng (admin, doctor, patient, department_head)
2. **patients** - Thông tin bệnh nhân
3. **doctors** - Thông tin bác sĩ
4. **specialties** - Chuyên khoa
5. **appointments** - Lịch hẹn
6. **chat_messages** - Tin nhắn giữa bác sĩ và bệnh nhân
7. **ai_chat_history** - Lịch sử chat với AI
8. **admin_permissions** - Quyền hạn admin

---

## 🔄 CẬP NHẬT CODE

Nếu có thay đổi code:

### Backend changes:
```bash
# Không cần restart nếu đang dùng auto-reload
# Nếu thêm dependencies mới:
pip install -r requirements.txt
# Restart: Ctrl+C và chạy lại python server.py
```

### Frontend changes:
```bash
# Hot reload tự động
# Nếu thêm dependencies mới:
yarn install
# Restart: Ctrl+C và chạy lại yarn start
```

### Database schema changes:
```bash
# Xóa và tạo lại tables
mysql -u root -p190705 -D medischedule -e "DROP DATABASE medischedule; CREATE DATABASE medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Tạo lại tables và data
python init_database.py
python create_sample_data_mysql.py
```

---

## 📞 HỖ TRỢ

Nếu gặp lỗi không nằm trong danh sách trên:

1. Kiểm tra logs của Backend (terminal chạy server.py)
2. Kiểm tra Console của Frontend (F12 → Console tab)
3. Chụp màn hình lỗi và log để được hỗ trợ

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] MySQL đã cài đặt và chạy
- [ ] Database `medischedule` đã được tạo
- [ ] Backend dependencies đã cài (requirements.txt)
- [ ] Frontend dependencies đã cài (yarn/npm)
- [ ] File backend/.env đã cấu hình đúng
- [ ] File frontend/.env đã cấu hình đúng
- [ ] Tables đã được tạo (init_database.py)
- [ ] Sample data đã được tạo (create_sample_data_mysql.py)
- [ ] Backend chạy thành công trên port 8001
- [ ] Frontend chạy thành công trên port 3000
- [ ] Đăng nhập thành công với tài khoản test

---

**🎉 Chúc bạn setup thành công!**
