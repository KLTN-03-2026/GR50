# 🎯 TẤT CẢ CÁCH CHẠY MEDISCHEDULE

## 📑 Mục lục

Có **3 cách chính** để chạy MediSchedule:

1. [🎨 VS Code (Khuyến nghị nhất!)](#1--vs-code-khuyến-nghị-nhất)
2. [⚡ Windows Scripts (.bat files)](#2--windows-scripts-bat-files)
3. [💻 Command Line Manual](#3--command-line-manual)

---

## 1. 🎨 VS Code (Khuyến nghị nhất!)

### Tại sao chọn VS Code?

✅ Tất cả trong 1: Code + Run + Debug + Database
✅ IntelliSense (gợi ý code thông minh)
✅ Breakpoints để debug
✅ Hot reload tự động
✅ Git integration
✅ Extensions mạnh mẽ

### Quick Start:

```bash
# Mở project
code .

# Install extensions khi được hỏi
# Chọn Python interpreter
# Nhấn Ctrl+Shift+B để chạy
```

### Xem hướng dẫn chi tiết:

- **📖 Chi tiết**: [VSCODE_GUIDE.md](VSCODE_GUIDE.md) - 30 trang đầy đủ
- **⚡ Nhanh**: [VSCODE_QUICK.md](VSCODE_QUICK.md) - 1 phút

### Chạy trong VS Code:

**Cách 1: Dùng Tasks (Nhanh nhất)**
```
Ctrl+Shift+P → Tasks: Run Task → Start Both (Backend + Frontend)
Hoặc: Ctrl+Shift+B
```

**Cách 2: Debug Mode (Để debug code)**
```
Ctrl+Shift+D → Chọn "Full Stack" → F5
```

**Cách 3: Terminal trong VS Code**
```bash
# Terminal 1
cd backend
python server.py

# Terminal 2 (Ctrl+Shift+`backtick` để tạo mới)
cd frontend
yarn start
```

### Tính năng VS Code:

- ✅ IntelliSense cho Python & JavaScript
- ✅ Debug với breakpoints
- ✅ SQLTools để xem database
- ✅ Git integration
- ✅ Multiple terminals
- ✅ Split view (Backend | Frontend cùng lúc)
- ✅ Tasks tự động

---

## 2. ⚡ Windows Scripts (.bat files)

### Tại sao dùng Scripts?

✅ Double-click là chạy
✅ Tự động kiểm tra lỗi
✅ Không cần nhớ lệnh
✅ Thích hợp cho người mới

### Các Scripts có sẵn:

#### `SETUP_DATABASE_WINDOWS.bat`
**Chức năng:** Setup database một lần duy nhất
**Khi nào dùng:** Lần đầu tiên hoặc reset database

```
Double-click file này
→ Nhập password MySQL (190705)
→ Tự động:
  - Tạo database
  - Tạo tables
  - Tạo admin account
  - Tạo sample data
```

#### `START_BACKEND_WINDOWS.bat`
**Chức năng:** Chạy Backend (FastAPI)
**Khi nào dùng:** Mỗi khi muốn chạy server

```
Double-click file này
→ Tự động:
  - Kiểm tra Python
  - Kiểm tra MySQL connection
  - Start backend tại http://localhost:8001
```

#### `START_FRONTEND_WINDOWS.bat`
**Chức năng:** Chạy Frontend (React)
**Khi nào dùng:** Mỗi khi muốn chạy UI

```
Double-click file này (TRONG TERMINAL KHÁC)
→ Tự động:
  - Kiểm tra Node.js & Yarn
  - Start frontend tại http://localhost:3000
```

### Workflow với Scripts:

```
Lần đầu:
1. Double-click: SETUP_DATABASE_WINDOWS.bat
2. Đợi setup xong

Mỗi lần chạy:
1. Double-click: START_BACKEND_WINDOWS.bat
2. Double-click: START_FRONTEND_WINDOWS.bat (trong cửa sổ khác)
3. Truy cập: http://localhost:3000
```

### Ưu điểm:

- ✅ Siêu đơn giản
- ✅ Tự động check lỗi
- ✅ Hiển thị hướng dẫn nếu có lỗi

### Nhược điểm:

- ❌ Không có debug
- ❌ Không có IntelliSense
- ❌ Phải mở 2 cửa sổ riêng

---

## 3. 💻 Command Line Manual

### Tại sao dùng Manual?

✅ Hiểu rõ từng bước
✅ Linh hoạt tùy chỉnh
✅ Chạy được trên mọi terminal

### Setup Database (Lần đầu):

```bash
# Vào thư mục backend
cd backend

# Tạo database và tables
mysql -u root -p190705 < create_database.sql

# Tạo admin account
python create_admin_mysql.py

# Tạo sample data (optional)
python create_sample_data_mysql.py

# Test connection
python test_mysql_connection.py
```

### Chạy Backend:

**Cách 1: Trực tiếp**
```bash
cd backend
python server.py
```

**Cách 2: Dùng uvicorn**
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Với virtual environment:**
```bash
cd backend

# Tạo venv (lần đầu)
python -m venv venv

# Activate venv
# Windows CMD:
venv\Scripts\activate.bat
# Windows PowerShell:
venv\Scripts\Activate.ps1
# Git Bash:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python server.py
```

### Chạy Frontend:

**Terminal riêng biệt:**
```bash
cd frontend

# Install dependencies (lần đầu)
yarn install

# Start development server
yarn start

# Hoặc dùng npm
npm start
```

**Build production:**
```bash
cd frontend
yarn build
# Folder build/ chứa static files
```

### Ưu điểm:

- ✅ Hiểu rõ process
- ✅ Linh hoạt
- ✅ Debug bằng logs

### Nhược điểm:

- ❌ Phải nhớ nhiều lệnh
- ❌ Dễ quên activate venv
- ❌ Phải mở 2 terminals

---

## 📊 SO SÁNH 3 CÁCH

| Tiêu chí | VS Code | Scripts | Manual |
|----------|---------|---------|--------|
| **Dễ dùng** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **IntelliSense** | ✅ | ❌ | ❌ |
| **Debug** | ✅ | ❌ | ❌ |
| **Database View** | ✅ | ❌ | ❌ |
| **Git Integration** | ✅ | ❌ | ❌ |
| **Hot Reload** | ✅ | ✅ | ✅ |
| **Setup Time** | 5 phút | 2 phút | 10 phút |
| **Thích hợp cho** | Developer | Người mới | Pro users |

---

## 🎯 KHUYẾN NGHỊ

### Dành cho Developer (Lập trình viên):

👉 **Dùng VS Code** - Đầy đủ tính năng nhất!

**Lý do:**
- Debug với breakpoints
- IntelliSense giúp code nhanh hơn
- Xem database ngay trong editor
- Git integration
- Split view để code Backend + Frontend cùng lúc

**Xem:** [VSCODE_GUIDE.md](VSCODE_GUIDE.md)

---

### Dành cho Người mới / Testing:

👉 **Dùng Windows Scripts** - Đơn giản nhất!

**Lý do:**
- Double-click là chạy
- Tự động check lỗi
- Không cần nhớ lệnh
- Setup nhanh

**Xem:** [QUICK_START.md](QUICK_START.md)

---

### Dành cho Pro Users / Linux:

👉 **Dùng Command Line** - Linh hoạt nhất!

**Lý do:**
- Hiểu rõ process
- Tùy chỉnh mọi thứ
- Script tự động (CI/CD)

**Xem:** [README_WINDOWS.md](README_WINDOWS.md)

---

## 🚀 QUICK START MATRIX

### Tôi muốn...

**...chạy nhanh nhất có thể:**
→ Scripts: Double-click `START_BACKEND_WINDOWS.bat` + `START_FRONTEND_WINDOWS.bat`

**...code và debug:**
→ VS Code: `Ctrl+Shift+B`

**...hiểu rõ từng bước:**
→ Manual: Đọc [README_WINDOWS.md](README_WINDOWS.md)

**...setup lần đầu:**
→ Scripts: `SETUP_DATABASE_WINDOWS.bat`

**...xem database:**
→ VS Code: SQLTools extension

**...build production:**
→ Manual: `cd frontend && yarn build`

---

## 📁 FILE HƯỚNG DẪN

```
📚 Tài liệu có sẵn:

Setup & Quick Start:
├── QUICK_START.md              ⚡ 5 phút
├── README_WINDOWS.md           📖 Chi tiết 15+ trang
├── CHECKLIST_INSTALL.md        ✅ Checklist từng bước
└── THIS_FILE.md                🎯 So sánh các cách chạy

VS Code:
├── VSCODE_GUIDE.md             📖 Chi tiết 30+ trang
└── VSCODE_QUICK.md             ⚡ 1 phút

Backend:
├── backend/HUONG_DAN_CHAY_MYSQL.md
├── backend/.env.example
└── backend/requirements.txt

Scripts:
├── SETUP_DATABASE_WINDOWS.bat
├── START_BACKEND_WINDOWS.bat
└── START_FRONTEND_WINDOWS.bat

Production:
└── DEPLOYMENT.md               🚀 Deploy lên server
```

---

## 🌐 URL QUAN TRỌNG

Sau khi chạy thành công:

| Service | URL | Mô tả |
|---------|-----|-------|
| **Frontend** | http://localhost:3000 | Giao diện người dùng |
| **Backend** | http://localhost:8001 | API server |
| **API Docs** | http://localhost:8001/api/docs | Swagger UI - Test APIs |
| **Health** | http://localhost:8001/health | Check server status |

---

## 🔐 TÀI KHOẢN TEST

| Vai trò | Email | Password |
|---------|-------|----------|
| Admin | admin@medischedule.com | 12345678 |
| Dept Head | departmenthead@test.com | 12345678 |
| Doctor | doctor1@test.com | 12345678 |
| Patient | patient1@test.com | 12345678 |

---

## ❓ CHỌN CÁCH NÀO?

### Flowchart:

```
Bạn là Developer? 
├─ YES → VS Code (VSCODE_GUIDE.md)
└─ NO → Bạn muốn đơn giản nhất?
    ├─ YES → Scripts (.bat files)
    └─ NO → Manual (README_WINDOWS.md)
```

### Recommendations:

**🥇 #1: VS Code** (90% trường hợp)
- Dành cho: Developer
- Ưu điểm: Tất cả trong 1
- Thời gian: 5 phút setup

**🥈 #2: Windows Scripts** (Người mới)
- Dành cho: Testing, Demo
- Ưu điểm: Siêu đơn giản
- Thời gian: 2 phút

**🥉 #3: Command Line** (Advanced)
- Dành cho: Pro users, Production
- Ưu điểm: Linh hoạt, script được
- Thời gian: 10 phút

---

## 🎉 KẾT LUẬN

**Bạn đã có:**

✅ 3 cách chạy khác nhau
✅ Scripts tự động (.bat)
✅ VS Code setup đầy đủ
✅ Hướng dẫn chi tiết
✅ Tất cả tools cần thiết

**KHÔNG THIẾU MỘT CÁI GÌ HẾT!** 🚀

---

## 📞 CẦN GIÚP?

1. **Setup lần đầu:** [CHECKLIST_INSTALL.md](CHECKLIST_INSTALL.md)
2. **VS Code:** [VSCODE_GUIDE.md](VSCODE_GUIDE.md)
3. **Windows:** [README_WINDOWS.md](README_WINDOWS.md)
4. **Quick:** [QUICK_START.md](QUICK_START.md)
5. **Deploy:** [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Chọn cách bạn thích và bắt đầu code! 💻✨**
