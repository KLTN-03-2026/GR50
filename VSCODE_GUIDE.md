# 🎯 HƯỚNG DẪN CHẠY MEDISCHEDULE TRONG VS CODE

## 📋 Tổng quan

Tài liệu này hướng dẫn chi tiết cách chạy toàn bộ dự án MediSchedule trong VS Code, **KHÔNG THIẾU MỘT CÁI GÌ HẾT**!

---

## 🚀 BƯỚC 1: CÀI ĐẶT VS CODE VÀ EXTENSIONS

### 1.1. Tải và cài VS Code

- Tải từ: https://code.visualstudio.com/
- Cài đặt với tùy chọn "Add to PATH"

### 1.2. Mở Project trong VS Code

```bash
# Cách 1: Từ command line
cd path/to/medischedule
code .

# Cách 2: Trong VS Code
File → Open Folder → Chọn thư mục medischedule
```

### 1.3. Cài đặt Extensions (TỰ ĐỘNG)

Khi mở project lần đầu, VS Code sẽ hiển thị thông báo:

```
"This workspace has extension recommendations"
→ Click [Install All]
```

**Extensions sẽ được cài:**

#### Python
- ✅ Python (Microsoft)
- ✅ Pylance (IntelliSense)
- ✅ Black Formatter (Code formatting)

#### JavaScript/React
- ✅ ESLint (Linting)
- ✅ Prettier (Code formatting)
- ✅ ES7+ React Snippets
- ✅ Tailwind CSS IntelliSense

#### Database
- ✅ SQLTools
- ✅ SQLTools MySQL Driver

#### Khác
- ✅ GitLens (Git tools)
- ✅ Path Intellisense
- ✅ Auto Rename Tag
- ✅ Material Icon Theme
- ✅ DotENV (Syntax highlighting cho .env)

### 1.4. Cài thủ công (nếu cần)

Nhấn `Ctrl+Shift+X` và search các extension trên.

---

## 🛠️ BƯỚC 2: SETUP MÔI TRƯỜNG

### 2.1. Tạo Python Virtual Environment

**Terminal trong VS Code** (`Ctrl+`backtick`):

```bash
cd backend
python -m venv venv
```

**Kích hoạt virtual environment:**

**Windows CMD:**
```bash
venv\Scripts\activate.bat
```

**Windows PowerShell:**
```bash
venv\Scripts\Activate.ps1
```

**Git Bash / Linux:**
```bash
source venv/bin/activate
```

### 2.2. Select Python Interpreter trong VS Code

1. Nhấn `Ctrl+Shift+P`
2. Gõ: `Python: Select Interpreter`
3. Chọn: `./backend/venv/Scripts/python.exe`

### 2.3. Cài Dependencies

**Option 1: Dùng VS Code Tasks (Khuyến nghị)**

1. Nhấn `Ctrl+Shift+P`
2. Gõ: `Tasks: Run Task`
3. Chọn: `Install All Dependencies`

**Option 2: Manual**

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
yarn install
```

---

## 🗄️ BƯỚC 3: SETUP DATABASE

### 3.1. Kiểm tra MySQL đang chạy

**Windows:**
- Nhấn `Win+R` → Gõ `services.msc` → Enter
- Tìm "MySQL" → Click "Start" (nếu chưa chạy)

**XAMPP:**
- Mở XAMPP Control Panel
- Start "MySQL"

### 3.2. Setup Database bằng VS Code Task

**Cách 1: Dùng Task (Nhanh nhất)**

1. Nhấn `Ctrl+Shift+P`
2. Gõ: `Tasks: Run Task`
3. Chọn: `Setup Database`
4. Đợi script chạy xong

**Cách 2: Manual**

```bash
cd backend

# Tạo database và tables
mysql -u root -p190705 < create_database.sql

# Tạo admin account
python create_admin_mysql.py

# Tạo sample data
python create_sample_data_mysql.py
```

### 3.3. Test kết nối Database

**Dùng VS Code Task:**

1. `Ctrl+Shift+P`
2. `Tasks: Run Task`
3. Chọn: `Test MySQL Connection`

Hoặc chạy manual:
```bash
cd backend
python test_mysql_connection.py
```

Kết quả phải là: `✅ MySQL connection successful!`

---

## 🎮 BƯỚC 4: CHẠY ỨNG DỤNG

### 🌟 CÁCH 1: DÙNG TASKS (KHUYẾN NGHỊ)

#### Chạy cả Backend + Frontend cùng lúc:

1. Nhấn `Ctrl+Shift+P`
2. Gõ: `Tasks: Run Task`
3. Chọn: **`Start Both (Backend + Frontend)`**

Hoặc shortcut:
- `Ctrl+Shift+B` (Build/Run task)

VS Code sẽ mở 2 terminal:
- **Terminal 1**: Backend (Python/FastAPI)
- **Terminal 2**: Frontend (React)

#### Chạy riêng lẻ:

**Backend only:**
- `Ctrl+Shift+P` → `Tasks: Run Task` → `Start Backend (Python)`

**Frontend only:**
- `Ctrl+Shift+P` → `Tasks: Run Task` → `Start Frontend (React)`

---

### 🐛 CÁCH 2: DÙNG DEBUG (ĐỂ DEBUG CODE)

#### Chạy Backend với Debug:

1. Vào tab **Run and Debug** (Ctrl+Shift+D)
2. Chọn: **`Python: FastAPI Backend`**
3. Nhấn **F5** hoặc click nút ▶️

**Lợi ích:**
- Đặt breakpoints bằng cách click vào số dòng
- Step through code (F10, F11)
- Inspect variables
- Debug API calls

#### Chạy cả Backend + Frontend với Debug:

1. Vào tab **Run and Debug** (Ctrl+Shift+D)
2. Chọn: **`Full Stack (Backend + Frontend)`**
3. Nhấn **F5**

---

### 🖱️ CÁCH 3: MANUAL (TERMINAL)

**Terminal 1 - Backend:**
```bash
cd backend
python server.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start
```

---

## 🌐 BƯỚC 5: TRUY CẬP ỨNG DỤNG

### Sau khi chạy thành công:

✅ **Frontend**: http://localhost:3000
- Trang chủ MediSchedule
- Giao diện người dùng

✅ **Backend API**: http://localhost:8001
- API server

✅ **API Documentation**: http://localhost:8001/api/docs
- Swagger UI - Test API endpoints
- Xem tất cả 42+ endpoints

✅ **Health Check**: http://localhost:8001/health
- Kiểm tra server đang chạy

---

## 🔐 ĐĂNG NHẬP

Sử dụng các tài khoản sau (đã tạo bằng sample data):

| Vai trò | Email | Password |
|---------|-------|----------|
| **Admin** | admin@medischedule.com | 12345678 |
| **Department Head** | departmenthead@test.com | 12345678 |
| **Doctor** | doctor1@test.com | 12345678 |
| **Patient** | patient1@test.com | 12345678 |

---

## 📊 BƯỚC 6: KẾT NỐI DATABASE TRONG VS CODE

### 6.1. Cài SQLTools Extensions

Đã được cài tự động nếu bạn install recommended extensions.

### 6.2. Tạo MySQL Connection

1. Click icon **SQLTools** ở sidebar (biểu tượng database)
2. Click **Add New Connection**
3. Chọn: **MySQL**
4. Điền thông tin:

```
Connection Name: MediSchedule Local
Server: localhost
Port: 3306
Database: medischedule
Username: root
Password: 190705
```

5. Click **Test Connection** → Phải thành công
6. Click **Save Connection**

### 6.3. Sử dụng Database

- Click vào connection "MediSchedule Local"
- Xem tables, run queries trực tiếp trong VS Code
- Không cần mở MySQL Workbench!

**Ví dụ queries:**

```sql
-- Xem tất cả users
SELECT * FROM users;

-- Xem tất cả doctors với specialty
SELECT d.*, s.name as specialty_name, u.full_name, u.email
FROM doctors d
JOIN specialties s ON d.specialty_id = s.id
JOIN users u ON d.user_id = u.id;

-- Xem appointments
SELECT * FROM appointments ORDER BY appointment_date DESC;
```

---

## 🎯 CÁC SHORTCUTS HỮU ÍCH

### General
- `Ctrl+P` - Quick Open (mở file nhanh)
- `Ctrl+Shift+P` - Command Palette
- `Ctrl+\` - Split Editor
- `Ctrl+B` - Toggle Sidebar
- `Ctrl+J` - Toggle Terminal

### Code
- `Ctrl+/` - Comment/Uncomment
- `Shift+Alt+F` - Format Document
- `F2` - Rename Symbol
- `Ctrl+.` - Quick Fix
- `Ctrl+Space` - Trigger IntelliSense

### Debug
- `F5` - Start Debugging
- `Shift+F5` - Stop Debugging
- `F9` - Toggle Breakpoint
- `F10` - Step Over
- `F11` - Step Into

### Terminal
- `Ctrl+`backtick` - Toggle Terminal
- `Ctrl+Shift+`backtick` - New Terminal
- `Ctrl+C` - Stop running process

### Tasks
- `Ctrl+Shift+B` - Run Build Task
- `Ctrl+Shift+P` → Tasks: Run Task

---

## 🔍 TÍNH NĂNG VS CODE HỮU ÍCH

### 1. IntelliSense (Auto-complete)

- Gõ code tự động gợi ý
- `Ctrl+Space` để trigger
- Import tự động

### 2. Go to Definition

- `F12` hoặc `Ctrl+Click` trên function/variable
- Nhảy tới định nghĩa

### 3. Find All References

- `Shift+F12` - Tìm tất cả nơi sử dụng
- Useful để refactor code

### 4. Search in Files

- `Ctrl+Shift+F` - Search toàn bộ project
- Support regex

### 5. Git Integration

- Sidebar Git icon (Source Control)
- Commit, Push, Pull ngay trong VS Code
- GitLens extension: xem Git history

### 6. Integrated Terminal

- Không cần mở CMD/PowerShell riêng
- Multiple terminals
- Split terminals

### 7. Extensions Marketplace

- `Ctrl+Shift+X` - Mở Extensions
- Tìm và cài extensions khác

---

## 📁 WORKSPACE LAYOUT KHUYẾN NGHỊ

### Split Editor Layout:

```
┌─────────────────────┬─────────────────────┐
│                     │                     │
│  backend/server.py  │  frontend/App.js    │
│                     │                     │
├─────────────────────┴─────────────────────┤
│                                           │
│  Terminal 1: Backend   Terminal 2: Front │
│                                           │
└───────────────────────────────────────────┘
```

**Cách tạo:**
1. Mở `backend/server.py`
2. Nhấn `Ctrl+\` để split
3. Mở `frontend/src/App.js` ở panel bên phải
4. Nhấn `Ctrl+J` để mở terminal
5. Click **+** trong terminal để tạo terminal thứ 2

---

## 🐛 TROUBLESHOOTING

### ❌ Lỗi: "Python interpreter not found"

**Giải pháp:**
1. Tạo virtual environment: `python -m venv backend/venv`
2. `Ctrl+Shift+P` → `Python: Select Interpreter`
3. Chọn `./backend/venv/Scripts/python.exe`

### ❌ Lỗi: "Module not found"

**Giải pháp:**
```bash
cd backend
pip install -r requirements.txt
```

### ❌ Frontend không start

**Giải pháp:**
```bash
cd frontend
# Remove node_modules
rm -rf node_modules
# Reinstall
yarn install
# Try start again
yarn start
```

### ❌ MySQL connection failed

**Giải pháp:**
1. Kiểm tra MySQL service đang chạy
2. Kiểm tra password trong `backend/.env`
3. Test: `python backend/test_mysql_connection.py`

### ❌ Port đã được sử dụng

**Backend (8001):**
```bash
# Windows
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# Hoặc đổi port trong server.py
```

**Frontend (3000):**
```bash
# React sẽ tự động hỏi dùng port khác
Would you like to run on another port instead? (Y/n)
→ Gõ Y
```

### ❌ Extension không hoạt động

**Giải pháp:**
1. Reload VS Code: `Ctrl+Shift+P` → `Reload Window`
2. Reinstall extension
3. Kiểm tra settings.json

---

## 📝 WORKFLOW DEVELOPMENT

### 1. Bắt đầu làm việc:

```bash
# Mở VS Code
code .

# Chạy cả Backend + Frontend
Ctrl+Shift+P → Tasks: Run Task → Start Both
```

### 2. Khi sửa Backend:

- Sửa file Python
- Server tự động reload (hot reload)
- Không cần restart

### 3. Khi sửa Frontend:

- Sửa file JS/JSX
- Browser tự động reload
- Không cần restart

### 4. Debug API:

1. Đặt breakpoint trong `backend/server.py`
2. `F5` để start debug mode
3. Call API từ frontend hoặc Swagger UI
4. Code dừng ở breakpoint
5. Inspect variables, step through

### 5. Test Database:

- Mở SQLTools connection
- Write và run queries
- Không cần MySQL Workbench

### 6. Commit code:

1. Click Source Control icon (Ctrl+Shift+G)
2. Review changes
3. Write commit message
4. Click ✓ Commit
5. Click ⬆️ Push (nếu có remote)

---

## 🎨 CUSTOMIZATION

### Themes

`Ctrl+K Ctrl+T` → Chọn theme bạn thích

**Khuyến nghị:**
- Dark: One Dark Pro, Dracula
- Light: GitHub Light, Atom One Light

### Keyboard Shortcuts

`File → Preferences → Keyboard Shortcuts`

### Settings

`File → Preferences → Settings`

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] VS Code đã cài đặt
- [ ] Project đã mở trong VS Code
- [ ] Tất cả extensions đã cài
- [ ] Python virtual environment đã tạo
- [ ] Python interpreter đã select
- [ ] Backend dependencies đã cài
- [ ] Frontend dependencies đã cài
- [ ] MySQL đang chạy
- [ ] Database đã setup
- [ ] SQLTools connection đã tạo
- [ ] Backend chạy thành công (http://localhost:8001)
- [ ] Frontend chạy thành công (http://localhost:3000)
- [ ] Đăng nhập được với tài khoản admin
- [ ] Debug mode hoạt động

---

## 🎉 HOÀN TẤT!

Bây giờ bạn có thể:

✅ Code Python (Backend) với IntelliSense đầy đủ
✅ Code React (Frontend) với auto-complete
✅ Debug Backend với breakpoints
✅ Xem và query Database trực tiếp
✅ Chạy Tasks bằng shortcuts
✅ Git integration
✅ Terminal tích hợp
✅ Split view để code cả Backend + Frontend cùng lúc
✅ Hot reload cho cả Backend và Frontend

**KHÔNG THIẾU MỘT CÁI GÌ HẾT!** 🚀

---

## 📚 TÀI LIỆU THAM KHẢO

- **VS Code Documentation**: https://code.visualstudio.com/docs
- **Python in VS Code**: https://code.visualstudio.com/docs/python/python-tutorial
- **JavaScript in VS Code**: https://code.visualstudio.com/docs/languages/javascript
- **Debugging**: https://code.visualstudio.com/docs/editor/debugging

---

**Happy Coding trong VS Code! 💻✨**
