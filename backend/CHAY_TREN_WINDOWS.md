# 🚀 HƯỚNG DẪN CHẠY ỨNG DỤNG TRÊN WINDOWS

## ✅ Đã Sửa Lỗi

1. **ModuleNotFoundError: No module named 'jwt'** → ✅ Fixed (dùng `from jose import jwt`)
2. **DeprecationWarning: on_event** → ✅ Fixed (dùng lifespan event handlers)
3. **MongoDB Connection Issues** → 💡 2 Options (MongoDB hoặc MySQL)

---

## 📋 Option 1: Chạy với MongoDB (NHANH - 5 phút)

### Bước 1: Cài MongoDB
1. Download MongoDB Community: https://www.mongodb.com/try/download/community
2. Chạy installer với quyền Administrator
3. Chọn "Complete" installation
4. Tick "Install MongoDB as a Service"
5. Finish installation

### Bước 2: Start MongoDB Service
```cmd
# Mở Services (services.msc)
# Tìm "MongoDB" và click Start
# Hoặc dùng command:
net start MongoDB
```

### Bước 3: Cài Python Dependencies
```cmd
cd D:\web\web_12\backend
pip install -r requirements.txt
```

### Bước 4: Chạy Backend
```cmd
cd D:\web\web_12\backend
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Bước 5: Tạo Sample Data
```cmd
# Mở terminal mới
cd D:\web\web_12\backend
python create_sample_data.py
```

✅ Backend chạy tại: http://localhost:8001
✅ API Docs: http://localhost:8001/api/docs

---

## 📋 Option 2: Chạy với MySQL (CHẬM - 2 giờ, đã chuẩn bị 70%)

### Tình trạng hiện tại:
- ✅ Database schema đã sẵn sàng (8 tables)
- ✅ SQLAlchemy models đã hoàn chỉnh
- ✅ MySQL connection đã cấu hình
- ⏳ Server.py cần convert 49 endpoints (đang thực hiện)

### Đã tạo:
1. `database.py` - SQLAlchemy models
2. `create_database.sql` - SQL script tạo database
3. `.env` - MySQL config (localhost:3306, root/190705)
4. `test_mysql_connection.py` - Test script

### Để tiếp tục với MySQL:
```cmd
# 1. Chạy SQL script trong MySQL Workbench
# Mở file: D:\web\web_12\backend\create_database.sql
# Execute toàn bộ script

# 2. Test connection
cd D:\web\web_12\backend
python test_mysql_connection.py

# 3. Đợi tôi hoàn thành viết lại 49 endpoints
```

---

## 🎯 KHUYẾN NGHỊ

**Chọn Option 1 (MongoDB)** vì:
- ✅ Nhanh chóng (5 phút vs 2 giờ)
- ✅ Code đã hoàn chỉnh và tested
- ✅ Có sample data sẵn
- ✅ Tất cả 49 endpoints đang hoạt động

**Option 2 (MySQL)** chỉ nên chọn nếu:
- Bạn bắt buộc phải dùng MySQL
- Có thời gian chờ migration hoàn thành
- Muốn customize database schema

---

## 🐛 Troubleshooting

### Lỗi: Port 8001 already in use
```cmd
# Kill process trên port 8001
netstat -ano | findstr :8001
taskkill /PID <PID_NUMBER> /F
```

### Lỗi: MongoDB connection failed
```cmd
# Check service status
net start MongoDB
# Hoặc khởi động lại
net stop MongoDB
net start MongoDB
```

### Lỗi: Module not found
```cmd
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

---

## 📞 Tài Khoản Test (sau khi chạy create_sample_data.py)

- **Admin**: admin@medischedule.com / 12345678
- **Department Head**: departmenthead@test.com / 12345678
- **Doctor**: doctor1@test.com / 12345678
- **Patient**: patient1@test.com / 12345678

---

## ✨ Chạy Frontend

```cmd
cd D:\web\web_12\frontend
yarn install
yarn start
```

Frontend: http://localhost:3000
