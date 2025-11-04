# 🏥 HƯỚNG DẪN CHẠY LOCAL VỚI MySQL

## ✅ LOẠI BỎ HOÀN TOÀN MongoDB - CHỈ DÙNG MySQL

---

## 🚀 3 BƯỚC CHẠY ỨNG DỤNG

### BƯỚC 1️⃣: Cài đặt MySQL

**Windows:**
1. Download: https://dev.mysql.com/downloads/installer/
2. Chọn "Developer Default"
3. Đặt Root Password: `190705`
4. Port: `3306`

**Linux:**
```bash
sudo apt install mariadb-server -y
sudo systemctl start mariadb
```

### BƯỚC 2️⃣: Setup Database

**Click đúp file:** `SETUP_MYSQL_LOCAL.bat` (Windows)

**Hoặc chạy thủ công:**
```bash
# Tạo database
mysql -u root -p190705 -e "CREATE DATABASE medischedule CHARACTER SET utf8mb4;"

# Setup backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux
pip install -r requirements.txt
python init_database.py
python create_admin_mysql.py
python create_sample_simple.py
```

### BƯỚC 3️⃣: Chạy ứng dụng

**Terminal 1 - Backend:**
```bash
# Click đúp: START_BACKEND_LOCAL.bat (Windows)
# Hoặc:
cd backend
venv\Scripts\activate
python server.py
```

**Terminal 2 - Frontend:**
```bash
# Click đúp: START_FRONTEND_LOCAL.bat (Windows)
# Hoặc:
cd frontend
npm start
```

---

## 🔐 TÀI KHOẢN TEST

**Password: 12345678**

- Admin: `admin@medischedule.com`
- Doctor: `doctor1@test.com`
- Patient: `patient1@test.com`

---

## 🌐 TRUY CẬP

- Frontend: http://localhost:3000
- Backend: http://localhost:8001
- API Docs: http://localhost:8001/api/docs

---

## 🐛 XỬ LÝ LỖI

### MySQL không kết nối
```bash
# Windows: Mở Services → MySQL80 → Start
# Linux:
sudo systemctl start mariadb
```

### Port đã dùng
```bash
# Tìm và kill process
netstat -ano | findstr :8001  # Windows
lsof -i :8001                 # Linux
taskkill /PID [PID] /F        # Windows
kill -9 [PID]                 # Linux
```

### Reset database
```bash
mysql -u root -p190705
DROP DATABASE medischedule;
CREATE DATABASE medischedule CHARACTER SET utf8mb4;
EXIT;

cd backend
python init_database.py
python create_admin_mysql.py
python create_sample_simple.py
```

---

## 📊 DATABASE INFO

- **Host:** localhost
- **Port:** 3306
- **Database:** medischedule
- **User:** root
- **Password:** 190705

**9 Bảng MySQL:**
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

## 📁 CẤU HÌNH

### Backend (.env)
```env
DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule
JWT_SECRET_KEY=your-secret-key-change-in-production
CORS_ORIGINS=*
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## ✅ CHECKLIST

- [ ] MySQL đã cài đặt và chạy
- [ ] Database medischedule đã tạo
- [ ] Backend dependencies đã cài
- [ ] Frontend dependencies đã cài
- [ ] Test accounts đã tạo
- [ ] Backend chạy tại :8001
- [ ] Frontend chạy tại :3000
- [ ] Login thành công

---

## 🎉 HOÀN TẤT!

**Ứng dụng 100% dùng MySQL - Không có MongoDB!**

📖 Xem hướng dẫn chi tiết: `HUONG_DAN_MYSQL_LOCAL.md`
