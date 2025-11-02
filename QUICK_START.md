# ⚡ Quick Start - MediSchedule

## 🎯 Khởi động nhanh trong 30 giây

### 1. Kiểm tra Services (5s)
```bash
sudo supervisorctl status
```

✅ Kết quả mong đợi:
```
backend    RUNNING
frontend   RUNNING
```

### 2. Mở Ứng Dụng (5s)
Truy cập: **https://frontend-invisible.preview.emergentagent.com**

### 3. Đăng Nhập (10s)
Chọn một trong các tài khoản sau:

#### 👨‍💼 Admin (Quản trị viên)
```
Email: admin@medischedule.com
Password: 12345678
```

#### 🏥 Department Head (Trưởng Khoa)
```
Email: departmenthead@test.com
Password: 12345678
```

#### 👨‍⚕️ Doctor (Bác Sĩ)
```
Email: doctor1@test.com
Password: 12345678
```

#### 👤 Patient (Bệnh Nhân)
```
Email: patient1@test.com
Password: 12345678
```

---

## 🔧 Nếu Có Lỗi

### Backend không chạy?
```bash
# Xem logs
tail -20 /var/log/supervisor/backend.err.log

# Restart
sudo supervisorctl restart backend
```

### MySQL không chạy?
```bash
# Kiểm tra
mysql -u root -p190705 -e "SHOW DATABASES;"

# Khởi động nếu cần
mysqld_safe --datadir='/var/lib/mysql' > /tmp/mysql.log 2>&1 &
sleep 3
sudo supervisorctl restart backend
```

### Frontend không load?
```bash
# Restart
sudo supervisorctl restart frontend

# Xem logs
tail -20 /var/log/supervisor/frontend.err.log
```

---

## 📊 Test API Nhanh

### Login Test
```bash
curl -X POST https://frontend-invisible.preview.emergentagent.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"patient1@test.com","password":"12345678"}'
```

### Register Test
```bash
curl -X POST https://frontend-invisible.preview.emergentagent.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@test.com",
    "username":"test",
    "password":"12345678",
    "full_name":"Test User",
    "phone":"0123456789",
    "date_of_birth":"1990-01-01",
    "address":"Test Address",
    "role":"patient"
  }'
```

---

## 📖 Tài Liệu Chi Tiết

- 📄 **README.md** - Tổng quan dự án
- 📄 **README_LOCALHOST.md** - Hướng dẫn chi tiết MySQL & troubleshooting
- 📄 **test_result.md** - Kết quả testing và trạng thái

---

## ✅ Checklist Hoàn Thành

- [x] MySQL server đang chạy
- [x] Database `medischedule` đã được tạo
- [x] 8 tables đã được tạo
- [x] Admin & sample data đã được tạo
- [x] Backend kết nối MySQL thành công
- [x] Frontend đang chạy
- [x] Authentication 100% working (7/7 tests PASS)

---

**Chúc bạn sử dụng thành công! 🎉**

Nếu cần hỗ trợ, xem file **README_LOCALHOST.md** hoặc kiểm tra logs.
