# ✅ CHECKLIST CÀI ĐẶT - MEDISCHEDULE

## 📦 BƯỚC 1: CÀI ĐẶT PHẦN MỀM

- [ ] Python 3.11+ đã cài đặt
  - Kiểm tra: `python --version`
  - Download: https://www.python.org/downloads/

- [ ] Node.js 20+ đã cài đặt
  - Kiểm tra: `node --version`
  - Download: https://nodejs.org/

- [ ] MySQL 8.0 đã cài đặt
  - Kiểm tra: `mysql --version`
  - Download: https://dev.mysql.com/downloads/installer/
  - Password root đã đặt: `190705`

---

## 🗄️ BƯỚC 2: TẠO DATABASE

- [ ] Mở MySQL
  ```cmd
  mysql -u root -p
  ```

- [ ] Tạo database
  ```sql
  CREATE DATABASE medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

- [ ] Kiểm tra database đã tạo
  ```sql
  SHOW DATABASES;
  ```

- [ ] Thoát MySQL
  ```sql
  EXIT;
  ```

---

## 🔧 BƯỚC 3: SETUP BACKEND

- [ ] Cấu hình file `backend/.env`
  ```env
  DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule
  JWT_SECRET_KEY=your-secret-key-change-in-production
  ACCESS_TOKEN_EXPIRE_MINUTES=10080
  CORS_ORIGINS=*
  ```

- [ ] Chạy `SETUP_DATABASE.bat` hoặc:
  ```cmd
  cd backend
  python -m venv venv
  venv\Scripts\activate
  pip install -r requirements.txt
  python init_database.py
  python create_admin_mysql.py
  python create_sample_simple.py
  ```

- [ ] Kiểm tra database có dữ liệu
  ```cmd
  mysql -u root -p190705 -e "USE medischedule; SELECT COUNT(*) FROM users;"
  ```
  *(Kết quả phải là 8 users)*

---

## 🎨 BƯỚC 4: SETUP FRONTEND

- [ ] Cấu hình file `frontend/.env`
  ```env
  REACT_APP_BACKEND_URL=http://localhost:8001
  ```

- [ ] Cài đặt dependencies
  ```cmd
  cd frontend
  npm install
  ```

---

## 🚀 BƯỚC 5: CHẠY ỨNG DỤNG

### Backend:
- [ ] Mở Command Prompt
- [ ] Chạy `START_BACKEND.bat` hoặc:
  ```cmd
  cd backend
  venv\Scripts\activate
  python server.py
  ```
- [ ] Backend chạy tại: http://localhost:8001
- [ ] Test health check: http://localhost:8001/health

### Frontend:
- [ ] Mở Command Prompt MỚI
- [ ] Chạy `START_FRONTEND.bat` hoặc:
  ```cmd
  cd frontend
  npm start
  ```
- [ ] Frontend tự động mở: http://localhost:3000

---

## ✅ BƯỚC 6: KIỂM TRA

- [ ] Truy cập http://localhost:3000
- [ ] Trang chủ hiển thị đúng
- [ ] Click "Đăng nhập"
- [ ] Đăng nhập với:
  - Email: `patient1@test.com`
  - Password: `12345678`
- [ ] Dashboard bệnh nhân hiển thị
- [ ] Có thể tìm bác sĩ
- [ ] Có thể đặt lịch hẹn

---

## 🧪 BƯỚC 7: TEST TẤT CẢ TÀI KHOẢN

### Admin
- [ ] Email: `admin@medischedule.com`
- [ ] Password: `12345678`
- [ ] Dashboard admin hiển thị
- [ ] Có thể quản lý users

### Department Head
- [ ] Email: `departmenthead@test.com`
- [ ] Password: `12345678`
- [ ] Dashboard trưởng khoa hiển thị
- [ ] Có thể tạo bác sĩ/bệnh nhân

### Doctor
- [ ] Email: `doctor1@test.com`
- [ ] Password: `12345678`
- [ ] Dashboard bác sĩ hiển thị
- [ ] Có thể xem lịch hẹn

### Patient
- [ ] Email: `patient1@test.com`
- [ ] Password: `12345678`
- [ ] Dashboard bệnh nhân hiển thị
- [ ] Có thể đặt lịch hẹn

---

## 🎯 HOÀN TẤT!

Nếu tất cả checkbox đã được tích ✅:
- **Ứng dụng đã sẵn sàng sử dụng!**
- **Bạn có thể bắt đầu test các tính năng!**

---

## 📞 NẾU GẶP VẤN ĐỀ

Xem các file hướng dẫn:
1. `QUICK_START_WINDOWS.md` - Hướng dẫn nhanh
2. `README_WINDOWS.md` - README đầy đủ
3. `HUONG_DAN_WINDOWS_LOCAL.md` - Chi tiết từng bước

Hoặc kiểm tra phần **TROUBLESHOOTING** trong các file trên.

---

**Chúc mừng! Bạn đã hoàn thành cài đặt! 🎊**
