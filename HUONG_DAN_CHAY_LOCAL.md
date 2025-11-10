# 📘 HƯỚNG DẪN CHẠY DỰ ÁN MEDISCHEDULE TRÊN MÁY CÁ NHÂN

> **Dành cho người mới bắt đầu** - Hướng dẫn từng bước chi tiết, không cần kiến thức lập trình

---

## 📋 MỤC LỤC

1. [Giới thiệu dự án](#-giới-thiệu-dự-án)
2. [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
3. [Cài đặt phần mềm cần thiết](#-bước-1-cài-đặt-phần-mềm-cần-thiết)
4. [Cài đặt dự án](#-bước-2-cài-đặt-dự-án)
5. [Cấu hình database](#-bước-3-cấu-hình-database)
6. [Chạy ứng dụng](#-bước-4-chạy-ứng-dụng)
7. [Tài khoản đăng nhập](#-tài-khoản-đăng-nhập-mặc-định)
8. [Khắc phục sự cố](#-khắc-phục-sự-cố)

---

## 🎯 GIỚI THIỆU DỰ ÁN

**MediSchedule** là hệ thống quản lý bệnh viện với các tính năng:

- 👨‍⚕️ **Quản lý bác sĩ và bệnh nhân**
- 📅 **Đặt lịch khám bệnh**
- 💬 **Chat giữa bác sĩ và bệnh nhân** (có thể gửi hình ảnh)
- 💳 **Quản lý thanh toán**
- 👥 **4 vai trò**: Admin, Department Head, Doctor, Patient

---

## 💻 YÊU CẦU HỆ THỐNG

### Windows
- Windows 10/11 (64-bit)
- RAM: Tối thiểu 4GB
- Dung lượng ổ cứng: 2GB trống

### Mac
- macOS 10.15 trở lên
- RAM: Tối thiểu 4GB
- Dung lượng ổ cứng: 2GB trống

### Linux
- Ubuntu 20.04 LTS hoặc mới hơn
- RAM: Tối thiểu 4GB
- Dung lượng ổ cứng: 2GB trống

---

## 📥 BƯỚC 1: CÀI ĐẶT PHẦN MỀM CẦN THIẾT

### 1.1. Cài đặt Python (Backend)

#### **Windows:**

1. **Tải Python:**
   - Truy cập: https://www.python.org/downloads/
   - Tải phiên bản **Python 3.10** hoặc **3.11**
   - Chọn file installer Windows (ví dụ: `python-3.11.x-amd64.exe`)

2. **Cài đặt Python:**
   - Chạy file vừa tải
   - ✅ **QUAN TRỌNG**: Tích vào ô **"Add Python to PATH"** ở màn hình đầu tiên
   - Click **"Install Now"**
   - Đợi cài đặt hoàn tất (3-5 phút)

3. **Kiểm tra cài đặt:**
   - Nhấn `Windows + R`
   - Gõ `cmd` và nhấn Enter
   - Trong cửa sổ Command Prompt, gõ:
     ```bash
     python --version
     ```
   - Nếu hiện ra `Python 3.11.x` là thành công ✅

#### **Mac:**

1. **Cài Homebrew (nếu chưa có):**
   - Mở Terminal (Cmd + Space, gõ "Terminal")
   - Dán lệnh sau và nhấn Enter:
     ```bash
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     ```

2. **Cài Python:**
   ```bash
   brew install python@3.11
   ```

3. **Kiểm tra:**
   ```bash
   python3 --version
   ```

#### **Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
python3 --version
```

---

### 1.2. Cài đặt Node.js (Frontend)

#### **Windows:**

1. **Tải Node.js:**
   - Truy cập: https://nodejs.org/
   - Tải phiên bản **LTS** (ví dụ: v20.x.x)
   - Chọn file installer Windows (`.msi`)

2. **Cài đặt:**
   - Chạy file vừa tải
   - Click **"Next"** liên tục
   - Đợi cài đặt hoàn tất

3. **Kiểm tra:**
   - Mở Command Prompt
   - Gõ:
     ```bash
     node --version
     npm --version
     ```
   - Nếu hiện ra số phiên bản là thành công ✅

#### **Mac:**

```bash
brew install node
node --version
npm --version
```

#### **Linux:**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

---

### 1.3. Cài đặt MySQL Database

#### **Windows:**

1. **Tải MySQL:**
   - Truy cập: https://dev.mysql.com/downloads/installer/
   - Chọn **"Windows (x86, 32-bit), MSI Installer"** (khoảng 400MB)

2. **Cài đặt MySQL:**
   - Chạy file installer
   - Chọn **"Developer Default"**
   - Trong bước **"Authentication Method"**, chọn **"Use Legacy Authentication Method"**
   - Đặt **mật khẩu root**: `190705` (quan trọng!)
   - Click Next cho đến khi hoàn tất

3. **Kiểm tra:**
   - Mở Command Prompt
   - Gõ:
     ```bash
     mysql --version
     ```

#### **Mac:**

```bash
# Cài MySQL
brew install mysql

# Khởi động MySQL
brew services start mysql

# Đặt mật khẩu root
mysql_secure_installation
# Nhập mật khẩu: 190705
```

#### **Linux:**

```bash
# Cài MySQL
sudo apt update
sudo apt install mysql-server

# Khởi động MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Đặt mật khẩu root
sudo mysql_secure_installation
# Nhập mật khẩu: 190705
```

---

## 📦 BƯỚC 2: CÀI ĐẶT DỰ ÁN

### 2.1. Tải mã nguồn dự án

#### **Nếu có Git:**

```bash
# Windows: Mở Command Prompt
# Mac/Linux: Mở Terminal

cd Desktop
git clone <link-repository>
cd medischedule
```

#### **Nếu không có Git:**

1. Tải file ZIP từ GitHub
2. Giải nén vào thư mục bạn muốn
3. Mở Command Prompt/Terminal tại thư mục đó

---

### 2.2. Cài đặt Backend

#### **Windows:**

```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo môi trường ảo Python
python -m venv venv

# Kích hoạt môi trường ảo
venv\Scripts\activate

# Cài đặt thư viện
pip install -r requirements.txt
```

#### **Mac/Linux:**

```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo môi trường ảo Python
python3 -m venv venv

# Kích hoạt môi trường ảo
source venv/bin/activate

# Cài đặt thư viện
pip install -r requirements.txt
```

**Lưu ý:** Nếu thấy lỗi, thử:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

### 2.3. Cài đặt Frontend

#### **Mở Terminal/Command Prompt MỚI:**

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt thư viện (có thể mất 5-10 phút)
npm install
```

Hoặc nếu có lỗi, dùng:

```bash
npm install --legacy-peer-deps
```

---

## 🗄️ BƯỚC 3: CẤU HÌNH DATABASE

### 3.1. Tạo Database

#### **Windows:**

Mở Command Prompt và chạy:

```bash
mysql -u root -p190705
```

Sau đó trong MySQL console, gõ:

```sql
CREATE DATABASE medischedule;
EXIT;
```

#### **Mac/Linux:**

```bash
mysql -u root -p
# Nhập mật khẩu: 190705
```

Trong MySQL console:

```sql
CREATE DATABASE medischedule;
EXIT;
```

---

### 3.2. Tạo bảng trong Database

Di chuyển vào thư mục backend:

```bash
cd backend

# Kích hoạt môi trường ảo nếu chưa
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

# Chạy script tạo admin
python create_admin_mysql.py

# Chạy script tạo dữ liệu mẫu
python create_sample_data_mysql.py
```

**Kết quả thành công sẽ thấy:**
```
✅ Successfully connected to MySQL database
✅ Admin user created successfully
✅ Sample data created successfully
```

---

### 3.3. Cấu hình file .env

#### **Backend (.env)**

Mở file `/backend/.env` và kiểm tra:

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

# OpenAI API (tùy chọn - để trống nếu không dùng AI)
EMERGENT_LLM_KEY=
```

**Lưu ý quan trọng:**
- Nếu mật khẩu MySQL của bạn KHÔNG PHẢI là `190705`, hãy thay đổi trong `DATABASE_URL`
- Ví dụ mật khẩu là `mypassword`: `DATABASE_URL=mysql+aiomysql://root:mypassword@localhost:3306/medischedule`

#### **Frontend (.env)**

Mở file `/frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
PORT=3000
```

---

## 🚀 BƯỚC 4: CHẠY ỨNG DỤNG

### 4.1. Chạy Backend

**Mở Terminal/Command Prompt THỨ NHẤT:**

#### **Windows:**

```bash
cd backend
venv\Scripts\activate
python server.py
```

#### **Mac/Linux:**

```bash
cd backend
source venv/bin/activate
python3 server.py
```

**Kết quả thành công:**
```
INFO:     Started server process [xxxx]
INFO:     Uvicorn running on http://0.0.0.0:8001
✅ Successfully connected to MySQL database
```

**⚠️ QUAN TRỌNG: GIỮ CỬA SỔ NÀY MỞ!**

---

### 4.2. Chạy Frontend

**Mở Terminal/Command Prompt THỨ HAI (cửa sổ mới):**

```bash
cd frontend
npm start
```

**Kết quả thành công:**
```
Compiled successfully!
You can now view medischedule in the browser.
  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**Trình duyệt sẽ tự động mở http://localhost:3000**

---

## 👤 TÀI KHOẢN ĐĂNG NHẬP MẶC ĐỊNH

Sau khi chạy script `create_sample_data_mysql.py`, bạn có các tài khoản sau:

### 🔴 ADMIN (Quản trị viên)
- **Email**: `admin@medischedule.com`
- **Mật khẩu**: `12345678`
- **Quyền**: Quản lý toàn bộ hệ thống

### 🟠 DEPARTMENT HEAD (Trưởng khoa)
- **Email**: `departmenthead@test.com`
- **Mật khẩu**: `12345678`
- **Quyền**: Quản lý bác sĩ và bệnh nhân

### 🟢 DOCTOR (Bác sĩ)
- **Email**: `doctor1@test.com`
- **Mật khẩu**: `12345678`
- **Quyền**: Xem lịch khám, chat với bệnh nhân

### 🔵 PATIENT (Bệnh nhân)
- **Email**: `patient1@test.com`
- **Mật khẩu**: `12345678`
- **Quyền**: Đặt lịch khám, chat với bác sĩ

**Có thêm:**
- `doctor2@test.com` / `12345678`
- `doctor3@test.com` / `12345678`
- `patient2@test.com` / `12345678`
- `patient3@test.com` / `12345678`

---

## 🔧 KHẮC PHỤC SỰ CỐ

### ❌ Lỗi: "Python không được nhận dạng"

**Nguyên nhân:** Python chưa được thêm vào PATH

**Giải pháp:**
1. Gỡ cài đặt Python
2. Cài lại và nhớ **tích vào "Add Python to PATH"**

---

### ❌ Lỗi: "mysql: command not found"

**Windows:**
1. Vào `Control Panel` → `System` → `Advanced system settings`
2. Click `Environment Variables`
3. Thêm `C:\Program Files\MySQL\MySQL Server 8.0\bin` vào PATH

**Mac:**
```bash
echo 'export PATH="/usr/local/mysql/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Linux:**
```bash
sudo apt install mysql-client
```

---

### ❌ Lỗi: "Access denied for user 'root'@'localhost'"

**Nguyên nhân:** Mật khẩu MySQL không đúng

**Giải pháp:**

#### **Windows:**
```bash
mysql -u root -p
# Nhập mật khẩu hiện tại của bạn
```

Sau đó đổi mật khẩu:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY '190705';
FLUSH PRIVILEGES;
EXIT;
```

#### **Mac/Linux:**
```bash
sudo mysql -u root
```

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '190705';
FLUSH PRIVILEGES;
EXIT;
```

---

### ❌ Lỗi: "Port 3000 is already in use"

**Nguyên nhân:** Cổng 3000 đang được sử dụng bởi ứng dụng khác

**Giải pháp:**

#### **Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID_number> /F
```

#### **Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

Hoặc thay đổi port trong `/frontend/.env`:
```env
PORT=3001
```

---

### ❌ Lỗi: "Cannot connect to MySQL server"

**Kiểm tra MySQL đã chạy chưa:**

#### **Windows:**
```bash
# Mở Services (nhấn Windows + R, gõ "services.msc")
# Tìm "MySQL80" và click Start
```

#### **Mac:**
```bash
brew services start mysql
```

#### **Linux:**
```bash
sudo systemctl start mysql
sudo systemctl status mysql
```

---

### ❌ Lỗi: "Module not found" khi chạy backend

**Giải pháp:**

```bash
# Đảm bảo môi trường ảo đang được kích hoạt
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

# Cài lại thư viện
pip install --upgrade pip
pip install -r requirements.txt
```

---

### ❌ Lỗi: "npm ERR! code EINTEGRITY"

**Giải pháp:**

```bash
# Xóa cache npm
npm cache clean --force

# Xóa thư mục node_modules
rm -rf node_modules package-lock.json

# Cài lại
npm install
```

---

### ❌ Trang web không hiển thị hoặc bị lỗi API

**Kiểm tra:**

1. ✅ Backend đang chạy trên http://localhost:8001
   - Truy cập: http://localhost:8001/api/health
   - Nếu thấy `{"status":"healthy","database":"mysql"}` là OK

2. ✅ Frontend đang chạy trên http://localhost:3000

3. ✅ File `/frontend/.env` có đúng:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

4. ✅ MySQL đang chạy và database `medischedule` đã được tạo

---

## 📞 HỖ TRỢ THÊM

Nếu gặp lỗi khác, hãy:

1. **Chụp màn hình lỗi**
2. **Ghi lại các bước bạn đã làm**
3. **Kiểm tra file log:**
   - Backend log: Trong terminal đang chạy backend
   - Frontend log: Trong terminal đang chạy frontend

---

## 📚 TÀI LIỆU THAM KHẢO

- **Python**: https://docs.python.org/3/
- **Node.js**: https://nodejs.org/docs/
- **MySQL**: https://dev.mysql.com/doc/
- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/

---

## ✅ CHECKLIST HOÀN THÀNH

Đánh dấu các bước đã hoàn thành:

- [ ] Cài đặt Python
- [ ] Cài đặt Node.js
- [ ] Cài đặt MySQL
- [ ] Tải mã nguồn dự án
- [ ] Cài đặt thư viện backend
- [ ] Cài đặt thư viện frontend
- [ ] Tạo database MySQL
- [ ] Chạy script tạo admin
- [ ] Chạy script tạo dữ liệu mẫu
- [ ] Cấu hình file .env
- [ ] Chạy backend thành công
- [ ] Chạy frontend thành công
- [ ] Đăng nhập thành công

---

**🎉 CHÚC MỪNG! Bạn đã chạy thành công dự án MediSchedule!**

Nếu có bất kỳ câu hỏi nào, đừng ngại liên hệ với đội ngũ phát triển.
