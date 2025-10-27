# 📋 CHECKLIST CÀI ĐẶT MEDISCHEDULE

## ✅ BƯỚC 1: CHUẨN BỊ MÔI TRƯỜNG

### Cài đặt phần mềm:

- [ ] **Python 3.8+** 
  - Link: https://www.python.org/downloads/
  - Nhớ check "Add Python to PATH" khi cài
  - Test: `python --version`

- [ ] **Node.js 16+** 
  - Link: https://nodejs.org/
  - Test: `node --version` và `npm --version`

- [ ] **MySQL 8.0+**
  - Link: https://dev.mysql.com/downloads/installer/
  - Hoặc XAMPP: https://www.apachefriends.org/
  - Nhớ password root bạn đặt (mặc định: 190705)
  - Test: `mysql --version`

- [ ] **Git** (Optional)
  - Link: https://git-scm.com/downloads/
  - Để clone project từ GitHub

---

## ✅ BƯỚC 2: CÀI ĐẶT DEPENDENCIES

### Backend (Python):

```bash
cd backend
pip install -r requirements.txt
```

✅ Checklist packages chính:
- [ ] fastapi
- [ ] uvicorn
- [ ] sqlalchemy
- [ ] aiomysql
- [ ] mysql-connector-python
- [ ] python-jose (JWT)
- [ ] passlib (Password hashing)

### Frontend (React):

```bash
cd frontend
npm install -g yarn
yarn install
```

✅ Checklist:
- [ ] Yarn installed successfully
- [ ] node_modules folder created
- [ ] No error messages

---

## ✅ BƯỚC 3: CẤU HÌNH FILE .ENV

### Backend `.env`:

File: `backend/.env`

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=190705          # ⚠️ THAY ĐỔI NẾU CẦN
MYSQL_DATABASE=medischedule
DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule
JWT_SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ENVIRONMENT=development
```

✅ Checklist:
- [ ] File `.env` exists in backend folder
- [ ] `MYSQL_PASSWORD` matches your MySQL password
- [ ] `DATABASE_URL` has correct password

### Frontend `.env.local`:

File: `frontend/.env.local` (TẠO MỚI FILE NÀY)

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

✅ Checklist:
- [ ] File `.env.local` created in frontend folder
- [ ] Backend URL points to localhost:8001

---

## ✅ BƯỚC 4: SETUP DATABASE

### Option 1: Dùng Script tự động (Khuyến nghị)

**Double-click**: `SETUP_DATABASE_WINDOWS.bat`

### Option 2: Setup thủ công

```bash
cd backend

# 1. Tạo database và tables
mysql -u root -p190705 < create_database.sql

# 2. Test connection
python test_mysql_connection.py

# 3. Tạo admin account
python create_admin_mysql.py

# 4. Tạo sample data
python create_sample_data_mysql.py
```

✅ Checklist:
- [ ] Database `medischedule` created
- [ ] 8 tables created (users, patients, doctors, etc.)
- [ ] Admin account created (admin@medischedule.com)
- [ ] Sample data created (doctors, patients, specialties)
- [ ] Connection test passed

---

## ✅ BƯỚC 5: KHỞI ĐỘNG ỨNG DỤNG

### Cách 1: Dùng Scripts (Khuyến nghị)

**Terminal 1 - Backend:**
- Double-click: `START_BACKEND_WINDOWS.bat`
- Hoặc: `cd backend && python server.py`

**Terminal 2 - Frontend:**
- Double-click: `START_FRONTEND_WINDOWS.bat`
- Hoặc: `cd frontend && yarn start`

### Cách 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
python server.py
```
- Backend running at: http://localhost:8001
- Check: http://localhost:8001/api/docs

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start
```
- Frontend running at: http://localhost:3000
- Browser should open automatically

✅ Checklist:
- [ ] Backend started without errors
- [ ] Can access http://localhost:8001/api/docs
- [ ] Frontend started without errors
- [ ] Can access http://localhost:3000
- [ ] No error messages in terminals

---

## ✅ BƯỚC 6: KIỂM TRA HOẠT ĐỘNG

### Test Backend:

- [ ] **API Docs**: http://localhost:8001/api/docs (should load Swagger UI)
- [ ] **Health Check**: http://localhost:8001/health (should return OK)
- [ ] **Specialties**: http://localhost:8001/api/specialties (should return list)

### Test Frontend:

- [ ] **Homepage**: http://localhost:3000 (should load landing page)
- [ ] **Login page**: Click "Đăng nhập" button

### Test Login:

Thử đăng nhập với tài khoản admin:
- Email: `admin@medischedule.com`
- Password: `12345678`

- [ ] Login successful
- [ ] Redirected to Admin Dashboard
- [ ] Can see dashboard with statistics

### Test Other Accounts:

**Department Head:**
- [ ] Email: departmenthead@test.com / Password: 12345678
- [ ] Redirected to Department Head Dashboard

**Doctor:**
- [ ] Email: doctor1@test.com / Password: 12345678
- [ ] Redirected to Doctor Dashboard

**Patient:**
- [ ] Email: patient1@test.com / Password: 12345678
- [ ] Redirected to Patient Dashboard

---

## ✅ BƯỚC 7: KIỂM TRA TÍNH NĂNG

### Admin Features:

- [ ] View dashboard statistics
- [ ] Manage doctors (approve/reject)
- [ ] Manage patients
- [ ] Create new accounts
- [ ] Manage admins

### Department Head Features:

- [ ] View dashboard
- [ ] Create doctor/patient accounts
- [ ] Manage doctors
- [ ] Manage patients

### Doctor Features:

- [ ] View appointments
- [ ] Update profile
- [ ] View schedule

### Patient Features:

- [ ] Search doctors
- [ ] Create appointments
- [ ] View appointments

---

## 🐛 TROUBLESHOOTING CHECKLIST

### If Backend won't start:

- [ ] MySQL is running (check services.msc or XAMPP)
- [ ] Database `medischedule` exists
- [ ] Password in `.env` is correct
- [ ] Port 8001 is not in use
- [ ] All Python packages installed

### If Frontend won't start:

- [ ] Node.js and Yarn installed
- [ ] `yarn install` completed successfully
- [ ] Port 3000 is not in use
- [ ] `.env.local` file exists with correct backend URL

### If Login fails:

- [ ] Backend is running
- [ ] Database has admin account
- [ ] Using correct credentials
- [ ] Check browser console for errors (F12)

### If APIs fail:

- [ ] Frontend `.env.local` has `REACT_APP_BACKEND_URL=http://localhost:8001`
- [ ] Backend is running
- [ ] CORS is enabled in backend
- [ ] Check backend terminal for error logs

---

## 📊 FINAL STATUS CHECK

Sau khi hoàn thành tất cả:

✅ **Services Running:**
- [ ] MySQL service running
- [ ] Backend running at http://localhost:8001
- [ ] Frontend running at http://localhost:3000

✅ **Can Access:**
- [ ] API documentation
- [ ] Frontend homepage
- [ ] Login page
- [ ] Admin dashboard (after login)

✅ **All Test Accounts Work:**
- [ ] Admin login
- [ ] Department Head login
- [ ] Doctor login
- [ ] Patient login

✅ **Features Working:**
- [ ] User authentication
- [ ] Dashboard displays
- [ ] Navigation between pages
- [ ] API calls successful

---

## 🎉 HOÀN TẤT!

Nếu tất cả checklist đều ✅:

**🎊 CHÚC MỪNG! Hệ thống đã sẵn sàng hoạt động!**

---

## 📞 CẦN GIÚP ĐỠ?

1. Xem: `README_WINDOWS.md` (hướng dẫn chi tiết)
2. Xem: `backend/HUONG_DAN_CHAY_MYSQL.md` (troubleshooting)
3. Check backend logs trong terminal
4. Check browser console (F12) cho frontend errors

---

**Created: January 2025**
**Version: 1.0**
