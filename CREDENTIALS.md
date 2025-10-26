# 🔐 MediSchedule - Tài Khoản Test

> **Tất cả tài khoản đều sử dụng password thống nhất: `12345678`**

## 📊 Tổng Quan Tài Khoản

| Role | Email | Username | Password | Ghi chú |
|------|-------|----------|----------|---------|
| **Admin** | admin@medischedule.com | admin | 12345678 | Toàn quyền |
| **Department Head** | departmenthead@test.com | dephead | 12345678 | Quản lý bác sĩ & bệnh nhân |
| **Doctor 1** | doctor1@test.com | doctor1 | 12345678 | Tim mạch - 15 năm - 300k |
| **Doctor 2** | doctor2@test.com | doctor2 | 12345678 | Nhi khoa - 10 năm - 250k |
| **Doctor 3** | doctor3@test.com | doctor3 | 12345678 | Nội khoa - 12 năm - 280k |
| **Patient 1** | patient1@test.com | patient1 | 12345678 | Nguyễn Văn A |
| **Patient 2** | patient2@test.com | patient2 | 12345678 | Trần Thị B |
| **Patient 3** | patient3@test.com | patient3 | 12345678 | Lê Văn C |

---

## 🔐 Admin (Quản Trị Viên)

### Tài khoản Root Admin
- **Email**: `admin@medischedule.com`
- **Username**: `admin`
- **Password**: `12345678`
- **Full Name**: Root Admin
- **Phone**: 0123456789

**Quyền hạn**:
- ✅ Quản lý tất cả người dùng (Admin, Department Head, Doctor, Patient)
- ✅ Tạo và phân quyền Admin khác
- ✅ Quản lý chuyên khoa
- ✅ Phê duyệt/Từ chối bác sĩ
- ✅ Xem thống kê toàn hệ thống
- ✅ Xóa bất kỳ tài khoản nào

**URL Truy cập**: `/admin/dashboard`

---

## 👔 Department Head (Trưởng Khoa)

### Tài khoản Trưởng Khoa
- **Email**: `departmenthead@test.com`
- **Username**: `dephead`
- **Password**: `12345678`
- **Full Name**: Trưởng khoa Nguyễn Văn G
- **Phone**: 0907890123

**Quyền hạn**:
- ✅ Tạo tài khoản Doctor và Patient
- ✅ Phê duyệt/Từ chối bác sĩ trong khoa
- ✅ Xem danh sách và quản lý bác sĩ
- ✅ Xem danh sách và quản lý bệnh nhân
- ✅ Xem thống kê của khoa
- ❌ KHÔNG thể tạo Admin hoặc Department Head khác

**URL Truy cập**: `/department-head/dashboard`

---

## 👨‍⚕️ Doctors (Bác Sĩ)

### Doctor 1 - Chuyên khoa Tim mạch
- **Email**: `doctor1@test.com`
- **Username**: `doctor1`
- **Password**: `12345678`
- **Full Name**: BS. Phạm Minh D
- **Phone**: 0904567890
- **Specialty**: Tim mạch
- **Experience**: 15 năm
- **Consultation Fee**: 300,000 VNĐ
- **Status**: Approved
- **Bio**: "Bác sĩ chuyên khoa Tim mạch với 15 năm kinh nghiệm"

### Doctor 2 - Chuyên khoa Nhi
- **Email**: `doctor2@test.com`
- **Username**: `doctor2`
- **Password**: `12345678`
- **Full Name**: BS. Hoàng Thị E
- **Phone**: 0905678901
- **Specialty**: Nhi khoa
- **Experience**: 10 năm
- **Consultation Fee**: 250,000 VNĐ
- **Status**: Approved
- **Bio**: "Bác sĩ chuyên khoa Nhi với 10 năm kinh nghiệm"

### Doctor 3 - Chuyên khoa Nội
- **Email**: `doctor3@test.com`
- **Username**: `doctor3`
- **Password**: `12345678`
- **Full Name**: BS. Võ Văn F
- **Phone**: 0906789012
- **Specialty**: Nội khoa
- **Experience**: 12 năm
- **Consultation Fee**: 280,000 VNĐ
- **Status**: Approved
- **Bio**: "Bác sĩ chuyên khoa Nội với 12 năm kinh nghiệm"

**Quyền hạn**:
- ✅ Xem và quản lý lịch hẹn của mình
- ✅ Xác nhận/Hủy lịch hẹn
- ✅ Chat với bệnh nhân
- ✅ Cập nhật hồ sơ cá nhân
- ✅ Xem thống kê bệnh nhân của mình

**URL Truy cập**: `/doctor/dashboard`

---

## 👤 Patients (Bệnh Nhân)

### Patient 1
- **Email**: `patient1@test.com`
- **Username**: `patient1`
- **Password**: `12345678`
- **Full Name**: Nguyễn Văn A
- **Phone**: 0901234567
- **Date of Birth**: 15/01/1990
- **Address**: 123 Lê Lợi, Q1, TP.HCM

### Patient 2
- **Email**: `patient2@test.com`
- **Username**: `patient2`
- **Password**: `12345678`
- **Full Name**: Trần Thị B
- **Phone**: 0902345678
- **Date of Birth**: 20/05/1985
- **Address**: 456 Nguyễn Huệ, Q1, TP.HCM

### Patient 3
- **Email**: `patient3@test.com`
- **Username**: `patient3`
- **Password**: `12345678`
- **Full Name**: Lê Văn C
- **Phone**: 0903456789
- **Date of Birth**: 10/08/1995
- **Address**: 789 Hai Bà Trưng, Q3, TP.HCM

**Quyền hạn**:
- ✅ Tìm kiếm bác sĩ theo chuyên khoa
- ✅ Đặt lịch khám (online hoặc trực tiếp)
- ✅ Xem và quản lý lịch hẹn
- ✅ Chat với bác sĩ trong cuộc hẹn
- ✅ Xem lịch sử khám bệnh

**URL Truy cập**: `/patient/dashboard`

---

## 🏥 Chuyên Khoa Có Sẵn

Hệ thống có 8 chuyên khoa:
1. Nội khoa
2. Ngoại khoa
3. Nhi khoa
4. Sản phụ khoa
5. Tim mạch
6. Thần kinh
7. Da liễu
8. Tai mũi họng

---

## 🔄 Khởi Tạo Lại Dữ Liệu

### Tạo lại tất cả tài khoản test:

```bash
cd /app/backend

# Tạo admin root
python create_admin.py

# Tạo chuyên khoa, bác sĩ, bệnh nhân, trưởng khoa
python create_sample_data.py
```

### Xóa toàn bộ database và tạo lại:

```bash
cd /app/backend

# Khởi tạo chuyên khoa
python init_data.py

# Tạo admin
python create_admin.py

# Tạo dữ liệu mẫu
python create_sample_data.py
```

---

## 🔐 Login Options

Hệ thống hỗ trợ đăng nhập bằng:
- **Email** hoặc **Username**
- Password luôn là: `12345678`

### Ví dụ:
```json
{
  "login": "admin@medischedule.com",  // hoặc "admin"
  "password": "12345678"
}
```

---

## 📝 Lưu Ý Quan Trọng

1. **Password thống nhất**: Tất cả tài khoản test đều dùng password `12345678`
2. **Email phải unique**: Không được trùng email khi tạo tài khoản mới
3. **Doctor cần approval**: Bác sĩ mới đăng ký cần được Admin/Trưởng khoa phê duyệt
4. **Department Head restrictions**: Trưởng khoa KHÔNG thể tạo Admin hoặc Department Head khác
5. **Role-based access**: Mỗi role có dashboard và quyền hạn riêng

---

## 🧪 Testing Scenarios

### Scenario 1: Đặt lịch khám
1. Đăng nhập bằng `patient1@test.com`
2. Tìm bác sĩ Tim mạch
3. Đặt lịch với `doctor1@test.com`
4. Đăng nhập bằng `doctor1@test.com` để xác nhận

### Scenario 2: Quản lý bác sĩ
1. Đăng nhập bằng `departmenthead@test.com`
2. Tạo tài khoản bác sĩ mới
3. Phê duyệt bác sĩ vừa tạo
4. Xem thống kê bác sĩ trong khoa

### Scenario 3: Admin quản trị
1. Đăng nhập bằng `admin@medischedule.com`
2. Tạo tài khoản Department Head mới
3. Tạo Admin mới với phân quyền hạn chế
4. Quản lý tất cả người dùng

---

<div align="center">
  <p><strong>🔐 Bảo mật password trong production!</strong></p>
  <p>Các tài khoản này CHỈ dùng cho mục đích testing và development</p>
</div>
