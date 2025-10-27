# 🚀 HƯỚNG DẪN CHẠY ỨNG DỤNG MEDISCHEDULE TRÊN MÁY LOCAL

> **Hướng dẫn chi tiết từng bước cho người mới bắt đầu**

---

## 📋 MỤC LỤC

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt công cụ cần thiết](#cài-đặt-công-cụ-cần-thiết)
3. [Download code về máy](#download-code-về-máy)
4. [Cài đặt dependencies](#cài-đặt-dependencies)
5. [Cấu hình môi trường](#cấu-hình-môi-trường)
6. [Khởi tạo database](#khởi-tạo-database)
7. [Chạy ứng dụng](#chạy-ứng-dụng)
8. [Truy cập ứng dụng](#truy-cập-ứng-dụng)
9. [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)

---

## 📌 YÊU CẦU HỆ THỐNG

- **Hệ điều hành**: Windows 10/11, macOS, hoặc Linux
- **RAM**: Tối thiểu 4GB (khuyến nghị 8GB)
- **Ổ cứng**: Ít nhất 2GB trống
- **Internet**: Để tải các package

---

## 🛠️ CÀI ĐẶT CÔNG CỤ CẦN THIẾT

### 1. Cài đặt Node.js và npm

**Node.js** là môi trường chạy JavaScript (cần cho Frontend).

#### Trên Windows:
1. Truy cập: https://nodejs.org/
2. Tải phiên bản **LTS** (Long Term Support) - ví dụ: v20.x.x
3. Chạy file `.exe` vừa tải về
4. Làm theo hướng dẫn cài đặt (Next → Next → Install)
5. Kiểm tra cài đặt thành công:
   ```bash
   node --version
   npm --version
   ```
   Kết quả hiển thị: `v20.x.x` và `10.x.x`

#### Trên macOS:
```bash
# Dùng Homebrew (nếu chưa có Homebrew, cài tại https://brew.sh)
brew install node

# Kiểm tra
node --version
npm --version
```

#### Trên Linux (Ubuntu/Debian):
```bash
# Cài đặt Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra
node --version
npm --version
```

---

### 2. Cài đặt Yarn (Package manager cho Frontend)

**Yarn** là công cụ quản lý thư viện cho React.

```bash
# Cài đặt Yarn toàn cục
npm install -g yarn

# Kiểm tra
yarn --version
```

Kết quả: `1.22.x`

---

### 3. Cài đặt Python 3

**Python** cần cho Backend (FastAPI).

#### Trên Windows:
1. Truy cập: https://www.python.org/downloads/
2. Tải Python 3.11 hoặc 3.12
3. **QUAN TRỌNG**: Tick vào ô "Add Python to PATH" trước khi cài
4. Chạy file cài đặt
5. Kiểm tra:
   ```bash
   python --version
   pip --version
   ```

#### Trên macOS:
```bash
brew install python@3.11

# Kiểm tra
python3 --version
pip3 --version
```

#### Trên Linux:
```bash
sudo apt update
sudo apt install python3.11 python3-pip

# Kiểm tra
python3 --version
pip3 --version
```

---

### 4. Cài đặt MongoDB

**MongoDB** là database của ứng dụng.

#### Trên Windows:

**Cách 1: MongoDB Community Server (Khuyến nghị)**
1. Truy cập: https://www.mongodb.com/try/download/community
2. Chọn:
   - Version: Latest (ví dụ: 7.0.x)
   - Platform: Windows
   - Package: MSI
3. Tải về và chạy file `.msi`
4. Chọn "Complete" installation
5. Tick "Install MongoDB as a Service"
6. Hoàn tất cài đặt

**Khởi động MongoDB:**
```bash
# MongoDB sẽ tự động chạy như service
# Kiểm tra
mongosh
# Nếu kết nối thành công, gõ: exit
```

**Cách 2: Docker (Cho người đã biết Docker)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Trên macOS:
```bash
# Dùng Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Khởi động MongoDB
brew services start mongodb-community

# Kiểm tra
mongosh
```

#### Trên Linux (Ubuntu/Debian):
```bash
# Import public key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Thêm MongoDB repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Cài đặt
sudo apt-get update
sudo apt-get install -y mongodb-org

# Khởi động
sudo systemctl start mongod
sudo systemctl enable mongod

# Kiểm tra
mongosh
```

---

### 5. Cài đặt Visual Studio Code

**VS Code** là code editor.

1. Truy cập: https://code.visualstudio.com/
2. Tải phiên bản cho hệ điều hành của bạn
3. Cài đặt bình thường
4. Mở VS Code

**Cài đặt Extensions hữu ích:**
- Mở VS Code
- Nhấn `Ctrl+Shift+X` (hoặc `Cmd+Shift+X` trên Mac)
- Tìm và cài các extension:
  - `Python` (Microsoft)
  - `ES7+ React/Redux/React-Native snippets`
  - `Prettier - Code formatter`
  - `ESLint`

---

## 📥 DOWNLOAD CODE VỀ MÁY

### Cách 1: Dùng Git (Khuyến nghị)

**Cài đặt Git trước:**
- Windows: https://git-scm.com/download/win
- macOS: `brew install git`
- Linux: `sudo apt install git`

**Clone repository:**
```bash
# Tạo thư mục projects (hoặc tên bất kỳ)
mkdir ~/projects
cd ~/projects

# Clone code (thay YOUR_REPO_URL bằng link git của bạn)
git clone YOUR_REPO_URL medischedule

# Di chuyển vào thư mục
cd medischedule
```

### Cách 2: Download ZIP

1. Tải file ZIP của code
2. Giải nén vào thư mục `C:\projects\medischedule` (Windows) hoặc `~/projects/medischedule` (Mac/Linux)
3. Mở terminal/command prompt tại thư mục đó

### Mở project trong VS Code:

```bash
# Trong terminal, tại thư mục medischedule
code .
```

Hoặc:
- Mở VS Code
- File → Open Folder
- Chọn thư mục `medischedule`

---

## 📦 CÀI ĐẶT DEPENDENCIES

### 1. Cài đặt Backend Dependencies

Trong VS Code:
1. Mở **Terminal** trong VS Code: `Ctrl+`` (phím backtick)
2. Chạy các lệnh:

```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo virtual environment (môi trường Python riêng)
python -m venv venv

# Kích hoạt virtual environment
# Trên Windows:
venv\Scripts\activate

# Trên macOS/Linux:
source venv/bin/activate

# Bạn sẽ thấy (venv) xuất hiện trước dòng lệnh

# Cài đặt các thư viện Python (dành cho LOCAL - không có emergentintegrations)
pip install -r requirements-local.txt

# Chờ khoảng 2-5 phút để cài đặt xong
```

**Lưu ý:** Nếu gặp lỗi `pip install`, thử:
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

### 2. Cài đặt Frontend Dependencies

Mở **Terminal mới** trong VS Code (Terminal → New Terminal):

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies bằng Yarn
yarn install

# Hoặc nếu muốn dùng npm:
npm install

# Chờ khoảng 3-7 phút
```

---

## ⚙️ CẤU HÌNH MÔI TRƯỜNG

### 1. Cấu hình Backend

Tạo file `.env` trong thư mục `backend`:

```bash
cd backend
```

**Trong VS Code:**
1. Click chuột phải vào thư mục `backend` → New File
2. Đặt tên: `.env`
3. Copy nội dung sau vào file `.env`:

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017

# JWT Secret (Thay đổi thành chuỗi ngẫu nhiên của bạn)
JWT_SECRET_KEY=your-super-secret-key-change-this-in-production-12345

# OpenAI API (Tùy chọn - nếu muốn dùng AI features)
# OPENAI_API_KEY=sk-your-openai-api-key-here

# Environment
ENVIRONMENT=development
```

**Lưu file** (Ctrl+S hoặc Cmd+S)

---

### 2. Cấu hình Frontend

Tạo file `.env` trong thư mục `frontend`:

```bash
cd ../frontend
```

**Trong VS Code:**
1. Click chuột phải vào thư mục `frontend` → New File
2. Đặt tên: `.env`
3. Copy nội dung sau vào file `.env`:

```env
# Backend URL
REACT_APP_BACKEND_URL=http://localhost:8001

# Development settings
WDS_SOCKET_PORT=0
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false
```

**Lưu file**

---

## 🗄️ KHỞI TẠO DATABASE

### 1. Khởi động MongoDB

**Kiểm tra MongoDB đang chạy:**
```bash
# Mở terminal mới
mongosh

# Nếu kết nối thành công, gõ:
show dbs
exit
```

**Nếu MongoDB chưa chạy:**

- **Windows (Service)**: 
  ```bash
  net start MongoDB
  ```

- **Windows (Manual)**:
  ```bash
  "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
  ```

- **macOS**:
  ```bash
  brew services start mongodb-community
  ```

- **Linux**:
  ```bash
  sudo systemctl start mongod
  ```

---

### 2. Tạo dữ liệu mẫu

Trong terminal tại thư mục `backend` (với virtual environment đã activate):

```bash
# Đảm bảo đang ở thư mục backend
cd backend

# Kích hoạt virtual environment nếu chưa
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Tạo tài khoản Admin
python create_admin.py

# Tạo dữ liệu mẫu (chuyên khoa, bác sĩ, bệnh nhân, trưởng khoa)
python create_sample_data.py
```

**Kết quả thành công:**
```
✓ Created specialty: Nội khoa
✓ Created specialty: Ngoại khoa
...
✓ Created patient: Nguyễn Văn A (patient1@test.com)
...
✓ Created doctor: BS. Phạm Minh D (doctor1@test.com)
...
Sample data created successfully!
```

---

## 🚀 CHẠY ỨNG DỤNG

Bạn cần **2 terminal** để chạy đồng thời Backend và Frontend.

### Terminal 1: Chạy Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Chạy backend server
python server.py

# Hoặc dùng uvicorn (nếu python server.py không hoạt động):
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Kết quả thành công:**
```
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Giữ terminal này mở và chạy!**

---

### Terminal 2: Chạy Frontend

Mở **terminal mới** trong VS Code (Terminal → New Terminal):

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Chạy frontend
yarn start

# Hoặc nếu dùng npm:
npm start
```

**Kết quả thành công:**
```
Compiled successfully!

You can now view medischedule in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

Browser sẽ **tự động mở** trang `http://localhost:3000`

**Giữ terminal này mở và chạy!**

---

## 🌐 TRUY CẬP ỨNG DỤNG

### URL:
```
http://localhost:3000
```

### Tài khoản đăng nhập test:

#### 👤 Patient (Bệnh nhân):
```
Email: patient1@test.com
Password: 12345678
```

#### 👨‍⚕️ Doctor (Bác sĩ):
```
Email: doctor1@test.com
Password: 12345678
```

#### 👔 Department Head (Trưởng khoa):
```
Email: departmenthead@test.com
Password: 12345678
```

#### 🔐 Admin (Quản trị viên):
```
Email: admin@medischedule.com
Password: 12345678
```

---

## 🎯 LUỒNG TEST CƠ BẢN

### Test 1: Đăng nhập Patient và đặt lịch

1. Mở `http://localhost:3000`
2. Đăng nhập với `patient1@test.com` / `12345678`
3. Click "Tìm bác sĩ"
4. Chọn một bác sĩ và đặt lịch khám

### Test 2: Đăng nhập Doctor và xem lịch hẹn

1. Đăng xuất (Logout)
2. Đăng nhập với `doctor1@test.com` / `12345678`
3. Xem danh sách lịch hẹn
4. Xác nhận/Hủy lịch hẹn

### Test 3: Đăng nhập Admin quản lý

1. Đăng xuất
2. Đăng nhập với `admin@medischedule.com` / `12345678`
3. Xem dashboard với thống kê
4. Quản lý bác sĩ, bệnh nhân

### Test 4: Test thanh toán (QR Code & Bank Transfer)

1. Đăng nhập với `patient1@test.com`
2. Đặt lịch khám với bác sĩ
3. Vào "Thanh toán"
4. Chọn "Ví điện tử" → Xem QR code
5. Chọn "Ngân hàng" → Xem thông tin chuyển khoản

---

## ⚠️ XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi: `command not found: node`

**Nguyên nhân:** Chưa cài Node.js hoặc chưa thêm vào PATH

**Giải pháp:**
1. Cài lại Node.js và tick "Add to PATH"
2. Khởi động lại terminal/VS Code
3. Kiểm tra: `node --version`

---

### ❌ Lỗi: `python: command not found`

**Nguyên nhân:** Chưa cài Python hoặc dùng sai lệnh

**Giải pháp:**
- Trên Windows: Thử `py` thay vì `python`
- Trên Mac/Linux: Thử `python3` thay vì `python`
- Cài lại Python và tick "Add to PATH"

---

### ❌ Lỗi: `Cannot connect to MongoDB`

**Nguyên nhân:** MongoDB chưa chạy

**Giải pháp:**

**Windows:**
```bash
net start MongoDB
# Hoặc
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Kiểm tra:**
```bash
mongosh
show dbs
exit
```

---

### ❌ Lỗi: `Port 3000 already in use`

**Nguyên nhân:** Có ứng dụng khác đang dùng port 3000

**Giải pháp:**

**Cách 1: Đóng ứng dụng đang dùng port 3000**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**Cách 2: Chạy Frontend trên port khác**
```bash
# Trong thư mục frontend
PORT=3001 yarn start
```

---

### ❌ Lỗi: `Port 8001 already in use`

**Giải pháp:**
```bash
# Windows
netstat -ano | findstr :8001
taskkill /PID <PID_NUMBER> /F

# macOS/Linux
lsof -ti:8001 | xargs kill -9
```

---

### ❌ Lỗi: `401 Unauthorized` khi đăng nhập

**Nguyên nhân:** Database trống hoặc sai password

**Giải pháp:**
```bash
cd backend
python create_admin.py
python create_sample_data.py
```

Thử lại với password: `12345678`

---

### ❌ Lỗi: `Module not found` hoặc `ImportError`

**Nguyên nhân:** Thiếu dependencies

**Giải pháp:**

**Backend:**
```bash
cd backend
source venv/bin/activate  # hoặc venv\Scripts\activate trên Windows
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
yarn install
# hoặc
npm install
```

---

### ❌ Lỗi: `yarn: command not found`

**Giải pháp:**
```bash
npm install -g yarn
```

---

### ❌ Frontend chạy nhưng hiển thị trang trắng

**Giải pháp:**

1. **Kiểm tra backend đang chạy:**
   ```bash
   curl http://localhost:8001/health
   ```

2. **Kiểm tra file `.env` trong frontend:**
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

3. **Clear cache và rebuild:**
   ```bash
   cd frontend
   rm -rf node_modules
   yarn install
   yarn start
   ```

4. **Xóa browser cache:** Ctrl+Shift+Delete

---

### ❌ API calls bị lỗi CORS

**Nguyên nhân:** Backend chưa cho phép frontend truy cập

**Giải pháp:** Kiểm tra file `backend/server.py` có dòng:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hoặc ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔄 TẮT ỨNG DỤNG

### Dừng Backend:
- Trong terminal đang chạy backend
- Nhấn `Ctrl+C`

### Dừng Frontend:
- Trong terminal đang chạy frontend
- Nhấn `Ctrl+C`
- Gõ `y` và Enter nếu được hỏi

### Dừng MongoDB:

**Windows:**
```bash
net stop MongoDB
```

**macOS:**
```bash
brew services stop mongodb-community
```

**Linux:**
```bash
sudo systemctl stop mongod
```

---

## 📚 CẤU TRÚC THỦ MỤC

```
medischedule/
├── backend/                    # Backend FastAPI
│   ├── venv/                  # Python virtual environment
│   ├── server.py              # Main server file
│   ├── requirements.txt       # Python dependencies
│   ├── create_admin.py        # Script tạo admin
│   ├── create_sample_data.py  # Script tạo dữ liệu mẫu
│   └── .env                   # Backend config (tự tạo)
│
├── frontend/                   # Frontend React
│   ├── node_modules/          # Node dependencies (tự sinh)
│   ├── public/                # Static files
│   ├── src/                   # Source code
│   │   ├── components/        # React components
│   │   ├── pages/            # Pages
│   │   └── App.js            # Main app
│   ├── package.json          # Dependencies list
│   ├── yarn.lock            # Yarn lock file
│   └── .env                 # Frontend config (tự tạo)
│
├── CREDENTIALS.md            # Danh sách tài khoản test
├── HUONG_DAN_CHAY_LOCAL.md  # File này
└── README.md                # Tổng quan project
```

---

## 🎓 HỌC THÊM

### Tài liệu chính thức:

- **React**: https://react.dev/
- **FastAPI**: https://fastapi.tiangolo.com/
- **MongoDB**: https://www.mongodb.com/docs/
- **Node.js**: https://nodejs.org/docs/
- **Python**: https://docs.python.org/3/

### YouTube tutorials:

- React cho người mới: Search "React tutorial for beginners"
- Python FastAPI: Search "FastAPI crash course"
- MongoDB basics: Search "MongoDB tutorial"

---

## 💡 TIPS CHO NGƯỜI MỚI

### 1. Học các lệnh Terminal cơ bản:

```bash
cd folder_name       # Di chuyển vào thư mục
cd ..               # Quay lại thư mục cha
ls                  # Liệt kê files (macOS/Linux)
dir                 # Liệt kê files (Windows)
pwd                 # Xem đường dẫn hiện tại
mkdir folder_name   # Tạo thư mục mới
```

### 2. Shortcuts hữu ích trong VS Code:

- `Ctrl+~` : Mở/đóng Terminal
- `Ctrl+P` : Tìm file nhanh
- `Ctrl+Shift+P` : Command Palette
- `Ctrl+B` : Ẩn/hiện Sidebar
- `Ctrl+/` : Comment code
- `Ctrl+S` : Lưu file
- `Ctrl+F` : Tìm trong file

### 3. Git commands cơ bản:

```bash
git status          # Xem trạng thái
git add .          # Thêm tất cả thay đổi
git commit -m "message"  # Commit với message
git pull           # Kéo code mới nhất
git push           # Đẩy code lên server
```

### 4. Debug tips:

- **Luôn đọc error messages** - chúng cho biết vấn đề ở đâu
- **Google error message** - hầu hết đã có người gặp và giải quyết
- **Kiểm tra logs** trong terminal
- **Dùng `console.log()` trong React** để debug
- **Dùng `print()` trong Python** để debug

---

## 📞 HỖ TRỢ

### Nếu gặp vấn đề:

1. **Đọc lại hướng dẫn** - có thể bỏ qua bước nào đó
2. **Kiểm tra phần "Xử lý lỗi thường gặp"** ở trên
3. **Google error message** - thêm "stackoverflow" vào search
4. **Tạo issue** trên GitHub repository (nếu có)
5. **Hỏi trên Discord/Slack** của team

---

## ✅ CHECKLIST TRƯỚC KHI BẮT ĐẦU

- [ ] Đã cài Node.js (v20.x)
- [ ] Đã cài Python (3.11+)
- [ ] Đã cài MongoDB
- [ ] Đã cài VS Code
- [ ] Đã cài Yarn
- [ ] MongoDB đang chạy
- [ ] Đã tạo file `.env` cho backend
- [ ] Đã tạo file `.env` cho frontend
- [ ] Đã cài backend dependencies
- [ ] Đã cài frontend dependencies
- [ ] Đã tạo dữ liệu mẫu
- [ ] Backend đang chạy trên port 8001
- [ ] Frontend đang chạy trên port 3000
- [ ] Có thể đăng nhập thành công

---

## 🎉 CHÚC MỪNG!

Nếu bạn đã làm theo tất cả các bước trên, bạn đã thành công chạy được ứng dụng MediSchedule trên máy local của mình!

**URL truy cập:** http://localhost:3000

**Giờ thì bạn có thể:**
- ✅ Xem và chỉnh sửa code
- ✅ Test các tính năng
- ✅ Học React và FastAPI
- ✅ Phát triển thêm features mới
- ✅ Debug và fix bugs

---

## 📝 GHI CHÚ QUAN TRỌNG

### 1. Virtual Environment (venv)

**Luôn kích hoạt venv trước khi chạy Python:**
```bash
# Windows
backend\venv\Scripts\activate

# macOS/Linux
source backend/venv/bin/activate
```

Bạn sẽ thấy `(venv)` xuất hiện trước dòng lệnh.

### 2. Environment Variables

**Không commit file `.env` lên Git!** Chứa thông tin nhạy cảm.

### 3. Database

**Database local và production tách biệt** - dữ liệu trên local không ảnh hưởng production.

### 4. Hot Reload

- **Frontend**: Tự động reload khi sửa code
- **Backend**: Reload khi dùng `--reload` flag với uvicorn

### 5. Port

- **Frontend**: 3000
- **Backend**: 8001
- **MongoDB**: 27017

Không được chiếm dụng các port này bởi ứng dụng khác.

---

<div align="center">

**🏥 MediSchedule - Hệ thống quản lý lịch khám bệnh**

Made with ❤️ by Development Team

</div>
