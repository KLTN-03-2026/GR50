# 🏠 CHẠY 100% LOCAL - BACKEND + FRONTEND TRÊN WINDOWS

## ✅ YÊU CẦU HỆ THỐNG

- **Windows 10/11**
- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 20+** ([Download](https://nodejs.org/))
- **MySQL 8.0** ([Download](https://dev.mysql.com/downloads/installer/))

---

## 🚀 CÀI ĐẶT LẦN ĐẦU (5 PHÚT)

### 📦 Bước 1: Cài đặt phần mềm cần thiết

1. **Python 3.11+**
   - Tải và cài đặt từ python.org
   - ✅ Tick: "Add Python to PATH"
   - Kiểm tra: `python --version`

2. **Node.js 20+**
   - Tải và cài đặt từ nodejs.org
   - Kiểm tra: `node --version` và `npm --version`

3. **MySQL 8.0**
   - Tải MySQL Installer
   - Chọn **Developer Default**
   - **Đặt Root Password**: `190705`
   - Port: `3306` (mặc định)
   - Kiểm tra: `mysql --version`

---

### 🗄️ Bước 2: Tạo Database

**Mở Command Prompt:**
```cmd
mysql -u root -p
```
**Nhập password:** `190705`

**Chạy lệnh SQL:**
```sql
CREATE DATABASE medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EXIT;
```

---

### 🔧 Bước 3: Cấu hình Backend

**Di chuyển đến thư mục project của bạn:**
```cmd
cd C:\path\to\medischedule
```

**Kiểm tra file `backend/.env`:**
```env
# MySQL Database (QUAN TRỌNG - Phải đúng password!)
DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS Configuration (Cho phép localhost:3000)
CORS_ORIGINS=*

# Environment
ENVIRONMENT=development
```

**⚠️ LƯU Ý:** Nếu password MySQL của bạn khác `190705`, hãy thay đổi trong `DATABASE_URL`!

---

### 🎨 Bước 4: Cấu hình Frontend

**Kiểm tra file `frontend/.env`:**
```env
# Backend URL - PHẢI TRỎ VỀ LOCALHOST
REACT_APP_BACKEND_URL=http://localhost:8001

# WebSocket Port
WDS_SOCKET_PORT=3000

# Other configs
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

**✅ ĐÃ CẬP NHẬT:** File này đã được tự động cấu hình để chạy local!

---

### 🛠️ Bước 5: Setup Database & Dependencies

**Option A: Tự động (KHUYÊN DÙNG) ⭐**

**Click đúp file:** `SETUP_DATABASE.bat`

Script sẽ tự động:
- ✅ Tạo Python virtual environment
- ✅ Cài đặt tất cả Python dependencies
- ✅ Tạo 9 bảng trong database
- ✅ Tạo admin account
- ✅ Tạo 8 test accounts (1 dept head, 3 doctors, 3 patients)

---

**Option B: Thủ công**

```cmd
# 1. Setup Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python init_database.py
python create_admin_mysql.py
python create_sample_simple.py

# 2. Setup Frontend
cd ..\frontend
npm install
```

---

## 🎮 CHẠY ỨNG DỤNG (MỖI LẦN SỬ DỤNG)

### ⚡ CÁCH NHANH NHẤT - Dùng file .BAT

**Bước 1: Khởi động Backend**
- **Click đúp:** `START_BACKEND.bat`
- Chờ thông báo: "Backend đang chạy tại: http://localhost:8001"
- **KHÔNG đóng terminal này!**

**Bước 2: Khởi động Frontend**
- **Click đúp:** `START_FRONTEND.bat` (mở terminal mới)
- Trình duyệt sẽ tự động mở: http://localhost:3000
- **KHÔNG đóng terminal này!**

---

### 💻 CÁCH THỦ CÔNG

**Terminal 1 - Backend:**
```cmd
cd C:\path\to\medischedule\backend
venv\Scripts\activate
python server.py
```

**Terminal 2 - Frontend (Mở terminal MỚI):**
```cmd
cd C:\path\to\medischedule\frontend
npm start
```

---

## 🌐 TRUY CẬP ỨNG DỤNG

### URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **Health Check:** http://localhost:8001/health

### Test Health Check
Mở trình duyệt và vào: http://localhost:8001/health

Bạn sẽ thấy:
```json
{
  "status": "healthy",
  "database": "mysql",
  "version": "1.0.0"
}
```

---

## 🔐 TÀI KHOẢN TEST

**TẤT CẢ PASSWORD:** `12345678`

| Role | Email | Mô tả |
|------|-------|-------|
| **Admin** | admin@medischedule.com | Quản trị viên hệ thống |
| **Dept Head** | departmenthead@test.com | Trưởng khoa |
| **Doctor 1** | doctor1@test.com | Bác sĩ Tim mạch |
| **Doctor 2** | doctor2@test.com | Bác sĩ Nội khoa |
| **Doctor 3** | doctor3@test.com | Bác sĩ Ngoại khoa |
| **Patient 1** | patient1@test.com | Bệnh nhân Nguyễn Văn X |
| **Patient 2** | patient2@test.com | Bệnh nhân Trần Thị Y |
| **Patient 3** | patient3@test.com | Bệnh nhân Lê Văn Z |

---

## ✅ KIỂM TRA ỨNG DỤNG

### 1. Kiểm tra Backend
```cmd
curl http://localhost:8001/health
```

### 2. Kiểm tra Frontend
- Mở: http://localhost:3000
- Trang chủ phải hiển thị

### 3. Test Login
1. Click **Đăng nhập**
2. Nhập:
   - Email: `patient1@test.com`
   - Password: `12345678`
3. Click **Đăng nhập**
4. Dashboard bệnh nhân phải hiển thị

### 4. Test các chức năng
- ✅ Tìm bác sĩ
- ✅ Đặt lịch hẹn
- ✅ Xem lịch sử
- ✅ Chat với bác sĩ

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi 1: MySQL không kết nối

**Triệu chứng:**
```
Can't connect to MySQL server on 'localhost'
```

**Giải pháp:**

1. **Kiểm tra MySQL đang chạy:**
   - Nhấn `Win + R` → gõ `services.msc` → Enter
   - Tìm "**MySQL80**" trong danh sách
   - Click chuột phải → **Start** (nếu chưa chạy)

2. **Kiểm tra password:**
   ```cmd
   mysql -u root -p
   ```
   Nhập password: `190705`
   
   Nếu sai password, sửa trong `backend/.env`:
   ```env
   DATABASE_URL=mysql+aiomysql://root:YOUR_ACTUAL_PASSWORD@localhost:3306/medischedule
   ```

3. **Khởi động lại Backend:**
   ```cmd
   # Nhấn Ctrl+C trong terminal backend
   # Rồi chạy lại
   python server.py
   ```

---

### ❌ Lỗi 2: Port 3000 hoặc 8001 đã được sử dụng

**Triệu chứng:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Giải pháp cho Frontend (port 3000):**

1. **Tìm process đang dùng port:**
   ```cmd
   netstat -ano | findstr :3000
   ```

2. **Kill process:**
   ```cmd
   taskkill /PID [số_PID] /F
   ```

3. **Hoặc dùng port khác:**
   ```cmd
   set PORT=3001 && npm start
   ```

**Giải pháp cho Backend (port 8001):**

1. **Tìm và kill process:**
   ```cmd
   netstat -ano | findstr :8001
   taskkill /PID [số_PID] /F
   ```

2. **Hoặc dùng port khác:**
   ```cmd
   uvicorn server:app --reload --host 0.0.0.0 --port 8002
   ```
   
   Và cập nhật `frontend/.env`:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8002
   ```

---

### ❌ Lỗi 3: Virtual environment không tồn tại

**Triệu chứng:**
```
'venv' is not recognized as an internal or external command
```

**Giải pháp:**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

### ❌ Lỗi 4: Frontend không kết nối được Backend

**Triệu chứng:**
- Frontend hiển thị nhưng login không được
- Console có lỗi `Network Error`

**Giải pháp:**

1. **Kiểm tra Backend đang chạy:**
   ```cmd
   curl http://localhost:8001/health
   ```

2. **Kiểm tra CORS trong `backend/server.py`:**
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000"],  # Hoặc ["*"]
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Kiểm tra `frontend/.env`:**
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

4. **Restart cả 2 services:**
   - Nhấn `Ctrl+C` trong cả 2 terminal
   - Chạy lại Backend và Frontend

---

### ❌ Lỗi 5: Bcrypt Warning

**Triệu chứng:**
```
(trapped) error reading bcrypt version
```

**Giải pháp:**
- Đây chỉ là **WARNING**, không ảnh hưởng chức năng
- Bỏ qua hoàn toàn
- Ứng dụng vẫn hoạt động bình thường

---

### ❌ Lỗi 6: Database tables không tồn tại

**Triệu chứng:**
```
Table 'medischedule.users' doesn't exist
```

**Giải pháp:**
```cmd
cd backend
venv\Scripts\activate
python init_database.py
python create_admin_mysql.py
python create_sample_simple.py
```

---

## 🔄 TẠO LẠI DATABASE (Nếu cần)

Nếu database bị lỗi hoặc muốn reset:

```cmd
# 1. Xóa và tạo lại database
mysql -u root -p
DROP DATABASE IF EXISTS medischedule;
CREATE DATABASE medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 2. Chạy lại setup
cd backend
venv\Scripts\activate
python init_database.py
python create_admin_mysql.py
python create_sample_simple.py
```

Hoặc:
```cmd
# Click đúp file
SETUP_DATABASE.bat
```

---

## 📊 KIỂM TRA DATABASE

```cmd
# Kết nối MySQL
mysql -u root -p190705

# Xem tất cả bảng
USE medischedule;
SHOW TABLES;

# Xem số lượng users
SELECT role, COUNT(*) as count FROM users GROUP BY role;

# Xem tất cả specialties
SELECT * FROM specialties;

# Thoát
EXIT;
```

---

## 🛑 DỪNG ỨNG DỤNG

1. **Backend:** Nhấn `Ctrl + C` trong terminal backend
2. **Frontend:** Nhấn `Ctrl + C` trong terminal frontend
3. **MySQL:** MySQL tiếp tục chạy (không cần tắt)

---

## 📁 CẤU TRÚC PROJECT

```
medischedule/
│
├── START_BACKEND.bat          ← Click để chạy backend
├── START_FRONTEND.bat         ← Click để chạy frontend
├── SETUP_DATABASE.bat         ← Click để setup database
│
├── backend/
│   ├── .env                   ← Cấu hình backend (DATABASE_URL)
│   ├── venv/                  ← Virtual environment
│   ├── server.py              ← Main backend server
│   ├── database.py            ← Database connection
│   ├── models.py              ← SQLAlchemy models
│   ├── requirements.txt       ← Python dependencies
│   ├── init_database.py       ← Tạo bảng
│   ├── create_admin_mysql.py  ← Tạo admin
│   └── create_sample_simple.py ← Tạo dữ liệu mẫu
│
└── frontend/
    ├── .env                   ← Cấu hình frontend (BACKEND_URL)
    ├── node_modules/          ← Node dependencies
    ├── package.json           ← Dependencies list
    ├── public/                ← Static files
    └── src/                   ← React source code
        ├── App.js
        ├── pages/
        ├── components/
        └── contexts/
```

---

## 💡 MẸO HỮU ÍCH

### 1. Giữ 2 Terminal luôn mở
- Terminal 1: Backend
- Terminal 2: Frontend
- Không cần đóng khi không dùng

### 2. Tự động khởi động MySQL
- MySQL sẽ tự động chạy khi Windows khởi động
- Kiểm tra trong Services → MySQL80 → Startup type: Automatic

### 3. Bookmarks trình duyệt
- http://localhost:3000 (Frontend)
- http://localhost:8001/health (Backend health)

### 4. Xem logs real-time
- Backend: Xem trong terminal backend
- Frontend: Xem trong terminal frontend
- Browser console: F12 → Console tab

### 5. Cập nhật code
- **Backend:** Uvicorn tự động reload khi sửa code
- **Frontend:** React tự động reload khi sửa code
- Không cần restart thủ công!

---

## ✅ CHECKLIST HOÀN THÀNH

Sau khi làm theo hướng dẫn, kiểm tra:

- [ ] Python đã cài đặt (`python --version`)
- [ ] Node.js đã cài đặt (`node --version`)
- [ ] MySQL đã cài đặt và chạy (`mysql --version`)
- [ ] Database `medischedule` đã được tạo
- [ ] Backend chạy tại http://localhost:8001
- [ ] Frontend chạy tại http://localhost:3000
- [ ] Login thành công với `patient1@test.com`
- [ ] Có thể tìm bác sĩ
- [ ] Có thể đặt lịch hẹn

---

## 🎉 HOÀN TẤT!

Bạn đã cài đặt thành công ứng dụng **100% LOCAL** trên Windows!

**Địa chỉ truy cập:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8001

**Login ngay với:**
- Email: `patient1@test.com`
- Password: `12345678`

**Chúc bạn sử dụng vui vẻ! 🎊**

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề không có trong hướng dẫn:

1. Xem file `README_WINDOWS.md`
2. Xem file `CHECKLIST_CAI_DAT.md`
3. Check backend logs trong terminal
4. Check frontend logs trong browser console (F12)

**Một số lỗi cần thông tin:**
- Thông báo lỗi đầy đủ
- Output của `python --version`
- Output của `node --version`
- Output của `mysql --version`
