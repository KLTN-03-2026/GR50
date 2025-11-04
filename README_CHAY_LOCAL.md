# 🏥 HƯỚNG DẪN CHẠY LOCAL VỚI MySQL

## ✅ ỨNG DỤNG ĐÃ LOẠI BỎ HOÀN TOÀN MongoDB

**Ứng dụng hiện chỉ sử dụng MySQL database!**

---

## 🚀 CÁCH CHẠY NHANH (3 BƯỚC)

### Bước 1: Cài đặt MySQL
1. Download MySQL từ: https://dev.mysql.com/downloads/installer/
2. Cài đặt với password root: `190705`
3. Khởi động MySQL service

### Bước 2: Setup Database
**Click đúp file:** `SETUP_MYSQL_LOCAL.bat`

Script sẽ tự động:
- ✅ Tạo database `medischedule`
- ✅ Tạo Python virtual environment
- ✅ Cài đặt dependencies
- ✅ Tạo 9 bảng trong MySQL
- ✅ Tạo admin account
- ✅ Tạo 8 test accounts

### Bước 3: Chạy Ứng Dụng
1. **Click đúp:** `START_BACKEND_LOCAL.bat`
   - Chờ thông báo: "Backend đang chạy tại http://localhost:8001"
   - **KHÔNG đóng terminal!**

2. **Click đúp:** `START_FRONTEND_LOCAL.bat` (terminal mới)
   - Trình duyệt tự động mở: http://localhost:3000
   - **KHÔNG đóng terminal!**

---

## 🔐 TÀI KHOẢN TEST

**TẤT CẢ PASSWORD:** `12345678`

| Role | Email |
|------|-------|
| Admin | admin@medischedule.com |
| Dept Head | departmenthead@test.com |
| Doctor | doctor1@test.com |
| Patient | patient1@test.com |

---

## 📊 DATABASE

### Thông tin kết nối:
- **Host:** localhost
- **Port:** 3306
- **Database:** medischedule
- **User:** root
- **Password:** 190705

### 9 Bảng MySQL:
1. users
2. patients
3. doctors
4. specialties
5. appointments
6. payments
7. chat_messages
8. ai_chat_history
9. admin_permissions

---

## 🧪 KIỂM TRA

### Test Backend:
```cmd
curl http://localhost:8001/health
```

### Test Login:
1. Mở http://localhost:3000
2. Email: `patient1@test.com`
3. Password: `12345678`

---

## 🐛 XỬ LÝ LỖI

### Lỗi: MySQL không kết nối
1. Mở Services (Win + R → services.msc)
2. Tìm "MySQL80"
3. Click Start

### Lỗi: Port đã được sử dụng
```cmd
# Tìm và kill process
netstat -ano | findstr :8001
taskkill /PID [số_PID] /F
```

---

## 📁 CẤU TRÚC FILE

```
project/
├── SETUP_MYSQL_LOCAL.bat          ← Click để setup
├── START_BACKEND_LOCAL.bat        ← Click để chạy backend
├── START_FRONTEND_LOCAL.bat       ← Click để chạy frontend
├── HUONG_DAN_MYSQL_LOCAL.md       ← Hướng dẫn chi tiết
│
├── backend/
│   ├── .env                       ← ✅ MySQL config
│   ├── server.py                  ← FastAPI server
│   ├── database.py                ← ✅ SQLAlchemy MySQL
│   └── requirements.txt           ← ✅ Không có MongoDB
│
└── frontend/
    ├── .env                       ← Backend URL
    └── src/                       ← React app
```

---

## ✅ CHECKLIST

- [ ] MySQL đã cài đặt
- [ ] Đã chạy SETUP_MYSQL_LOCAL.bat
- [ ] Backend chạy tại :8001
- [ ] Frontend chạy tại :3000
- [ ] Login thành công

---

## 🎉 HOÀN TẤT!

**Ứng dụng đã sẵn sàng với MySQL!**

- Frontend: http://localhost:3000
- Backend: http://localhost:8001
- API Docs: http://localhost:8001/api/docs

**Xem hướng dẫn chi tiết:** `HUONG_DAN_MYSQL_LOCAL.md`
