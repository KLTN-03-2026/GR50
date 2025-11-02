# 🚀 CHẠY LOCAL TRÊN WINDOWS - NHANH CHÓNG

## ✅ CÀI ĐẶT BAN ĐẦU (Chỉ làm 1 lần)

### Bước 1: Cài đặt các phần mềm cần thiết
1. **Python 3.11+**: https://www.python.org/downloads/
2. **Node.js 20+**: https://nodejs.org/
3. **MySQL 8.0**: https://dev.mysql.com/downloads/installer/
   - Đặt password root: `190705`

### Bước 2: Tạo database trong MySQL
Mở Command Prompt:
```cmd
mysql -u root -p
```
Nhập password: `190705`

Chạy lệnh:
```sql
CREATE DATABASE medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Bước 3: Setup database và tạo dữ liệu mẫu
**Click đúp vào file**: `SETUP_DATABASE.bat`

Script này sẽ tự động:
- ✅ Tạo virtual environment
- ✅ Cài đặt Python dependencies
- ✅ Tạo tất cả bảng trong database
- ✅ Tạo admin account
- ✅ Tạo 8 test accounts

---

## 🎮 CHẠY ỨNG DỤNG (Mỗi lần sử dụng)

### Cách 1: Dùng file .bat (ĐƠN GIẢN NHẤT) ⭐

1. **Click đúp**: `START_BACKEND.bat` 
   - Backend sẽ chạy tại `http://localhost:8001`

2. **Click đúp**: `START_FRONTEND.bat` (mở terminal mới)
   - Frontend sẽ tự động mở tại `http://localhost:3000`

### Cách 2: Chạy bằng Command Prompt

**Terminal 1 - Backend:**
```cmd
cd backend
venv\Scripts\activate
python server.py
```

**Terminal 2 - Frontend:**
```cmd
cd frontend
npm start
```

---

## 🔐 TÀI KHOẢN TEST

**Password tất cả: `12345678`**

| Role | Email |
|------|-------|
| Admin | admin@medischedule.com |
| Department Head | departmenthead@test.com |
| Doctor 1 | doctor1@test.com |
| Doctor 2 | doctor2@test.com |
| Doctor 3 | doctor3@test.com |
| Patient 1 | patient1@test.com |
| Patient 2 | patient2@test.com |
| Patient 3 | patient3@test.com |

---

## 🌐 TRUY CẬP

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **Health Check**: http://localhost:8001/health

---

## 🐛 LỖI THƯỜNG GẶP

### Lỗi: MySQL không kết nối được

**Kiểm tra:**
1. MySQL có đang chạy không?
   - Mở **Services** (Win + R → `services.msc`)
   - Tìm "MySQL80" → Click **Start**

2. Password có đúng không?
   - Mở file `backend/.env`
   - Kiểm tra dòng: `DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule`
   - Thay `190705` bằng password MySQL của bạn

### Lỗi: Port đã được sử dụng

**Backend (port 8001):**
```cmd
cd backend
venv\Scripts\activate
uvicorn server:app --reload --host 0.0.0.0 --port 8002
```
Rồi cập nhật `frontend/.env`: `REACT_APP_BACKEND_URL=http://localhost:8002`

**Frontend (port 3000):**
```cmd
set PORT=3001 && npm start
```

### Lỗi: Virtual environment không tồn tại

```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

## 📁 CẤU TRÚC PROJECT

```
medischedule/
├── START_BACKEND.bat          ← Click để chạy backend
├── START_FRONTEND.bat         ← Click để chạy frontend  
├── SETUP_DATABASE.bat         ← Click để setup database
│
├── backend/
│   ├── .env                   ← Cấu hình backend
│   ├── venv/                  ← Virtual environment
│   ├── server.py              ← Main server
│   ├── database.py            ← Database config
│   ├── models.py              ← Database models
│   ├── requirements.txt       ← Python dependencies
│   ├── init_database.py       ← Tạo bảng
│   ├── create_admin_mysql.py  ← Tạo admin
│   └── create_sample_simple.py ← Tạo dữ liệu mẫu
│
└── frontend/
    ├── .env                   ← Cấu hình frontend
    ├── package.json           ← Node dependencies
    └── src/                   ← React source code
```

---

## 📚 TÀI LIỆU CHI TIẾT

Xem file **HUONG_DAN_WINDOWS_LOCAL.md** để có hướng dẫn chi tiết hơn.

---

## 🎉 HOÀN TẤT!

Sau khi setup xong:
1. ✅ Chạy `START_BACKEND.bat`
2. ✅ Chạy `START_FRONTEND.bat`
3. ✅ Truy cập http://localhost:3000
4. ✅ Đăng nhập với tài khoản test

**Chúc bạn sử dụng vui vẻ! 🎊**
