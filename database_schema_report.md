# Báo cáo Cấu trúc CSDL (Database Schema Report)

Hệ thống hiện tại đang sử dụng hệ quản trị CSDL **MySQL** thông qua ORM **Sequelize** (được cấu hình trong tệp `backend/config/database.js`).

Dưới đây là danh sách chi tiết các bảng (Tables), Khóa chính (Primary Keys - PK) và các Khóa ngoại liên kết (Foreign Keys - FK) dựa trên file cấu hình Model của hệ thống (`backend/models/index.js`).

---

## 1. Hệ thống Quản lý Người Dùng & Phân quyền
### Bảng `NguoiDung` (Users)
- **PK**: `Id_NguoiDung`
- **FK liên kết tới**:
  - `ChuyenKhoa`: `Id_ChuyenKhoa_QuanLy` (Khoa được phân công quản lý)

### Bảng `VaiTro` (Roles)
- **PK**: `Id_VaiTro`

### Bảng `NguoiDung_VaiTro` (Bảng trung gian n-n)
- **FK 1**: `Id_NguoiDung` (Liên kết tới `NguoiDung`)
- **FK 2**: `Id_VaiTro` (Liên kết tới `VaiTro`)

### Bảng `PasswordReset` & `DatLaiMatKhau`
- **PK**: `id`
- **FK**: `user_id` hoặc `Id_NguoiDung` (Liên kết tới `NguoiDung`)

---

## 2. Thông tin Y tế & Lâm sàng
### Bảng `BenhNhan` (Patients)
- **PK**: `Id_BenhNhan`
- **FK**: `Id_NguoiDung` (Liên kết 1-1 với `NguoiDung`)

### Bảng `BacSi` (Doctors)
- **PK**: `Id_BacSi`
- **FK**: 
  - `Id_NguoiDung` (Liên kết 1-1 với `NguoiDung`)
  - `Id_ChuyenKhoa` (Thuộc chuyên khoa nào)
  - `Id_PhongKham` (Làm việc tại phòng khám nào)

### Bảng `ChuyenKhoa` (Specialties)
- **PK**: `Id_ChuyenKhoa`

### Bảng `PhongKham` (Clinics/Facilities)
- **PK**: `Id_PhongKham`

---

## 3. Quản lý Đặt Lịch & Khám bệnh
### Bảng `LichKham` (Schedules/Time Slots)
- **PK**: `Id_LichKham`
- **FK**: `Id_BacSi` (Lịch này của Bác sĩ nào)

### Bảng `DatLich` (Appointments)
- **PK**: `Id_DatLich`
- **FK**:
  - `Id_BenhNhan` (Bệnh nhân đặt)
  - `Id_LichKham` (Slot thời gian khám)

### Bảng `HoSoBenhAn` (Medical Records)
- **PK**: `Id_HoSo`
- **FK**:
  - `Id_DatLich` (Liên kết 1-1 với phiên đặt lịch)
  - `Id_BenhNhan` (Hồ sơ của bệnh nhân)
  - `Id_BacSi` (Bác sĩ phụ trách khám)

### Bảng `DanhGia` (Reviews)
- **PK**: `Id_DanhGia`
- **FK**:
  - `Id_BacSi` (Bác sĩ được đánh giá)
  - `Id_BenhNhan` (Bệnh nhân đánh giá)
  - `Id_DatLich` (Đánh giá cho lượt khám nào)

---

## 4. Đơn Thuốc & Thanh Toán
### Bảng `DonThuoc` (Prescriptions)
- **PK**: `Id_DonThuoc`
- **FK**: `Id_HoSo` (Thuộc về Hồ sơ bệnh án nào)

### Bảng `ChiTietDonThuoc` (Prescription Details)
- **PK**: `Id_ChiTiet`
- **FK**: `Id_DonThuoc`

### Bảng `HoaDon` (Invoices)
- **PK**: `Id_HoaDon`
- **FK**: `Id_DatLich` (Hoá đơn của Lịch khám nào)

### Bảng `ThanhToan` (Payments)
- **PK**: `Id_ThanhToan`
- **FK**:
  - `Id_HoaDon` (Thanh toán cho hoá đơn nào)
  - `Id_DatLich` (Thanh toán cọc/hoàn cho lịch khám nào)
  - `Id_BenhNhan` (Bệnh nhân thực hiện thanh toán)

---

## 5. Hệ thống AI & Tư vấn Trực tuyến
### Bảng `AITuVanPhien` (AI Chat Sessions)
- **PK**: `Id_AITuVanPhien`
- **FK**:
  - `Id_NguoiDung` (Người dùng trò chuyện)
  - `Id_BacSi_PhuTrach` (Bác sĩ được chỉ định tiếp nhận ca AI này)

### Bảng `AITuVanTinNhan` (AI Chat Messages)
- **PK**: `Id_AITuVanTinNhan`
- **FK**: `Id_AITuVanPhien` (Tin nhắn thuộc phiên nào)

---

## 6. Giao tiếp (Chat, Call, Hỗ trợ)
### Bảng `Conversation` (Các cuộc trò chuyện)
- **PK**: `id` / `conversation_id`
- **FK**: 
  - `appointment_id` (Chat trong lịch hẹn)
  - `support_case_id` (Chat trong ticket hỗ trợ)

### Bảng `Message` (Tin nhắn Chat)
- **PK**: `id` / `message_id`
- **FK**:
  - `conversation_id` (Nằm trong cuộc trò chuyện nào)
  - `sender_id` (Liên kết tới `NguoiDung` gửi)

### Bảng `ConversationParticipant` & `CallParticipant`
- **FK**:
  - `conversation_id` / `call_session_id`
  - `user_id` (Liên kết tới `NguoiDung`)

### Bảng `SupportCase` (Ticket hỗ trợ)
- **PK**: `id` / `support_case_id`
- **FK**:
  - `patient_id` (Liên kết tới `BenhNhan`)
  - `staff_id` (Liên kết tới `NguoiDung` có vai trò Staff giải quyết)
