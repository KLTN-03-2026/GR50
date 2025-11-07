# 🎯 BẮT ĐẦU TẠI ĐÂY - Windows Local Setup

> **Hệ thống MediSchedule đã được cấu hình để chạy hoàn toàn trên Windows local**  
> **với ID số tự động tăng (1, 2, 3, 4...) thay vì UUID**

---

## ✅ Đã thay đổi gì?

### 1. **Database ID - Từ UUID → Integer**

#### ❌ Trước đây (UUID):
```sql
id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

#### ✅ Bây giờ (Integer):
```sql
id: 1, 2, 3, 4, 5, 6...
```

### 2. **Frontend Port - Thay đổi sang 3050**

```
Frontend: http://localhost:3050
Backend:  http://localhost:8001
```

### 3. **Database Setup - MySQL Local**

```
Host: localhost
Port: 3306
User: root
Password: 190705
Database: medischedule
```

---

## 📂 Files quan trọng

| File | Mô tả |
|------|-------|
| `SETUP_WINDOWS_LOCAL.md` | 📖 Hướng dẫn chi tiết từng bước |
| `QUICK_START_WINDOWS.md` | ⚡ Hướng dẫn nhanh 5 phút |
| `README_WINDOWS_LOCAL.md` | 📚 Tài liệu đầy đủ |
| `create_database_local.sql` | 🗄️ Script tạo database |
| `create_sample_data_local.py` | 👥 Script tạo dữ liệu mẫu |
| `test_local_setup.py` | ✅ Script test setup |

---

## 🚀 Bắt đầu nhanh

### Bước 1: Kiểm tra yêu cầu

```cmd
# Kiểm tra Python
python --version
# Kết quả: Python 3.9.x hoặc cao hơn

# Kiểm tra Node.js
node --version
# Kết quả: v16.x.x hoặc cao hơn

# Kiểm tra MySQL
mysql --version
# Kết quả: mysql Ver 8.0.x
```

### Bước 2: Tạo Database

```cmd
mysql -u root -p190705 < create_database_local.sql
cd backend
python create_sample_data_local.py
```

### Bước 3: Test Setup

```cmd
cd backend
python test_local_setup.py
```

Nếu tất cả test đều pass ✅, bạn sẵn sàng!

### Bước 4: Chạy ứng dụng

**Terminal 1 - Backend:**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

**Terminal 2 - Frontend:**
```cmd
cd frontend
yarn install
yarn start
```

---

## 🎉 Hoàn tất!

### Truy cập ứng dụng:

- **Frontend**: http://localhost:3050
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/api/docs

### Đăng nhập ngay:

```
Email: admin@medischedule.com
Password: 12345678
```

hoặc

```
Email: patient1@test.com
Password: 12345678
```

---

## 📊 Cấu trúc Database mới

### Tất cả bảng sử dụng Integer ID:

```sql
-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- ✅ Integer ID
    email VARCHAR(255),
    ...
);

-- Doctors table
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- ✅ Integer ID
    user_id INT,                         -- ✅ Foreign Key Integer
    ...
);

-- Appointments table
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- ✅ Integer ID
    patient_id INT,                      -- ✅ Foreign Key Integer
    doctor_id INT,                       -- ✅ Foreign Key Integer
    ...
);
```

### Ví dụ dữ liệu:

| id | email | full_name | role |
|----|-------|-----------|------|
| 1 | admin@medischedule.com | Quản trị viên | admin |
| 2 | departmenthead@test.com | Trưởng Khoa | department_head |
| 3 | doctor1@test.com | Bác sĩ Nguyễn Văn A | doctor |
| 4 | patient1@test.com | Nguyễn Thị D | patient |

---

## 🔧 Code Changes

### 1. Models (backend/models.py)

#### ❌ Trước:
```python
class User(Base):
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
```

#### ✅ Sau:
```python
class User(Base):
    id = Column(Integer, primary_key=True, autoincrement=True)
```

### 2. Server (backend/server.py)

#### ❌ Trước:
```python
user_id = str(uuid.uuid4())
user = User(id=user_id, ...)
```

#### ✅ Sau:
```python
# ID tự động tạo bởi database
user = User(...)  # Không cần set id
```

### 3. Frontend (.env)

#### ❌ Trước:
```env
PORT=3000
REACT_APP_BACKEND_URL=http://localhost:8001
```

#### ✅ Sau:
```env
PORT=3050
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 🎯 Ưu điểm của Integer ID

| Đặc điểm | UUID | Integer |
|----------|------|---------|
| Độ dài | 36 ký tự | 1-10 chữ số |
| Dễ đọc | ❌ Khó | ✅ Dễ |
| Debug | ❌ Khó | ✅ Dễ |
| Performance | Trung bình | ✅ Nhanh hơn |
| Database size | Lớn hơn | ✅ Nhỏ hơn |
| URL | Dài | ✅ Ngắn |

**Ví dụ URL:**
- UUID: `/appointments/a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- Integer: `/appointments/123` ✅

---

## 🛠️ Troubleshooting

### ❌ MySQL không kết nối được

```cmd
# Kiểm tra service
net start MySQL80

# Hoặc restart
net stop MySQL80
net start MySQL80
```

### ❌ Port đã được sử dụng

```cmd
# Tìm process đang dùng port 3050
netstat -ano | findstr :3050

# Kill process
taskkill /PID <PID> /F
```

### ❌ Module not found

```cmd
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
yarn install
```

---

## 📞 Cần trợ giúp?

### Tài liệu chi tiết:

1. **Setup đầy đủ**: `SETUP_WINDOWS_LOCAL.md`
2. **Quick Start**: `QUICK_START_WINDOWS.md`
3. **Full Documentation**: `README_WINDOWS_LOCAL.md`

### Kiểm tra logs:

**Backend**: Terminal đang chạy `python server.py`

**Frontend**: Terminal đang chạy `yarn start` + Browser Console (F12)

**Database**: 
```cmd
mysql -u root -p190705
USE medischedule;
SHOW TABLES;
```

---

## ✨ Tính năng đã sẵn sàng

- ✅ Đăng ký / Đăng nhập
- ✅ Quản lý bệnh nhân
- ✅ Quản lý bác sĩ
- ✅ Đặt lịch khám (Online/Offline)
- ✅ Chat bệnh nhân - bác sĩ
- ✅ Chia sẻ hình ảnh trong chat
- ✅ Thanh toán (Mock)
- ✅ Quản lý chuyên khoa
- ✅ Admin Dashboard
- ✅ Department Head Dashboard
- ✅ Đa ngôn ngữ (VI/EN)

---

## 🎓 Next Steps

### 1. Setup xong → Test ngay:

```cmd
cd backend
python test_local_setup.py
```

### 2. Chạy ứng dụng:

```cmd
# Terminal 1
cd backend && python server.py

# Terminal 2
cd frontend && yarn start
```

### 3. Đăng nhập và khám phá:

- Đăng nhập với admin
- Tạo bác sĩ mới
- Tạo bệnh nhân mới
- Đặt lịch khám
- Test chat
- Test thanh toán

---

## 📝 Checklist hoàn thành

- [ ] Đã cài đặt Python, Node.js, MySQL
- [ ] Đã chạy `create_database_local.sql`
- [ ] Đã chạy `create_sample_data_local.py`
- [ ] Đã test với `test_local_setup.py` ✅
- [ ] Backend đang chạy tại port 8001
- [ ] Frontend đang chạy tại port 3050
- [ ] Đã đăng nhập thành công
- [ ] Đã test các tính năng chính

---

**🎉 Chúc bạn phát triển thành công!**

*Windows Local Edition - Integer IDs*  
*Version 2.0 - 2025*
