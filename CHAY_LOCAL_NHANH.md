# 🚀 CHẠY LOCAL NHANH - MEDISCHEDULE

## ⚡ CHẠY NHANH TRONG 5 PHÚT

### 1️⃣ CÀI ĐẶT MYSQL

**Windows (XAMPP - Dễ nhất):**
1. Tải XAMPP: https://www.apachefriends.org/download.html
2. Cài đặt và mở XAMPP Control Panel
3. Click **Start** ở MySQL
4. Vào phpMyAdmin: http://localhost/phpmyadmin
5. Tạo database tên `medischedule`

**macOS:**
```bash
brew install mysql
brew services start mysql
mysql -u root -e "CREATE DATABASE medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Linux:**
```bash
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql -e "CREATE DATABASE medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

### 2️⃣ SETUP DATABASE

```bash
cd backend

# Nếu bạn dùng XAMPP (Windows), password root mặc định là trống
# Sửa file .env: DATABASE_URL=mysql+aiomysql://root:@localhost:3306/medischedule

# Tạo tables và dữ liệu mẫu
python create_tables.py
python create_admin_mysql.py
python create_sample_data_mysql.py
```

---

### 3️⃣ CHẠY BACKEND

```bash
cd backend

# Cài dependencies (chỉ lần đầu)
pip install -r requirements.txt

# Chạy server
python server.py
```

✅ Backend chạy tại: **http://localhost:8001**

---

### 4️⃣ CHẠY FRONTEND

**Mở terminal/CMD mới:**

```bash
cd frontend

# Cài dependencies (chỉ lần đầu)
npm install -g yarn
yarn install

# Chạy frontend
yarn start
```

✅ Frontend tự động mở: **http://localhost:3000**

---

## 🎯 ĐĂNG NHẬP NGAY

### 👨‍⚕️ Tài Khoản Admin
- **Email:** admin@medischedule.com
- **Password:** 12345678

### 🏥 Tài Khoản Bác Sĩ
- **Email:** doctor1@test.com
- **Password:** 12345678

### 🏥 Tài Khoản Bệnh Nhân
- **Email:** patient1@test.com
- **Password:** 12345678

---

## ❌ LỖI THƯỜNG GẶP

### Lỗi: "Can't connect to MySQL"
**Giải pháp:**
- Đảm bảo MySQL đang chạy
- Windows XAMPP: Mở Control Panel và Start MySQL
- Kiểm tra password trong file `backend/.env`

### Lỗi: Port 3000 đã được sử dụng
**Giải pháp:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [số PID] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Frontend không kết nối Backend
**Giải pháp:**
1. Kiểm tra `frontend/.env` có dòng: `REACT_APP_BACKEND_URL=http://localhost:8001`
2. Restart frontend: Ctrl+C rồi `yarn start` lại
3. Xóa cache trình duyệt: Ctrl+Shift+Del

---

## 🌐 CHIA SẺ TRONG MẠNG LAN

Sau khi chạy thành công trên máy local, bạn có thể chia sẻ cho người khác trong cùng mạng:

### 1. Tìm địa chỉ IP của máy bạn:

**Windows:**
```cmd
ipconfig
```
Tìm dòng "IPv4 Address" (ví dụ: 192.168.1.100)

**macOS/Linux:**
```bash
ifconfig
```
Tìm "inet" (ví dụ: 192.168.1.100)

### 2. Chia sẻ link:
Gửi cho người khác link: **http://192.168.1.100:3000**

⚠️ **Lưu ý:** 
- Tắt firewall hoặc cho phép port 3000, 8001
- Máy bạn và máy họ phải cùng mạng WiFi/LAN

---

## 🎉 XONG!

Giờ bạn có thể:
- ✅ Truy cập: http://localhost:3000
- ✅ Đăng nhập với tài khoản test ở trên
- ✅ Test đầy đủ tính năng
- ✅ Chia sẻ trong mạng LAN với IP máy bạn

---

## 📞 CẦN TRỢ GIÚP?

Kiểm tra nhanh:
1. MySQL đang chạy? → `mysql -u root -p` (nhập password)
2. Backend đang chạy? → Mở http://localhost:8001/health
3. Frontend đang chạy? → Mở http://localhost:3000

**Mọi thứ OK? Bắt đầu sử dụng thôi! 🚀**
