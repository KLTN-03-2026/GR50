# 🏥 MediSchedule - Chạy Local

## 🚀 CHẠY NHANH (3 Lệnh)

### macOS/Linux:
```bash
# 1. Cài MySQL
brew install mysql && brew services start mysql

# 2. Chạy script tự động
bash run_local.sh
```

### Windows:
```cmd
# 1. Tải và cài XAMPP từ: https://www.apachefriends.org

# 2. Mở XAMPP, Start MySQL

# 3. Double-click file: run_local.bat
```

---

## 📚 HƯỚNG DẪN CHI TIẾT

- **Người mới:** Đọc [CHAY_LOCAL_NHANH.md](./CHAY_LOCAL_NHANH.md)
- **Hướng dẫn đầy đủ:** Đọc [HUONG_DAN_CHAY_LOCAL.md](./HUONG_DAN_CHAY_LOCAL.md)

---

## 🎯 TRUY CẬP

Sau khi chạy thành công:

- **Ứng dụng:** http://localhost:3000
- **API Backend:** http://localhost:8001
- **API Docs:** http://localhost:8001/docs

---

## 👥 TÀI KHOẢN TEST

| Vai trò | Email | Password |
|---------|-------|----------|
| Admin | admin@medischedule.com | 12345678 |
| Bác sĩ | doctor1@test.com | 12345678 |
| Bệnh nhân | patient1@test.com | 12345678 |

---

## 📁 CẤU TRÚC DỰ ÁN

```
app/
├── backend/              # FastAPI Backend (Python)
│   ├── server.py        # Main server
│   ├── models.py        # Database models
│   ├── .env             # Cấu hình (ĐÃ ĐỔI SANG LOCAL)
│   └── requirements.txt # Python packages
│
├── frontend/            # React Frontend
│   ├── src/
│   ├── .env            # Cấu hình (ĐÃ ĐỔI SANG LOCAL)
│   └── package.json    # Node packages
│
├── run_local.sh        # Script tự động (macOS/Linux)
├── run_local.bat       # Script tự động (Windows)
└── README_LOCAL.md     # File này
```

---

## 🔧 CẤU HÌNH ĐÃ THAY ĐỔI

### ✅ Backend (.env)
```env
# Trước (Emergent)
DATABASE_URL=mysql+aiomysql://root:190705@host.docker.internal:3306/medischedule

# Sau (Local)
DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule
```

### ✅ Frontend (.env)
```env
# Trước (Emergent)
REACT_APP_BACKEND_URL=https://bookingcare-clone.preview.emergentagent.com
PORT=3050

# Sau (Local)
REACT_APP_BACKEND_URL=http://localhost:8001
PORT=3000
```

---

## 🌐 CHIA SẺ TRONG MẠNG LAN

### 1. Tìm IP máy của bạn:

**Windows:**
```cmd
ipconfig
```

**macOS/Linux:**
```bash
ifconfig | grep "inet "
```

### 2. Chia sẻ link:
Gửi cho người khác: `http://[IP-của-bạn]:3000`

Ví dụ: `http://192.168.1.100:3000`

---

## 🛑 DỪNG ỨNG DỤNG

### macOS/Linux:
```bash
./stop.sh
```

### Windows:
- Đóng cửa sổ CMD/Terminal
- Hoặc: Ctrl+C trong terminal

---

## ❓ LỖI THƯỜNG GẶP

### MySQL không kết nối được
```bash
# Kiểm tra MySQL đang chạy
mysql -u root -p

# macOS: Khởi động MySQL
brew services start mysql

# Linux: Khởi động MySQL
sudo systemctl start mysql

# Windows: Mở XAMPP và Start MySQL
```

### Port 3000 hoặc 8001 đã được sử dụng
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:8001 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

### Module not found
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
yarn install
```

---

## 📞 HỖ TRỢ

Kiểm tra nhanh:

1. **MySQL chạy chưa?**
   ```bash
   mysql -u root -p
   ```

2. **Backend chạy chưa?**
   http://localhost:8001/health

3. **Frontend chạy chưa?**
   http://localhost:3000

---

## 🎉 HOÀN THÀNH!

Bây giờ bạn có thể:
- ✅ Chạy hoàn toàn offline trên máy local
- ✅ Không cần internet (trừ AI features)
- ✅ Tốc độ nhanh hơn
- ✅ Chia sẻ trong mạng LAN
- ✅ Kết nối domain của bạn (server.id.vn) nếu muốn

**Chúc bạn sử dụng thành công! 🚀**
