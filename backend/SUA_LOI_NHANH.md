# ======================================
# HƯỚNG DẪN SỬA LỖI NHANH - 5 PHÚT
# ======================================

## ❌ LỖI HIỆN TẠI:
```
No connection could be made because the target machine actively refused it
ERROR: "POST /api/auth/login HTTP/1.1" 500 Internal Server Error
```

**Nguyên nhân**: Backend cần MongoDB nhưng MongoDB chưa cài trên Windows

---

## ✅ GIẢI PHÁP NHANH (5 PHÚT)

### Bước 1: Download MongoDB
Link: https://www.mongodb.com/try/download/community

- Chọn Version: 7.0.x (Latest)
- Platform: Windows
- Package: msi

### Bước 2: Cài đặt MongoDB
1. Chạy file .msi vừa download
2. Chọn "Complete" installation
3. **QUAN TRỌNG**: Tick ✅ "Install MongoDB as a Service"
4. **QUAN TRỌNG**: Tick ✅ "Run service as Network Service user"
5. Click Install và đợi hoàn thành

### Bước 3: Khởi động MongoDB Service

**Cách 1: Qua Services**
```
1. Nhấn Windows + R
2. Gõ: services.msc
3. Tìm "MongoDB Server"
4. Right-click → Start
```

**Cách 2: Command Prompt (Run as Administrator)**
```cmd
net start MongoDB
```

### Bước 4: Kiểm tra MongoDB đang chạy
```cmd
# Mở Command Prompt
mongosh
# Nếu thấy "MongoDB shell" là thành công!
# Gõ "exit" để thoát
```

### Bước 5: Chạy lại Backend
```cmd
cd D:\web\web_12\backend
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Bước 6: Tạo Sample Data
```cmd
# Mở terminal mới
cd D:\web\web_12\backend  
python create_sample_data.py
```

---

## 🎯 SAU KHI XONG

✅ Backend chạy: http://localhost:8001
✅ API Docs: http://localhost:8001/api/docs
✅ Login với: admin@medischedule.com / 12345678

---

## 🔄 NẾU VẪN LỖI

### MongoDB service không start được:
```cmd
# Run as Administrator
sc delete MongoDB
# Rồi cài lại MongoDB
```

### Port 27017 bị chiếm:
```cmd
netstat -ano | findstr :27017
taskkill /PID <PID> /F
net start MongoDB
```

### Muốn dùng MySQL thay thế:
→ Báo tôi, tôi sẽ hoàn thành migration MySQL (cần thêm 1 giờ)

---

## 📝 TÀI KHOẢN TEST

Sau khi chạy `create_sample_data.py`:

- **Admin**: admin@medischedule.com / 12345678
- **Department Head**: departmenthead@test.com / 12345678
- **Doctor**: doctor1@test.com / 12345678
- **Patient**: patient1@test.com / 12345678

---

## ⚡ TÓM TẮT
1. Cài MongoDB (3 phút)
2. Start service (10 giây)
3. Chạy backend (10 giây)
4. Tạo data (30 giây)
5. ✅ XONG!
