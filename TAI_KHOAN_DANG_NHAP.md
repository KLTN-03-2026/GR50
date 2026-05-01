# 🔐 Danh sách Tài khoản & Hướng dẫn Truy cập - MediSchedule

![Security Banner](./docs/images/banner.png)

> **Lưu ý quan trọng**: Dưới đây là danh sách tài khoản được tạo tự động từ hệ thống Seed dữ liệu mẫu. Vui lòng sử dụng các thông tin này để đăng nhập và kiểm thử các tính năng theo đúng vai trò.

---

## 👥 Tài khoản Kiểm thử (Test Accounts)

Tất cả tài khoản dưới đây đều sử dụng mật khẩu chung: **`12345678`**

### 🔴 Nhóm Quản trị & Nhân viên (Admin & Staff)

| Vai trò | Email | Mật khẩu | Phạm vi quản lý |
| :--- | :--- | :--- | :--- |
| **Siêu quản trị (Admin)** | `admin@medischedule.com` | `12345678` | Toàn bộ hệ thống |
| **Nhân viên 1 (Staff)** | `staff1@medischedule.com` | `12345678` | Bệnh viện Bạch Mai (Hà Nội) |
| **Nhân viên 2 (Staff)** | `staff2@medischedule.com` | `12345678` | Bệnh viện Chợ Rẫy (TP.HCM) |
| **Nhân viên 3 (Staff)** | `staff3@medischedule.com` | `12345678` | Bệnh viện Đa khoa Đà Nẵng |
| **Nhân viên 4 (Staff)** | `staff4@medischedule.com` | `12345678` | Bệnh viện Trung ương Huế |
| **Nhân viên 5 (Staff)** | `staff5@medischedule.com` | `12345678` | Bệnh viện Đa khoa Cần Thơ |

---

### 🟢 Nhóm Bác sĩ (Doctors)
Hệ thống đã nạp **20 bác sĩ** phân bổ tại 5 bệnh viện lớn với 10 chuyên khoa khác nhau.

- **Định dạng Email**: `doctor1@medischedule.com` đến `doctor20@medischedule.com`
- **Mật khẩu**: `12345678`

**Danh sách mẫu:**
- `doctor1@medischedule.com` - Chuyên khoa: Nội Tổng Quát
- `doctor2@medischedule.com` - Chuyên khoa: Tim Mạch
- `doctor3@medischedule.com` - Chuyên khoa: Thần Kinh
- `doctor5@medischedule.com` - Chuyên khoa: Nhi Khoa
- `doctor6@medischedule.com` - Chuyên khoa: Sản Phụ Khoa

---

### 🔵 Nhóm Bệnh nhân (Patients)
Hệ thống có **10 bệnh nhân mẫu** với lịch sử khám bệnh và giao dịch thực tế.

- **Định dạng Email**: `patient1@gmail.com` đến `patient10@gmail.com`
- **Mật khẩu**: `12345678`

**Tài khoản tiêu biểu:**
- `patient1@gmail.com` (Bệnh nhân An - Đã có phiên tư vấn AI mẫu)
- `patient2@gmail.com` (Bệnh nhân Bình)
- `patient5@gmail.com` (Bệnh nhân Em)

---

## 🏥 Danh sách Cơ sở Y tế (Clinics/Hospitals)
Hệ thống hiện kết nối với các bệnh viện trọng điểm:
1. **Bệnh viện Bạch Mai (Hà Nội)**
2. **Bệnh viện Chợ Rẫy (TP.HCM)**
3. **Bệnh viện Đa khoa Đà Nẵng**
4. **Bệnh viện Trung ương Huế**
5. **Bệnh viện Đa khoa Cần Thơ**

---

## 🛠 Thông tin Kỹ thuật (Backend Logic)

### Trạng thái Dữ liệu (Data States)
- **Lịch hẹn (Appointments)**: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`.
- **Thanh toán (Payments)**: `PENDING`, `SUCCESS`, `FAILED`.
- **Loại khám**: `TrucTiep` (tại bệnh viện) hoặc `Online` (Video Call).

### Cấu trúc Database
- **Database Name**: `database_benhvien`
- **Models**: `NguoiDung`, `VaiTro`, `BacSi`, `BenhNhan`, `Clinic`, `DoctorSchedule`, `Appointment`, `HoSoBenhAn`, `HoaDon`, `ThanhToan`.

---

## 📖 Hướng dẫn Đăng nhập nhanh
1. Truy cập [http://localhost:3050](http://localhost:3050).
2. Chọn **Đăng nhập**.
3. Sử dụng một trong các tài khoản trên (ví dụ: `admin@medischedule.com` / `12345678`).
4. Nếu muốn tạo dữ liệu mới, hãy đăng nhập vai trò **Bệnh nhân** và thực hiện luồng **Tư vấn AI → Đặt lịch**.

---
**MediSchedule - Smart Healthcare Management System**
