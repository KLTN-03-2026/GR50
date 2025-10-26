# MediSchedule - Hệ Thống Quản Lý Lịch Khám Bệnh

<div align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
</div>

## 📋 Mục Lục
- [Giới Thiệu](#giới-thiệu)
- [Tính Năng](#tính-năng)
- [Tech Stack](#tech-stack)
- [Cài Đặt](#cài-đặt)
- [Tài Khoản Demo](#tài-khoản-demo)
- [API Documentation](#api-documentation)
- [Cấu Trúc Project](#cấu-trúc-project)
- [Hướng Dẫn Sử Dụng](#hướng-dẫn-sử-dụng)

## 🏥 Giới Thiệu

**MediSchedule** là một hệ thống quản lý lịch khám bệnh toàn diện, kết nối bệnh nhân với các bác sĩ chuyên khoa. Hệ thống hỗ trợ đặt lịch khám online, chat trực tiếp với bác sĩ, và quản lý toàn bộ quy trình từ đăng ký đến khám bệnh.

### 🎯 Đối Tượng Sử Dụng
- **Bệnh nhân**: Tìm kiếm và đặt lịch khám với bác sĩ
- **Bác sĩ**: Quản lý lịch hẹn và hồ sơ bệnh nhân
- **Trưởng khoa**: Quản lý bác sĩ và bệnh nhân trong khoa
- **Admin**: Quản trị toàn bộ hệ thống

## ✨ Tính Năng

### 🌓 Theme & Đa Ngôn Ngữ
- **Dark Mode / Light Mode**: Chuyển đổi giao diện tối/sáng
- **Đa ngôn ngữ**: Hỗ trợ Tiếng Việt và English
- **Responsive Design**: Tương thích mọi thiết bị

### 👤 Bệnh Nhân (Patient)
- ✅ Đăng ký tài khoản nhanh chóng
- 🔍 Tìm kiếm bác sĩ theo chuyên khoa
- 📅 Đặt lịch khám (trực tiếp hoặc online)
- 💬 Chat với bác sĩ trong cuộc hẹn
- 📊 Xem lịch sử khám bệnh
- 🔔 Quản lý lịch hẹn của mình

### 👨‍⚕️ Bác Sĩ (Doctor)
- 📋 Xem danh sách lịch hẹn
- ✅ Xác nhận/Hủy lịch hẹn
- 💬 Chat với bệnh nhân
- 👤 Cập nhật hồ sơ cá nhân
- ⏰ Quản lý lịch làm việc
- 📊 Thống kê số lượng bệnh nhân

### 🏢 Trưởng Khoa (Department Head)
- 👥 Tạo tài khoản bác sĩ và bệnh nhân
- ✅ Phê duyệt/Từ chối bác sĩ mới
- 📝 Quản lý danh sách bác sĩ trong khoa
- 👨‍👩‍👧‍👦 Quản lý danh sách bệnh nhân
- 🗑️ Xóa tài khoản bác sĩ/bệnh nhân
- 📊 Xem thống kê tổng quan
- 🔒 **Không thể** tạo Admin hoặc Trưởng khoa khác

### ⚙️ Admin (Administrator)
- 🎛️ Quản trị toàn bộ hệ thống
- 👥 Tạo tất cả loại tài khoản (Patient, Doctor, Department Head, Admin)
- ✅ Phê duyệt/Từ chối bác sĩ
- 📊 Xem thống kê chi tiết
- 🏥 Quản lý chuyên khoa
- 👮 Quản lý các Admin khác (với quyền phù hợp)
- 🔐 Phân quyền chi tiết cho từng Admin

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **Dark Mode Support** - Theme switching

### Backend
- **FastAPI** - Python web framework
- **Motor** - Async MongoDB driver
- **PyJWT** - JWT authentication
- **Pydantic** - Data validation
- **Passlib + bcrypt** - Password hashing
- **Python-dotenv** - Environment variables

### Database
- **MongoDB** - NoSQL database
- Collections: users, doctor_profiles, appointments, chat_messages, specialties, ai_chat_history

### Deployment
- **Kubernetes** - Container orchestration
- **Supervisor** - Process management
- **Nginx** - Reverse proxy

## 🚀 Cài Đặt

### Yêu Cầu Hệ Thống
- Node.js 16+ và Yarn
- Python 3.8+
- MongoDB 4.4+

### 1. Clone Repository
```bash
git clone <repository-url>
cd medischedule
```

### 2. Cài Đặt Backend

```bash
cd backend

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc
venv\Scripts\activate  # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env
cat > .env << EOL
MONGO_URL=mongodb://localhost:27017
DB_NAME=medischedule
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
EOL

# Khởi tạo dữ liệu mẫu
python init_data.py
python create_admin.py
python create_sample_data.py

# Chạy server
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### 3. Cài Đặt Frontend

```bash
cd frontend

# Cài đặt dependencies
yarn install

# Tạo file .env
cat > .env << EOL
REACT_APP_BACKEND_URL=http://localhost:8001
EOL

# Chạy development server
yarn start
```

### 4. Truy Cập Ứng Dụng
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

## 👥 Tài Khoản Demo

### Admin (Quản Trị Viên)
```
Email: admin@medischedule.com
Password: Admin@123
```

### Department Head (Trưởng Khoa)
```
Email: departmenthead@test.com
Password: dept123
```

### Doctor (Bác Sĩ)
```
Email: doctor1@test.com
Password: doctor123
```

### Patient (Bệnh Nhân)
```
Email: patient1@test.com
Password: patient123
```

## 📚 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "full_name": "Nguyen Van A",
  "phone": "0123456789",
  "date_of_birth": "1990-01-01",
  "role": "patient",
  "specialty_id": "uuid" // Optional, chỉ cho doctor
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "login": "user@example.com",
  "password": "password123"
}
```

### Specialties

#### Get All Specialties
```http
GET /api/specialties
```

### Appointments

#### Create Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctor_id": "doctor-uuid",
  "appointment_type": "online", // hoặc "in_person"
  "appointment_date": "2024-01-20",
  "appointment_time": "09:00",
  "symptoms": "Mô tả triệu chứng"
}
```

#### Get My Appointments
```http
GET /api/appointments/my
Authorization: Bearer <token>
```

### Admin Endpoints

#### Create User (Admin)
```http
POST /api/admin/create-user
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "password123",
  "full_name": "New User",
  "phone": "0123456789",
  "role": "patient", // patient, doctor, department_head
  "specialty_id": "uuid" // Chỉ cho doctor
}
```

#### Get All Doctors
```http
GET /api/admin/doctors
Authorization: Bearer <token>
```

#### Approve Doctor
```http
PUT /api/admin/doctors/{doctor_id}/approve
Authorization: Bearer <token>
```

### Department Head Endpoints

#### Create User (Department Head)
```http
POST /api/department-head/create-user
Authorization: Bearer <token>
Content-Type: application/json

// Chỉ có thể tạo patient hoặc doctor
{
  "email": "newdoctor@example.com",
  "username": "newdoctor",
  "password": "password123",
  "full_name": "Doctor Name",
  "phone": "0123456789",
  "role": "doctor",
  "specialty_id": "uuid"
}
```

#### Get Department Doctors
```http
GET /api/department-head/doctors
Authorization: Bearer <token>
```

#### Get Department Stats
```http
GET /api/department-head/stats
Authorization: Bearer <token>
```

## 📁 Cấu Trúc Project

```
medischedule/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── init_data.py           # Initialize specialties
│   ├── create_admin.py        # Create root admin
│   ├── create_sample_data.py  # Create sample data
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── Layout.js     # Main layout with sidebar
│   │   │   ├── LanguageToggle.js
│   │   │   └── ThemeToggle.js
│   │   ├── contexts/
│   │   │   ├── LanguageContext.js  # i18n translations
│   │   │   └── ThemeContext.js     # Dark mode
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── admin/        # Admin pages
│   │   │   ├── department-head/  # Department head pages
│   │   │   ├── doctor/       # Doctor pages
│   │   │   └── patient/      # Patient pages
│   │   ├── utils/
│   │   │   └── errorHandler.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
│
├── tests/                     # Test files
├── scripts/                   # Utility scripts
├── test_result.md            # Testing documentation
└── README.md
```

## 📖 Hướng Dẫn Sử Dụng

### Đối Với Bệnh Nhân

1. **Đăng ký tài khoản**
   - Truy cập trang chủ và click "Đăng ký"
   - Điền thông tin cá nhân
   - Chọn loại tài khoản "Bệnh nhân"

2. **Tìm kiếm bác sĩ**
   - Đăng nhập vào hệ thống
   - Vào "Tìm bác sĩ"
   - Tìm kiếm theo chuyên khoa hoặc tên bác sĩ

3. **Đặt lịch khám**
   - Chọn bác sĩ phù hợp
   - Click "Đặt lịch khám"
   - Chọn ngày, giờ và loại khám (trực tiếp/online)
   - Mô tả triệu chứng

4. **Chat với bác sĩ**
   - Sau khi lịch hẹn được xác nhận
   - Vào "Lịch hẹn" và chọn cuộc hẹn
   - Click "Chat" để trò chuyện với bác sĩ

### Đối Với Bác Sĩ

1. **Đăng ký tài khoản**
   - Truy cập trang đăng ký
   - Chọn loại tài khoản "Bác sĩ"
   - **Chọn chuyên khoa** từ dropdown
   - Điền đầy đủ thông tin
   - Chờ Admin/Trưởng khoa phê duyệt

2. **Quản lý lịch hẹn**
   - Xem danh sách lịch hẹn
   - Xác nhận hoặc hủy lịch hẹn
   - Chat với bệnh nhân

3. **Cập nhật hồ sơ**
   - Vào "Hồ sơ"
   - Cập nhật thông tin cá nhân, kinh nghiệm, phí khám

### Đối Với Trưởng Khoa

1. **Tạo tài khoản**
   - Vào "Tạo tài khoản"
   - Chọn "Bệnh nhân" hoặc "Bác sĩ"
   - Điền thông tin và submit

2. **Quản lý bác sĩ**
   - Vào "Bác sĩ"
   - Phê duyệt/Từ chối bác sĩ mới
   - Xóa bác sĩ nếu cần

3. **Xem thống kê**
   - Dashboard hiển thị tổng quan
   - Số lượng bác sĩ, bệnh nhân, lịch hẹn

### Đối Với Admin

1. **Quản lý toàn bộ hệ thống**
   - Tạo mọi loại tài khoản
   - Phê duyệt bác sĩ
   - Xem thống kê chi tiết

2. **Quản lý Admin khác**
   - Vào "Quản lý Admin"
   - Tạo Admin mới với phân quyền
   - Chỉnh sửa quyền của Admin khác

## 🎨 Theme & UI Features

### Dark Mode
- Tự động lưu preference vào localStorage
- Chuyển đổi mượt mà với transition
- Áp dụng cho toàn bộ ứng dụng

### Multi-language
- Hỗ trợ Tiếng Việt và English
- Toggle dễ dàng
- Translations được quản lý tập trung

### Responsive Design
- Mobile-first approach
- Tương thích mọi kích thước màn hình
- Touch-friendly UI

## 🔒 Security Features

- **JWT Authentication**: Token-based auth với expiry
- **Password Hashing**: Bcrypt với salt
- **Role-Based Access Control**: Phân quyền chi tiết
- **Input Validation**: Pydantic models
- **XSS Protection**: Sanitized inputs
- **CORS Configuration**: Secure cross-origin requests

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest tests/
```

### Frontend Testing
```bash
cd frontend
yarn test
```

## 🚀 Production Deployment

### Backend
```bash
# Install production dependencies
pip install -r requirements.txt

# Run with Gunicorn
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

### Frontend
```bash
# Build production
yarn build

# Serve with nginx or any static server
```

## 📞 Liên Hệ & Hỗ Trợ

- **Email**: support@medischedule.com
- **Website**: https://medischedule.com
- **Documentation**: https://docs.medischedule.com

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- FastAPI framework
- React community
- shadcn/ui components
- Tailwind CSS
- MongoDB

---

<div align="center">
  <p>Made with ❤️ by MediSchedule Team</p>
  <p>© 2024 MediSchedule. All rights reserved.</p>
</div>
