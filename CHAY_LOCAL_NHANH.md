# 🚀 CHẠY LOCAL NHANH - MEDISCHEDULE (Node.js version)

## ⚡ CHẠY NHANH TRONG 2 BƯỚC

### 1️⃣ SETUP DATABASE (XAMPP/MySQL)
1. Mở **XAMPP Control Panel** và nhấn **Start** tại **MySQL**.
2. Truy cập [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
3. Tạo database mới tên là: `database_benhvien` (hoặc tên trong file .env của bạn).
4. Nhấn vào tab **Import** và chọn file `medisched_full_data.sql` ở thư mục gốc project để nạp dữ liệu.

---

### 2️⃣ CHẠY ỨNG DỤNG (Cách dễ nhất)
Chỉ cần double-click vào file:
👉 **`run_local.bat`** (ở thư mục gốc project)

File này sẽ tự động:
- Kiểm tra Node.js và MySQL.
- Tự động cài đặt thư viện (`npm install`) nếu thiếu.
- Khởi động cả Backend và Frontend trong 2 cửa sổ riêng.
- Tự động mở trình duyệt tại địa chỉ: **http://localhost:3050**

---

## 🎯 ĐĂNG NHẬP NGAY
Sử dụng các tài khoản sau để test:

### 👨‍💼 Quản trị viên (Admin)
- **Email:** `admin@medischedule.com`
- **Password:** `12345678`

### 👨‍⚕️ Bác sĩ (Doctor)
- **Email:** `doctor1@test.com`
- **Password:** `12345678`

### 👤 Bệnh nhân (Patient)
- **Email:** `patient1@test.com`
- **Password:** `12345678`

---

## 🛠 CẤU HÌNH THỦ CÔNG (Nếu không dùng file .bat)

### Backend:
```bash
cd backend
npm install
npm start  # Chạy tại port 8001
```

### Frontend:
```bash
cd frontend
npm install
npm start  # Chạy tại port 3050
```

---

## ❌ LỖI THƯỜNG GẶP

### 1. Lỗi kết nối Database
**Dấu hiệu:** Backend báo lỗi "Access denied" hoặc "Can't connect".
**Giải pháp:** Kiểm tra file `backend/.env`, đảm bảo `DB_PASS` trùng với mật khẩu MySQL của bạn (XAMPP thường để trống).

### 2. Frontend không thấy dữ liệu
**Dấu hiệu:** Web hiện giao diện nhưng trắng thông tin bác sĩ/phòng khám.
**Giải pháp:** Đảm bảo file `frontend/.env` có dòng: `REACT_APP_BACKEND_URL=http://localhost:8001`.

---

**Made with ❤️ by MediSchedule Team**
