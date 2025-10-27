# 🏥 MEDISCHEDULE - HƯỚNG DẪN CHẠY TRÊN WINDOWS

## 📋 YÊU CẦU HỆ THỐNG

### 1. Phần mềm cần cài đặt:

- **Python 3.8+**: https://www.python.org/downloads/
- **Node.js 16+**: https://nodejs.org/
- **MySQL 8.0+**: https://dev.mysql.com/downloads/installer/ hoặc XAMPP
- **Git** (để clone project): https://git-scm.com/downloads

### 2. Kiểm tra đã cài đặt:

```bash
python --version        # Phải >= 3.8
node --version          # Phải >= 16
npm --version           # Đi kèm với Node.js
mysql --version         # Phải >= 8.0
```

---

## 🚀 HƯỚNG DẪN NHANH (3 BƯỚC)

### BƯỚC 1: Cài đặt Dependencies

Mở **Command Prompt** hoặc **PowerShell** trong thư mục project:

```bash
# Cài đặt backend dependencies
cd backend
pip install -r requirements.txt

# Cài đặt frontend dependencies
cd ../frontend
npm install -g yarn
yarn install
```

### BƯỚC 2: Setup Database

**Cách 1: Dùng Script tự động (Khuyến nghị)**

Chạy file `SETUP_DATABASE_WINDOWS.bat` (double-click hoặc từ command line)

**Cách 2: Setup thủ công**

```bash
cd backend

# Tạo database và tables
mysql -u root -p190705 < create_database.sql

# Tạo admin account
python create_admin_mysql.py

# Tạo dữ liệu mẫu (optional)
python create_sample_data_mysql.py
```

### BƯỚC 3: Chạy ứng dụng

**Mở 2 terminal/command prompt:**

**Terminal 1 - Backend:**
```bash
# Double-click file START_BACKEND_WINDOWS.bat
# Hoặc chạy lệnh:
cd backend
python server.py
```
Backend sẽ chạy tại: http://localhost:8001

**Terminal 2 - Frontend:**
```bash
# Double-click file START_FRONTEND_WINDOWS.bat
# Hoặc chạy lệnh:
cd frontend
yarn start
```
Frontend sẽ chạy tại: http://localhost:3000

---

## 🔐 TÀI KHOẢN ĐĂNG NHẬP

Sau khi setup database, sử dụng các tài khoản sau:

### Admin (Quản trị viên)
```
Email: admin@medischedule.com
Password: 12345678
```

### Department Head (Trưởng khoa)
```
Email: departmenthead@test.com
Password: 12345678
```

### Doctor (Bác sĩ)
```
Email: doctor1@test.com
Password: 12345678
Email: doctor2@test.com
Password: 12345678
Email: doctor3@test.com
Password: 12345678
```

### Patient (Bệnh nhân)
```
Email: patient1@test.com
Password: 12345678
Email: patient2@test.com
Password: 12345678
Email: patient3@test.com
Password: 12345678
```

---

## 📁 CẤU TRÚC THỨ MỤC

```
MediSchedule/
├── backend/
│   ├── server.py                    # Main server file (MySQL version)
│   ├── database.py                  # SQLAlchemy models
│   ├── requirements.txt             # Python dependencies
│   ├── .env                         # Cấu hình database & API keys
│   ├── create_database.sql          # SQL script tạo database
│   ├── create_admin_mysql.py        # Script tạo admin
│   ├── create_sample_data_mysql.py  # Script tạo dữ liệu mẫu
│   ├── test_mysql_connection.py     # Test kết nối MySQL
│   └── HUONG_DAN_CHAY_MYSQL.md     # Hướng dẫn chi tiết
│
├── frontend/
│   ├── src/                         # React source code
│   ├── public/                      # Static files
│   ├── package.json                 # Node dependencies
│   └── .env                         # Frontend config
│
├── START_BACKEND_WINDOWS.bat        # Script chạy backend
├── START_FRONTEND_WINDOWS.bat       # Script chạy frontend
├── SETUP_DATABASE_WINDOWS.bat       # Script setup database
└── README_WINDOWS.md               # File này
```

---

## ⚙️ CẤU HÌNH

### File `backend/.env`

```env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=190705          # ⚠️ Thay bằng password MySQL của bạn
MYSQL_DATABASE=medischedule

# Database URL
DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule

# JWT Secret
JWT_SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# AI Features (Optional)
EMERGENT_LLM_KEY=your-emergent-llm-key-here
```

⚠️ **LƯU Ý**: Nếu MySQL password của bạn khác `190705`, hãy thay đổi trong:
- `MYSQL_PASSWORD`
- `DATABASE_URL`

### File `frontend/.env`

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 🧪 KIỂM TRA

### 1. Kiểm tra Backend đang chạy:

Mở trình duyệt:
- **API Documentation**: http://localhost:8001/api/docs
- **Health Check**: http://localhost:8001/health
- **Specialties API**: http://localhost:8001/api/specialties

### 2. Kiểm tra Frontend đang chạy:

Mở trình duyệt: http://localhost:3000

Bạn sẽ thấy trang chủ MediSchedule

### 3. Test Login:

1. Vào http://localhost:3000
2. Click "Đăng nhập"
3. Dùng tài khoản admin: `admin@medischedule.com` / `12345678`
4. Nếu đăng nhập thành công → Backend & Frontend hoạt động tốt!

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi: Can't connect to MySQL server

**Nguyên nhân**: MySQL chưa chạy hoặc sai port

**Giải pháp**:
1. Kiểm tra MySQL đang chạy:
   - **Windows Services**: Nhấn `Win+R` → `services.msc` → Tìm "MySQL" → Start
   - **XAMPP**: Mở XAMPP Control Panel → Start MySQL
2. Kiểm tra port 3306:
   ```bash
   netstat -ano | findstr :3306
   ```

### ❌ Lỗi: Access denied for user 'root'

**Nguyên nhân**: Sai password MySQL

**Giải pháp**:
1. Kiểm tra password MySQL của bạn
2. Update file `backend/.env`:
   ```env
   MYSQL_PASSWORD=your_actual_password
   DATABASE_URL=mysql+aiomysql://root:your_actual_password@localhost:3306/medischedule
   ```

### ❌ Lỗi: Table 'medischedule.users' doesn't exist

**Nguyên nhân**: Chưa tạo database hoặc tables

**Giải pháp**:
```bash
cd backend
mysql -u root -p < create_database.sql
```

### ❌ Lỗi: Port 8001 already in use

**Nguyên nhân**: Cổng 8001 đang được sử dụng

**Giải pháp**:
```bash
# Tìm process đang dùng port 8001
netstat -ano | findstr :8001

# Kill process (thay <PID> bằng số thực tế)
taskkill /PID <PID> /F

# Hoặc đổi port trong server.py:
# uvicorn.run("server:app", host="0.0.0.0", port=8002)
```

### ❌ Lỗi: ModuleNotFoundError: No module named 'xxx'

**Nguyên nhân**: Thiếu Python packages

**Giải pháp**:
```bash
cd backend
pip install -r requirements.txt --upgrade
```

### ❌ Lỗi: yarn: command not found

**Nguyên nhân**: Chưa cài Yarn

**Giải pháp**:
```bash
npm install -g yarn
```

### ❌ Frontend không kết nối được Backend

**Nguyên nhân**: Frontend đang trỏ sai URL backend

**Giải pháp**:
1. Kiểm tra file `frontend/.env`:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```
2. Restart frontend:
   ```bash
   # Nhấn Ctrl+C để stop
   # Chạy lại: yarn start
   ```

---

## 📊 DATABASE SCHEMA

MediSchedule sử dụng 8 tables:

```
1. users              - Tất cả người dùng (patient, doctor, admin, dept_head)
2. patients           - Thông tin chi tiết bệnh nhân
3. doctors            - Thông tin chi tiết bác sĩ
4. specialties        - Chuyên khoa y tế
5. appointments       - Lịch hẹn khám
6. chat_messages      - Tin nhắn giữa bác sĩ và bệnh nhân
7. ai_chat_history    - Lịch sử chat với AI chatbot
8. admin_permissions  - Quyền hạn của admin
```

Xem chi tiết schema trong file: `backend/create_database.sql`

---

## 🎯 TÍNH NĂNG CHÍNH

### ✅ Dành cho Admin:
- Quản lý bác sĩ (duyệt/từ chối)
- Quản lý bệnh nhân
- Quản lý chuyên khoa
- Tạo tài khoản admin khác
- Xem thống kê hệ thống

### ✅ Dành cho Department Head:
- Tạo tài khoản bác sĩ và bệnh nhân
- Quản lý bác sĩ trong khoa
- Quản lý bệnh nhân
- Xem thống kê

### ✅ Dành cho Doctor:
- Xem và quản lý lịch hẹn
- Chat với bệnh nhân
- Cập nhật profile và lịch làm việc
- Xem thống kê cá nhân

### ✅ Dành cho Patient:
- Đăng ký tài khoản
- Tìm kiếm và đặt lịch với bác sĩ
- Chat với bác sĩ
- Chat với AI chatbot tư vấn sức khỏe
- Xem lịch sử khám

---

## 🔄 CẬP NHẬT CODE

Khi có thay đổi code:

```bash
# Backend: không cần restart nếu dùng --reload
# Server tự động reload khi file thay đổi

# Frontend: không cần restart
# React hot reload tự động
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:

1. **Đọc file hướng dẫn chi tiết**: `backend/HUONG_DAN_CHAY_MYSQL.md`
2. **Kiểm tra logs**:
   - Backend logs hiển thị trong terminal chạy backend
   - Frontend logs trong terminal chạy frontend và browser console (F12)

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Đã cài Python, Node.js, MySQL
- [ ] Đã cài dependencies (pip install & yarn install)
- [ ] Đã setup database (chạy SETUP_DATABASE_WINDOWS.bat)
- [ ] Đã cấu hình file .env (kiểm tra password MySQL)
- [ ] Backend chạy thành công tại http://localhost:8001
- [ ] Frontend chạy thành công tại http://localhost:3000
- [ ] Đăng nhập được với tài khoản admin

---

## 🎉 HOÀN TẤT!

Bây giờ bạn có thể sử dụng MediSchedule trên máy Windows local của mình!

**Happy coding! 🚀**
