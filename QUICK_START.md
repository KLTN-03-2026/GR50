# 🚀 QUICK START GUIDE - MEDISCHEDULE

## Chạy nhanh trong 5 phút!

### Bước 1: Cài đặt phần mềm cần thiết

✅ **Python 3.8+**: https://www.python.org/downloads/
✅ **Node.js 16+**: https://nodejs.org/
✅ **MySQL 8.0+**: https://dev.mysql.com/downloads/installer/

### Bước 2: Cài dependencies

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install -g yarn
yarn install
```

### Bước 3: Setup Database

**Double-click file**: `SETUP_DATABASE_WINDOWS.bat`

Hoặc chạy lệnh:
```bash
cd backend
mysql -u root -p190705 < create_database.sql
python create_admin_mysql.py
python create_sample_data_mysql.py
```

### Bước 4: Chạy ứng dụng

**Mở 2 terminal:**

**Terminal 1**: Double-click `START_BACKEND_WINDOWS.bat`
**Terminal 2**: Double-click `START_FRONTEND_WINDOWS.bat`

### Bước 5: Truy cập ứng dụng

🌐 **Frontend**: http://localhost:3000
🔧 **Backend API Docs**: http://localhost:8001/api/docs

---

## 🔐 Tài khoản đăng nhập

**Admin**: admin@medischedule.com / 12345678
**Dept Head**: departmenthead@test.com / 12345678
**Doctor**: doctor1@test.com / 12345678
**Patient**: patient1@test.com / 12345678

---

## ⚠️ Lưu ý quan trọng

1. **Password MySQL**: File `backend/.env` dùng password `190705`
   - Nếu password MySQL của bạn khác, sửa trong `.env`

2. **Kiểm tra MySQL đang chạy**:
   - Windows: Services → MySQL → Start
   - XAMPP: Control Panel → Start MySQL

3. **Frontend URL Backend**:
   - File `frontend/.env` phải có: `REACT_APP_BACKEND_URL=http://localhost:8001`

---

## 🐛 Gặp lỗi?

Xem hướng dẫn chi tiết trong: **README_WINDOWS.md**

---

**Chúc bạn thành công! 🎉**
