# ⚡ QUICK GUIDE - CHẠY TRONG VS CODE (1 PHÚT)

## 🚀 5 Bước siêu nhanh:

### 1️⃣ Mở Project
```bash
code .
```
Hoặc: File → Open Folder → Chọn thư mục medischedule

### 2️⃣ Install Extensions
Khi VS Code hỏi "Install recommended extensions?"
→ Click **[Install All]**

### 3️⃣ Chọn Python Interpreter
- Nhấn `Ctrl+Shift+P`
- Gõ: `Python: Select Interpreter`
- Chọn: `./backend/venv/Scripts/python.exe`

(Nếu chưa có venv: `cd backend && python -m venv venv`)

### 4️⃣ Cài Dependencies + Setup Database
- Nhấn `Ctrl+Shift+P`
- Gõ: `Tasks: Run Task`
- Chọn: `Install All Dependencies`
- Đợi xong, chọn tiếp: `Setup Database`

### 5️⃣ Chạy App
- Nhấn `Ctrl+Shift+P`
- Gõ: `Tasks: Run Task`
- Chọn: **`Start Both (Backend + Frontend)`**

**Hoặc shortcut:** `Ctrl+Shift+B`

---

## 🌐 Truy cập:

✅ **Frontend**: http://localhost:3000
✅ **Backend API**: http://localhost:8001/api/docs

**Login**: admin@medischedule.com / 12345678

---

## 🎯 Shortcuts hữu ích:

| Phím tắt | Chức năng |
|----------|-----------|
| `Ctrl+Shift+P` | Command Palette (chạy tasks) |
| `Ctrl+Shift+B` | Chạy app nhanh |
| `Ctrl+`backtick` | Mở Terminal |
| `F5` | Debug mode |
| `Ctrl+P` | Mở file nhanh |
| `Ctrl+/` | Comment code |
| `Shift+Alt+F` | Format code |

---

## 🔧 Các Tasks có sẵn:

1. **Start Both (Backend + Frontend)** ← Dùng cái này!
2. Install All Dependencies
3. Setup Database
4. Test MySQL Connection
5. Start Backend (Python)
6. Start Frontend (React)

**Chạy task:** `Ctrl+Shift+P` → `Tasks: Run Task`

---

## 🐛 Debug Mode:

1. Nhấn `Ctrl+Shift+D` (mở Debug panel)
2. Chọn: **Full Stack (Backend + Frontend)**
3. Nhấn `F5`

**Đặt breakpoint:** Click vào số dòng bên trái

---

## 📊 Xem Database:

1. Click icon **SQLTools** ở sidebar
2. Add New Connection → MySQL
3. Điền:
   - Server: localhost
   - Database: medischedule
   - Username: root
   - Password: 190705
4. Save → Click để connect

---

## ✅ DONE!

Chi tiết đầy đủ xem file: **VSCODE_GUIDE.md** 📖

**Chúc code vui! 🚀**
