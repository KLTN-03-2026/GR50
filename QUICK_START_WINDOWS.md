# 🚀 QUICK START - 3 BƯỚC NHANH

## ✅ BƯỚC 1: CÀI ĐẶT (1 lần duy nhất)

1. Cài đặt: **Python 3.11+**, **Node.js 20+**, **MySQL 8.0** (password: 190705)

2. Tạo database:
```cmd
mysql -u root -p
CREATE DATABASE medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

3. **Click đúp**: `SETUP_DATABASE.bat` ✅

---

## 🎮 BƯỚC 2: CHẠY ỨNG DỤNG

1. **Click đúp**: `START_BACKEND.bat` 
2. **Click đúp**: `START_FRONTEND.bat`

---

## 🌐 BƯỚC 3: TRUY CẬP

Mở trình duyệt: **http://localhost:3000**

### Đăng nhập với:
- Email: `patient1@test.com`
- Password: `12345678`

---

## 📋 TẤT CẢ TÀI KHOẢN TEST (Password: 12345678)

- `admin@medischedule.com` - Admin
- `departmenthead@test.com` - Trưởng khoa
- `doctor1@test.com` - Bác sĩ Tim mạch
- `doctor2@test.com` - Bác sĩ Nội khoa
- `doctor3@test.com` - Bác sĩ Ngoại khoa
- `patient1@test.com` - Bệnh nhân
- `patient2@test.com` - Bệnh nhân
- `patient3@test.com` - Bệnh nhân

---

## ❌ GẶP LỖI?

### MySQL không kết nối:
1. Mở Services (Win+R → `services.msc`)
2. Tìm "MySQL80" → Start
3. Sửa password trong `backend/.env` nếu cần

### Port đã sử dụng:
- Đóng các ứng dụng đang dùng port 3000 hoặc 8001

### Xem thêm:
- Chi tiết: `HUONG_DAN_WINDOWS_LOCAL.md`
- README: `README_WINDOWS.md`

---

**XEM VIDEO HƯỚNG DẪN** (nếu có)

**XONG! Chúc bạn sử dụng vui vẻ! 🎊**
