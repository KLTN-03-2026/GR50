# 🪟 HƯỚNG DẪN CÀI ĐẶT TRÊN WINDOWS

## Bước 1: Cài Đặt MySQL

### Tải và cài MySQL:
1. Tải MySQL từ: https://dev.mysql.com/downloads/installer/
2. Chọn "MySQL Installer for Windows"
3. Cài đặt với các tùy chọn:
   - MySQL Server 8.0
   - MySQL Workbench (tùy chọn)
4. Trong quá trình cài đặt:
   - Root password: **190705**
   - Port: **3306**

### Kiểm tra MySQL đã cài:
```powershell
mysql --version
```

---

## Bước 2: Tạo Database

### Mở PowerShell và chạy:

```powershell
cd D:\web\web_12\backend
mysql -u root -p190705 < create_database_integer_id.sql
```

Nếu lỗi "mysql command not found", thêm MySQL vào PATH:
1. Tìm MySQL: Thường ở `C:\Program Files\MySQL\MySQL Server 8.0\bin`
2. Thêm vào Environment Variables
3. Restart PowerShell

**Hoặc dùng đường dẫn đầy đủ:**
```powershell
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p190705 < create_database_integer_id.sql
```

---

## Bước 3: Kiểm Tra Database Đã Tạo

```powershell
mysql -u root -p190705 -e "SHOW DATABASES;"
mysql -u root -p190705 -e "USE medischedule; SHOW TABLES;"
```

Bạn phải thấy:
- Database: `medischedule`
- 9 bảng: users, patients, doctors, specialties, appointments, chat_messages, payments, ai_chat_history, admin_permissions

---

## Bước 4: Kiểm Tra File .env

Mở file `backend/.env` và đảm bảo có:

```env
# MySQL Database Configuration
DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS Configuration
CORS_ORIGINS=*

# Environment
ENVIRONMENT=development

# OpenAI API (for AI features)
EMERGENT_LLM_KEY=your-emergent-llm-key-here
```

---

## Bước 5: Cài Đặt Python Dependencies

```powershell
cd D:\web\web_12\backend
pip install -r requirements.txt
```

Hoặc nếu dùng virtual environment:
```powershell
cd D:\web\web_12\backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

## Bước 6: Tạo Dữ Liệu Mẫu

```powershell
cd D:\web\web_12\backend
python create_sample_data_local.py
```

Bạn sẽ thấy:
```
✓ Created specialty: Tim mạch
✓ Created specialty: Nội khoa
...
✓ Created admin account
✓ Created department head
✓ Created doctor: Dr. Nguyễn Văn A
...
✓ Created patient: Nguyễn Văn X
...
✅ SAMPLE DATA CREATED SUCCESSFULLY!
```

---

## Bước 7: Khởi Động Backend

```powershell
cd D:\web\web_12\backend
python server.py
```

Bạn sẽ thấy:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
Successfully connected to MySQL database
```

**Backend đang chạy tại:** http://localhost:8001

---

## Bước 8: Khởi Động Frontend

Mở **PowerShell mới** (giữ backend đang chạy):

```powershell
cd D:\web\web_12\frontend
npm install
# hoặc
yarn install

# Sau đó chạy:
npm start
# hoặc
yarn start
```

**Frontend đang chạy tại:** http://localhost:3000

---

## 🔑 Tài Khoản Để Đăng Nhập

Tất cả tài khoản sử dụng mật khẩu: **12345678**

### Admin:
- Email: `admin@medischedule.com`
- Mật khẩu: `12345678`

### Trưởng Khoa:
- Email: `departmenthead@test.com`
- Mật khẩu: `12345678`

### Bác Sĩ:
- Email: `doctor1@test.com` / `doctor2@test.com` / `doctor3@test.com`
- Mật khẩu: `12345678`

### Bệnh Nhân:
- Email: `patient1@test.com` / `patient2@test.com` / `patient3@test.com`
- Mật khẩu: `12345678`

---

## 🔧 Khắc Phục Sự Cố

### Lỗi: "Can't connect to MySQL server"
```powershell
# Kiểm tra MySQL đang chạy:
Get-Service MySQL*

# Nếu stopped, start nó:
Start-Service MySQL80
```

### Lỗi: "Access denied for user 'root'@'localhost'"
- Kiểm tra lại password trong .env file: `190705`
- Reset MySQL root password nếu cần

### Lỗi: "Unknown database 'medischedule'"
```powershell
mysql -u root -p190705 < create_database_integer_id.sql
```

### Lỗi: "ModuleNotFoundError: No module named 'xxx'"
```powershell
pip install -r requirements.txt
```

### Frontend không kết nối được Backend:
1. Kiểm tra Backend đang chạy: http://localhost:8001/api/health
2. Kiểm tra file `frontend/.env`:
   ```
   REACT_APP_BACKEND_URL=http://localhost:8001/api
   ```

---

## ✅ Kiểm Tra Hệ Thống

### 1. Kiểm tra Backend:
```powershell
curl http://localhost:8001/api/health
```

Kết quả:
```json
{"status":"healthy","database":"mysql"}
```

### 2. Kiểm tra Login:
```powershell
curl -X POST http://localhost:8001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"login\":\"patient1@test.com\",\"password\":\"12345678\"}'
```

Phải trả về JWT token.

### 3. Kiểm tra Frontend:
Mở trình duyệt: http://localhost:3000

---

## 📝 Ghi Chú Quan Trọng

1. **Backend phải chạy trước Frontend**
2. **Giữ 2 cửa sổ PowerShell**: 1 cho Backend, 1 cho Frontend
3. **MySQL phải đang chạy** trước khi start Backend
4. **Port 3000 và 8001** không được dùng bởi app khác

---

## 🎉 Hoàn Tất!

Bây giờ bạn có thể:
- ✅ Đăng nhập vào http://localhost:3000
- ✅ Dùng tài khoản bất kỳ (mật khẩu: 12345678)
- ✅ Quản lý bệnh viện của bạn!

**Chúc bạn sử dụng vui vẻ! 🏥**
