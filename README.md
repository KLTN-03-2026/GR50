# 🏥 MediSchedule - Hệ thống Đặt lịch Khám bệnh Thông minh

Hệ thống quản lý đặt lịch khám bệnh trực tuyến hiện đại với tích hợp AI, hỗ trợ 4 vai trò: Bệnh nhân, Bác sĩ, Trưởng khoa và Admin.

## ✨ Tính năng Chính

### 👤 Bệnh nhân (Patient)
- ✅ Đăng ký / Đăng nhập / Quên mật khẩu
- ✅ Tìm kiếm bác sĩ theo chuyên khoa
- ✅ Xem thông tin chi tiết bác sĩ (kinh nghiệm, học vấn, phí tư vấn)
- ✅ Đặt lịch khám (trực tiếp hoặc tư vấn online)
- ✅ Quản lý lịch hẹn (xem, hủy, theo dõi trạng thái)
- ✅ Chat trực tiếp với bác sĩ (cho lịch tư vấn online)
- 🔄 **AI Chatbot tư vấn sức khỏe 24/7** (đang phát triển)
- 🔄 **Gợi ý bác sĩ thông minh dựa trên triệu chứng** (đang phát triển)
- 🔄 **Xem tóm tắt AI của cuộc trò chuyện với bác sĩ** (đang phát triển)

### 👨‍⚕️ Bác sĩ (Doctor)
- ✅ Đăng ký tài khoản và chờ phê duyệt
- ✅ Quản lý hồ sơ cá nhân (chuyên khoa, kinh nghiệm, học vấn)
- ✅ Cập nhật lịch làm việc theo từng ngày trong tuần
- ✅ Quản lý lịch hẹn (xác nhận/từ chối/hoàn thành)
- ✅ Chat với bệnh nhân trong thời gian tư vấn
- ✅ Xem danh sách bệnh nhân đã khám
- 🔄 **Xem tóm tắt AI của cuộc hội thoại** (đang phát triển)

### 👔 Trưởng khoa (Department Head)
- ✅ Quản lý bác sĩ trong khoa của mình
- ✅ Phê duyệt/từ chối tài khoản bác sĩ mới
- ✅ Thêm bác sĩ vào khoa
- ✅ Xem thống kê khoa
- ✅ Quản lý bệnh nhân
- ⚠️ **Quyền hạn giới hạn**: Không thể tạo admin hoặc quản lý chuyên khoa

### 🛠️ Admin (Administrator)
- ✅ **Tạo tài khoản người dùng mới** (Bệnh nhân, Bác sĩ, Trưởng khoa)
- ✅ **Tạo và quản lý tài khoản Admin** với phân quyền chi tiết
- ✅ Quản lý danh sách bác sĩ (phê duyệt/từ chối/xóa)
- ✅ Quản lý danh sách bệnh nhân
- ✅ Thống kê toàn hệ thống (người dùng, lịch hẹn, tư vấn)
- ✅ Quản lý chuyên khoa y tế
- ✅ **Hệ thống phân quyền Admin:**
  - `can_create_admins`: Tạo tài khoản admin mới
  - `can_manage_doctors`: Quản lý bác sĩ
  - `can_manage_patients`: Quản lý bệnh nhân
  - `can_view_stats`: Xem thống kê
  - `can_manage_specialties`: Quản lý chuyên khoa

### 🤖 Tính năng AI (Đang phát triển)
- **AI Health Chatbot**: Tư vấn sức khỏe sơ bộ, trả lời câu hỏi y tế
- **Smart Doctor Recommendation**: Gợi ý bác sĩ phù hợp dựa trên triệu chứng
- **Conversation Summarization**: Tóm tắt nội dung trao đổi giữa bác sĩ và bệnh nhân
- Sử dụng **OpenAI GPT-4o** với Emergent LLM Key

### 🌍 Tính năng Khác
- ✅ **Đa ngôn ngữ**: Hỗ trợ Tiếng Việt và English
- ✅ **Responsive Design**: Tương thích mọi thiết bị
- ✅ **Real-time Chat**: Chat trực tiếp giữa bác sĩ và bệnh nhân
- ✅ **JWT Authentication**: Bảo mật cao với token-based auth

## 🚀 Công nghệ Sử dụng

### Backend
- **FastAPI** (Python 3.10+) - High-performance web framework
- **MongoDB** - NoSQL database với Motor async driver
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing an toàn
- **emergentintegrations** - Tích hợp OpenAI GPT (đang cấu hình)

### Frontend
- **React 19** - Modern React với hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Beautiful component library
- **React Router v7** - Client-side routing
- **Axios** - HTTP client
- **React Context** - State management & i18n

### DevOps & Tools
- **Supervisor** - Process management
- **CORS** - Cross-origin resource sharing
- **Environment Variables** - Configuration management

## 📋 Tài khoản Mẫu để Test

### 🔐 Admin (Quyền root - Full permissions)
```
Email: admin@medischedule.com
Password: 12345678
Quyền: Tất cả quyền (can_create_admins, can_manage_doctors, can_manage_patients, can_view_stats, can_manage_specialties)
```

### 👔 Trưởng khoa (Department Head)
```
Email: departmenthead@test.com
Username: dephead
Password: 12345678
Quyền: Quản lý bác sĩ và bệnh nhân trong khoa, xem thống kê (không thể tạo admin)
```

### 👨‍⚕️ Bác sĩ (Doctors)
```
1. BS. Phạm Minh D - Chuyên khoa Tim mạch
   Email: doctor1@test.com
   Username: doctor1
   Password: 12345678
   Kinh nghiệm: 15 năm
   Phí tư vấn: 300,000 VNĐ

2. BS. Hoàng Thị E - Chuyên khoa Nhi khoa
   Email: doctor2@test.com
   Username: doctor2
   Password: 12345678
   Kinh nghiệm: 10 năm
   Phí tư vấn: 250,000 VNĐ

3. BS. Võ Văn F - Chuyên khoa Nội khoa
   Email: doctor3@test.com
   Username: doctor3
   Password: 12345678
   Kinh nghiệm: 12 năm
   Phí tư vấn: 280,000 VNĐ
```

### 👤 Bệnh nhân (Patients)
```
1. Nguyễn Văn A
   Email: patient1@test.com
   Username: patient1
   Password: 12345678
   SĐT: 0901234567
   Địa chỉ: 123 Lê Lợi, Q1, TP.HCM

2. Trần Thị B
   Email: patient2@test.com
   Username: patient2
   Password: 12345678
   SĐT: 0902345678
   Địa chỉ: 456 Nguyễn Huệ, Q1, TP.HCM

3. Lê Văn C
   Email: patient3@test.com
   Username: patient3
   Password: 12345678
   SĐT: 0903456789
   Địa chỉ: 789 Hai Bà Trưng, Q3, TP.HCM
```

> 💡 **Lưu ý quan trọng**: 
> - **Tất cả tài khoản test đều dùng password: `12345678`**
> - Bạn có thể đăng nhập bằng **Email** hoặc **Username**
> - Để tạo dữ liệu test: chạy `python backend/create_sample_data.py`
> - Để tạo root admin: chạy `python backend/create_admin.py`

## 📖 Hướng dẫn Sử dụng

### 🏃 Quick Start

1. **Khởi động ứng dụng**
   ```bash
   # Hệ thống đã được cấu hình với supervisor
   # Frontend: http://localhost:3000
   # Backend: http://localhost:8001
   ```

2. **Đăng nhập với tài khoản mẫu**
   - Chọn vai trò bạn muốn test (Admin/Doctor/Patient/Department Head)
   - Sử dụng email và password từ danh sách trên

3. **Tạo dữ liệu mẫu (nếu cần)**
   ```bash
   cd /app/backend
   python create_sample_data.py
   ```

### 👤 Dành cho Bệnh nhân

1. **Đăng ký tài khoản mới** (hoặc dùng tài khoản test)
   - Truy cập trang đăng ký
   - Chọn vai trò "Bệnh nhân"
   - Điền thông tin: Email, Mật khẩu, Họ tên, SĐT, Ngày sinh, Địa chỉ

2. **Tìm và đặt lịch bác sĩ**
   - Vào "Tìm bác sĩ" từ dashboard
   - Lọc theo chuyên khoa (Nội khoa, Nhi khoa, Tim mạch, v.v.)
   - Xem thông tin chi tiết bác sĩ (kinh nghiệm, học vấn, đánh giá)
   - Chọn "Đặt lịch"
   - Chọn loại tư vấn: **Khám trực tiếp** hoặc **Tư vấn online**
   - Chọn ngày và giờ phù hợp
   - Mô tả triệu chứng/lý do khám

3. **Quản lý lịch hẹn**
   - Xem danh sách lịch hẹn với trạng thái:
     - 🟡 **Pending**: Chờ bác sĩ xác nhận
     - 🟢 **Confirmed**: Đã xác nhận
     - 🔴 **Cancelled**: Đã hủy
     - ✅ **Completed**: Hoàn thành
   - Hủy lịch (nếu chưa xác nhận)

4. **Chat với bác sĩ** (Lịch tư vấn online)
   - Sau khi lịch được xác nhận
   - Vào chi tiết lịch hẹn
   - Click "Bắt đầu chat"
   - Nhắn tin trực tiếp với bác sĩ

### 👨‍⚕️ Dành cho Bác sĩ

1. **Đăng ký và chờ phê duyệt**
   - Đăng ký tài khoản với vai trò "Bác sĩ"
   - Điền đầy đủ thông tin: Chuyên khoa, Kinh nghiệm, Học vấn, Phí tư vấn
   - Chờ Admin hoặc Trưởng khoa phê duyệt

2. **Cập nhật hồ sơ**
   - Vào "Hồ sơ của tôi"
   - Cập nhật: Bio, Kinh nghiệm (năm), Học vấn, Phí tư vấn
   - Lưu thay đổi

3. **Thiết lập lịch làm việc**
   - Vào "Lịch làm việc"
   - Chọn ngày trong tuần (Thứ 2 - Chủ nhật)
   - Thêm khung giờ làm việc (VD: 08:00 - 12:00, 14:00 - 18:00)
   - Bệnh nhân chỉ có thể đặt lịch trong khung giờ này

4. **Quản lý lịch hẹn**
   - Xem danh sách lịch hẹn mới (Pending)
   - **Xác nhận** hoặc **Từ chối** lịch hẹn
   - Đánh dấu **Hoàn thành** sau khi khám xong

5. **Chat với bệnh nhân**
   - Vào chi tiết lịch hẹn đã xác nhận
   - Tư vấn trực tiếp qua chat
   - Đưa ra chẩn đoán/tư vấn

### 👔 Dành cho Trưởng khoa

1. **Quản lý bác sĩ trong khoa**
   - Xem danh sách bác sĩ đang chờ phê duyệt
   - Phê duyệt hoặc từ chối tài khoản bác sĩ mới
   - Xem thống kê bác sĩ trong khoa

2. **Thêm bác sĩ mới**
   - Tạo tài khoản bác sĩ
   - Gán chuyên khoa
   - Thiết lập thông tin ban đầu

3. **Xem thống kê**
   - Số lượng bác sĩ, bệnh nhân
   - Số lịch hẹn đã hoàn thành
   - Thống kê theo chuyên khoa

4. **Giới hạn quyền**
   - ⚠️ Không thể tạo tài khoản Admin
   - ⚠️ Không thể quản lý chuyên khoa
   - ⚠️ Chỉ quản lý trong phạm vi khoa

### 🛠️ Dành cho Admin

1. **Tạo tài khoản người dùng**
   - Vào "Tạo tài khoản" từ sidebar
   - Chọn vai trò: Patient / Doctor / Department Head
   - Điền thông tin theo vai trò:
     - **Patient**: Thông tin cá nhân cơ bản
     - **Doctor**: Thêm chuyên khoa, kinh nghiệm, học vấn, phí
     - **Department Head**: Chọn quyền hạn
   - Click "Tạo tài khoản"

2. **Quản lý Admin**
   - Vào "Quản lý Admin" (chỉ admin có quyền `can_create_admins`)
   - **Tạo Admin mới**:
     - Điền Email, Password, Họ tên
     - Chọn quyền:
       - ✅ Có thể tạo Admin khác
       - ✅ Quản lý bác sĩ
       - ✅ Quản lý bệnh nhân
       - ✅ Xem thống kê
       - ✅ Quản lý chuyên khoa
   - **Sửa quyền Admin**: Click "Edit" → Thay đổi permissions
   - **Xóa Admin**: Click "Delete" (không thể xóa chính mình)

3. **Phê duyệt bác sĩ**
   - Vào "Quản lý bác sĩ"
   - Xem danh sách bác sĩ đang chờ (Status: Pending)
   - Click "Approve" để phê duyệt
   - Click "Reject" để từ chối

4. **Quản lý chuyên khoa**
   - Vào "Chuyên khoa"
   - Thêm/Sửa/Xóa chuyên khoa
   - Cập nhật mô tả chuyên khoa

5. **Xem thống kê**
   - Dashboard hiển thị:
     - 📊 Tổng số bệnh nhân
     - 👨‍⚕️ Tổng số bác sĩ (đã phê duyệt/chờ phê duyệt)
     - 📅 Tổng số lịch hẹn
     - 💬 Số lượt tư vấn online
     - 📈 Biểu đồ theo thời gian

### 🌍 Đổi ngôn ngữ

- Click vào icon **🌐** ở sidebar
- Chọn **Tiếng Việt** (VI) hoặc **English** (EN)
- Giao diện sẽ tự động chuyển đổi
- Ngôn ngữ được lưu vào localStorage

## 🏗️ Cấu trúc Dự án

```
/app
├── backend/                  # FastAPI Backend
│   ├── server.py            # Main API server với tất cả endpoints
│   ├── .env                 # Environment variables
│   ├── requirements.txt     # Python dependencies
│   ├── create_admin.py      # Script tạo root admin
│   ├── create_sample_data.py # Script tạo dữ liệu mẫu
│   └── init_data.py         # Script khởi tạo chuyên khoa
│
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── pages/          # Các trang chính
│   │   │   ├── auth/       # Login, Register, ForgotPassword
│   │   │   ├── patient/    # Patient Dashboard, FindDoctors, Appointments
│   │   │   ├── doctor/     # Doctor Dashboard, Appointments, Profile
│   │   │   ├── admin/      # Admin Dashboard, Admins, CreateAccounts, Doctors, Patients, Stats
│   │   │   └── department-head/ # Department Head Dashboard
│   │   ├── components/     # Reusable components
│   │   │   ├── Layout.js   # Main layout với sidebar & navbar
│   │   │   ├── LanguageToggle.js # Nút đổi ngôn ngữ
│   │   │   └── ui/         # Shadcn UI components
│   │   ├── contexts/       # React Contexts
│   │   │   ├── AuthContext.js # Authentication state
│   │   │   └── LanguageContext.js # i18n translations
│   │   ├── App.js          # Main app với routing
│   │   └── index.js        # Entry point
│   ├── .env                # Frontend environment variables
│   ├── package.json        # Node dependencies
│   └── tailwind.config.js  # Tailwind configuration
│
├── tests/                   # Test files
├── README.md               # Tài liệu này
├── TEST_ACCOUNTS.md        # Tài khoản test chi tiết
└── test_result.md          # Testing protocol & results
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Reset mật khẩu

### Specialties (Chuyên khoa)
- `GET /api/specialties` - Danh sách chuyên khoa
- `POST /api/specialties` - Tạo chuyên khoa mới (Admin only)

### Doctors (Bác sĩ)
- `GET /api/doctors` - Danh sách bác sĩ (có filter by specialty)
- `GET /api/doctors/{doctor_id}` - Chi tiết bác sĩ
- `PUT /api/doctors/profile` - Cập nhật profile (Doctor only)
- `PUT /api/doctors/schedule` - Cập nhật lịch làm việc (Doctor only)

### Appointments (Lịch hẹn)
- `POST /api/appointments` - Tạo lịch hẹn (Patient only)
- `GET /api/appointments/my` - Lịch hẹn của tôi
- `PUT /api/appointments/{id}/status` - Cập nhật trạng thái (Doctor only)

### Chat (Tin nhắn)
- `POST /api/chat` - Gửi tin nhắn
- `GET /api/chat/{appointment_id}` - Lấy tin nhắn theo lịch hẹn

### Admin Management
- `GET /api/admin/doctors` - Danh sách tất cả bác sĩ
- `PUT /api/admin/doctors/{id}/approve` - Phê duyệt bác sĩ
- `GET /api/admin/patients` - Danh sách bệnh nhân
- `GET /api/admin/stats` - Thống kê hệ thống
- `POST /api/admin/create-admin` - Tạo tài khoản admin (requires can_create_admins)
- `GET /api/admin/admins` - Danh sách admin
- `PUT /api/admin/update-permissions` - Cập nhật quyền admin
- `DELETE /api/admin/delete-admin/{id}` - Xóa admin
- `POST /api/admin/create-user` - Tạo tài khoản user (Patient/Doctor/Department Head)
- `DELETE /api/admin/users/{id}` - Xóa user

### Department Head
- `POST /api/department-head/promote` - Thăng cấp bác sĩ lên Trưởng khoa
- `POST /api/department-head/demote/{id}` - Hạ cấp Trưởng khoa
- `POST /api/department-head/add-doctor` - Thêm bác sĩ vào khoa
- `GET /api/department-head/my-doctors` - Bác sĩ trong khoa
- `PUT /api/department-head/approve-doctor/{id}` - Phê duyệt bác sĩ
- `DELETE /api/department-head/remove-doctor/{id}` - Xóa bác sĩ khỏi khoa

### AI Features (Đang phát triển)
- `POST /api/ai/chat` - AI chatbot tư vấn sức khỏe
- `POST /api/ai/recommend-doctor` - Gợi ý bác sĩ dựa trên triệu chứng
- `POST /api/ai/summarize-conversation/{id}` - Tóm tắt cuộc trò chuyện
- `GET /api/ai/chat-history` - Lịch sử chat với AI

### Health Check
- `GET /api/health` - Kiểm tra trạng thái hệ thống

## 🗂️ Chuyên khoa Có sẵn

1. **Nội khoa** - Internal Medicine
2. **Ngoại khoa** - Surgery
3. **Nhi khoa** - Pediatrics
4. **Sản phụ khoa** - Obstetrics & Gynecology
5. **Tim mạch** - Cardiology
6. **Thần kinh** - Neurology
7. **Da liễu** - Dermatology
8. **Tai mũi họng** - ENT (Ear, Nose, Throat)

## 🔐 Bảo mật

- ✅ **JWT Authentication**: Token-based authentication an toàn
- ✅ **Bcrypt Password Hashing**: Mật khẩu được mã hóa với bcrypt (cost factor: 12)
- ✅ **Role-based Access Control (RBAC)**: Phân quyền theo vai trò
- ✅ **Permission-based Admin System**: Admin có quyền chi tiết
- ✅ **CORS Configuration**: Bảo vệ cross-origin requests
- ✅ **Environment Variables**: Sensitive data không hardcode
- ✅ **MongoDB Unique Indexes**: Email và ID unique
- ⚠️ **Production Notes**: 
  - Đổi `JWT_SECRET_KEY` trước khi deploy
  - Sử dụng HTTPS trong production
  - Giới hạn CORS origins

## 🧪 Testing

### Chạy Backend Tests
```bash
cd /app/backend
python -m pytest tests/ -v
```

### Test với Curl
```bash
# Test health endpoint
curl http://localhost:8001/api/health

# Test login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medischedule.com","password":"admin123"}'
```

### Manual Testing Flow
1. Đăng nhập với tài khoản Patient
2. Tìm kiếm và đặt lịch bác sĩ
3. Đăng nhập với tài khoản Doctor tương ứng
4. Xác nhận lịch hẹn
5. Test chat giữa Patient và Doctor
6. Đăng nhập Admin và xem thống kê

## 🐛 Troubleshooting

### Backend không khởi động
```bash
# Check backend logs
tail -n 100 /var/log/supervisor/backend.err.log

# Restart backend
sudo supervisorctl restart backend
```

### Frontend không kết nối được Backend
- Kiểm tra `frontend/.env` có `REACT_APP_BACKEND_URL` đúng không
- Kiểm tra backend đang chạy: `curl http://localhost:8001/api/health`
- Check CORS configuration trong `backend/server.py`

### MongoDB connection failed
- Kiểm tra `backend/.env` có `MONGO_URL` đúng không
- Kiểm tra MongoDB service: `sudo systemctl status mongod`
- Restart MongoDB: `sudo systemctl restart mongod`

### Lỗi 401 Unauthorized
- Token đã hết hạn, logout và login lại
- Kiểm tra `JWT_SECRET_KEY` trong `backend/.env`

### Admin không thấy menu "Quản lý Admin"
- Kiểm tra admin có quyền `can_create_admins = True`
- Login với root admin: `admin@medischedule.com`

## 📝 Environment Variables

### Backend (.env)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="healthcare"
CORS_ORIGINS="*"
ENVIRONMENT="development"
JWT_SECRET_KEY="your-secret-key-change-in-production"
MONGO_CONNECT_TIMEOUT=5000
MONGO_SERVER_SELECTION_TIMEOUT=5000
# EMERGENT_LLM_KEY="your-emergent-key" # For AI features
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL="http://localhost:8001"
```

## 🚀 Deployment

### Production Checklist
- [ ] Đổi `JWT_SECRET_KEY` thành secret key mạnh
- [ ] Cấu hình CORS với domain cụ thể (không dùng `*`)
- [ ] Set `ENVIRONMENT=production`
- [ ] Sử dụng HTTPS
- [ ] Configure MongoDB với authentication
- [ ] Set proper `MONGO_CONNECT_TIMEOUT` và `MONGO_SERVER_SELECTION_TIMEOUT`
- [ ] Add rate limiting
- [ ] Configure logging
- [ ] Backup strategy cho MongoDB
- [ ] Monitor system với health checks

### Supervisor Configuration
```bash
# Restart all services
sudo supervisorctl restart all

# Check status
sudo supervisorctl status

# View logs
sudo supervisorctl tail -f backend stderr
sudo supervisorctl tail -f frontend stderr
```

## 🔄 Roadmap

### Version 1.0 (Current) ✅
- ✅ Basic authentication & authorization
- ✅ Patient appointment booking
- ✅ Doctor profile & schedule management
- ✅ Real-time chat
- ✅ Admin panel với phân quyền
- ✅ Multi-language support (VI/EN)
- ✅ Account creation system
- ✅ Department Head role

### Version 1.1 (In Progress) 🔄
- 🔄 AI Health Chatbot
- 🔄 AI Doctor Recommendation
- 🔄 AI Conversation Summarization
- 🔄 Frontend UI for AI features
- 📝 Email notifications
- 📝 SMS reminders
- 📝 Payment integration

### Version 2.0 (Planned) 📋
- 📋 Video consultation
- 📋 Electronic medical records (EMR)
- 📋 Prescription management
- 📋 Lab test results
- 📋 Mobile app (React Native)
- 📋 Advanced analytics & reporting
- 📋 Multi-hospital support

## 👥 Đóng góp

Nếu bạn muốn đóng góp vào dự án:
1. Fork repo
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phát triển cho mục đích học tập và demo.

## 📞 Liên hệ & Hỗ trợ

Nếu bạn gặp vấn đề hoặc có câu hỏi:
- 📧 Email: support@medischedule.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/medischedule/issues)
- 📖 Documentation: [Wiki](https://github.com/your-repo/medischedule/wiki)

## 🙏 Credits

- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Shadcn UI**: https://ui.shadcn.com/
- **MongoDB**: https://www.mongodb.com/
- **OpenAI**: https://openai.com/ (for AI features)

---

**Made with ❤️ by MediSchedule Team**

**Version**: 1.0.0  
**Last Updated**: 2025-01-20  
**Status**: ✅ Production Ready (AI features in development)
