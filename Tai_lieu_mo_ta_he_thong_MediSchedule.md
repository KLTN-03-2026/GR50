# Tài liệu mô tả chi tiết hệ thống hiện có

## 1. Mục đích tài liệu

Tài liệu này dùng để mô tả đầy đủ, có hệ thống và dễ bàn giao về hệ thống hiện có. Nội dung có thể phục vụ cho các mục đích sau:

* Làm tài liệu phân tích hiện trạng hệ thống.
* Bàn giao cho đội phát triển, vận hành, kiểm thử hoặc khách hàng.
* Làm cơ sở nâng cấp, tái cấu trúc, tích hợp hoặc chuyển giao hệ thống.
* Chuẩn hóa hiểu biết giữa các bên liên quan.
* Ghi nhận kiến trúc, chức năng, dữ liệu, quy trình, tích hợp, rủi ro và các điểm cần cải tiến.

## 2. Thông tin tổng quan hệ thống

### 2.1. Tên hệ thống

Tên hệ thống: **MediSchedule - Hệ thống Quản lý Đặt lịch Khám bệnh & Tư vấn AI Toàn diện**

Tên viết tắt nếu có: **MediSched**

Phiên bản hiện tại: **1.0.0 (Production-Ready)**

Đơn vị sở hữu/quản lý: **KLTN-GR50**

Đơn vị phát triển/vận hành: **MediSchedule Team**

### 2.2. Mô tả ngắn gọn

Hệ thống **MediSchedule** là một nền tảng quản lý y tế thông minh, tích hợp trí tuệ nhân tạo (AI Triage) để tối ưu hóa quy trình kết nối giữa bệnh nhân và bác sĩ. Hệ thống hỗ trợ người dùng trong việc **đặt lịch khám, khám trực tuyến (Telemedicine), tư vấn sức khỏe qua AI, quản lý bệnh án điện tử và thanh toán**, đồng thời cung cấp các chức năng quản lý nhân sự, tra cứu, xử lý dữ liệu, báo cáo doanh thu và giám sát vận hành.

Hệ thống hiện đang được sử dụng bởi **Bệnh nhân, Bác sĩ, Nhân viên tiếp tân và Quản trị viên** với phạm vi triển khai trên môi trường **Web (React/Node.js)**.

### 2.3. Bối cảnh hình thành

Hệ thống được xây dựng nhằm giải quyết các vấn đề sau:

* Tối ưu hóa quy trình kết nối giữa bệnh nhân và bác sĩ, giảm thời gian chờ đợi.
* Cần chuẩn hóa quy trình xử lý nghiệp vụ đặt lịch và khám bệnh (cả offline và online).
* Ứng dụng AI để phân luồng (Triage) bệnh nhân, đưa ra chẩn đoán sơ bộ giúp giảm tải cho bác sĩ.
* Dữ liệu y tế (bệnh án điện tử) cần được quản lý tập trung và bảo mật.
* Tích hợp thanh toán trực tuyến và khám bệnh từ xa (Video Call) để đáp ứng nhu cầu y tế hiện đại.
* Cần có công cụ giám sát, thống kê doanh thu và quản lý hiệu suất phòng khám hiệu quả hơn.

### 2.4. Phạm vi hệ thống

Hệ thống hiện bao gồm các phạm vi chính:

* Quản lý người dùng, phân quyền linh hoạt theo RBAC.
* Tìm kiếm bác sĩ, cơ sở y tế và đặt lịch khám (Online/Offline).
* Tư vấn sức khỏe tự động qua AI (Gemini Flash).
* Khám bệnh từ xa qua Video Call (tích hợp Jitsi SDK).
* Quản lý hồ sơ bệnh án điện tử (E-Health Record), đơn thuốc, xét nghiệm.
* Quản lý lịch làm việc của bác sĩ.
* Thanh toán trực tuyến và hỗ trợ thu ngân tại quầy.
* Hỗ trợ giao tiếp nội bộ và với bệnh nhân (Chat/Ticket hỗ trợ).
* Báo cáo, thống kê doanh thu và hiệu suất hoạt động.

Ngoài phạm vi:

* Quản lý kho thuốc chi tiết (Inventory Management).
* Quản lý thiết bị y tế chuyên sâu tại bệnh viện.

## 3. Mục tiêu và vai trò của hệ thống

### 3.1. Mục tiêu nghiệp vụ

Hệ thống hướng đến các mục tiêu nghiệp vụ sau:

* Số hóa quy trình xử lý nghiệp vụ đặt lịch và khám chữa bệnh.
* Tự động hóa phân luồng bệnh nhân thông qua AI, giảm tải cho lễ tân.
* Tăng tốc độ xử lý công việc và giảm sai sót do thao tác thủ công.
* Cung cấp trải nghiệm chăm sóc sức khỏe liền mạch từ đặt lịch đến thanh toán và tái khám.
* Cung cấp dữ liệu phục vụ quản lý, điều hành doanh thu, đánh giá hiệu suất nhân sự.

### 3.2. Mục tiêu kỹ thuật

Về mặt kỹ thuật, hệ thống cần đảm bảo:

* Hoạt động ổn định với kiến trúc Frontend React 18 và Backend Node.js.
* Tích hợp mượt mà với các dịch vụ bên thứ 3: AI (Gemini), Video Call (Jitsi).
* Có cơ chế bảo mật, xác thực (JWT) và phân quyền chặt chẽ (RBAC).
* Thiết kế cơ sở dữ liệu (MySQL 8.0) chuẩn hóa, có khả năng mở rộng.

### 3.3. Vai trò trong tổng thể tổ chức

Hệ thống đóng vai trò là cốt lõi số hóa của phòng khám/bệnh viện: Nơi tương tác chính của bệnh nhân, công cụ làm việc hằng ngày của y bác sĩ và nhân viên, và là trung tâm kiểm soát của ban quản trị.

## 4. Đối tượng sử dụng hệ thống

### 4.1. Nhóm người dùng chính

| Nhóm người dùng | Mô tả | Quyền hạn chính |
| --- | --- | --- |
| **Quản trị viên (Admin)** | Người quản trị hệ thống, nhân sự và báo cáo tài chính | Toàn quyền, quản lý bác sĩ, bệnh nhân, doanh thu, cài đặt hệ thống |
| **Nhân viên (Staff)** | Điều phối vận hành, tiếp nhận tại quầy và hỗ trợ kỹ thuật | Quản lý lịch khám, hỗ trợ đặt lịch offline, hỗ trợ thanh toán, theo dõi hàng chờ AI |
| **Bác sĩ (Doctor)** | Chuyên gia y tế thực hiện khám chữa bệnh | Quản lý lịch làm việc, khám online, cập nhật hồ sơ bệnh án, kê đơn thuốc |
| **Bệnh nhân (Patient)** | Người sử dụng dịch vụ y tế | Đặt lịch, chat AI, khám online, xem bệnh án, thanh toán |
| **Khách (Guest)** | Người dùng chưa đăng nhập | Xem thông tin bác sĩ, chuyên khoa, dịch vụ, đặt lịch nhanh |

### 4.2. Vai trò và phân quyền (RBAC)

Hệ thống sử dụng cơ chế **Role-Based Access Control (RBAC)** thông qua bảng trung gian `NguoiDung_VaiTro`. Một người dùng có thể có nhiều vai trò (Ví dụ: Bác sĩ kiêm Trưởng khoa).

## 5. Chức năng hệ thống

### 5.1. Nhóm chức năng đăng nhập và xác thực
- **Đăng nhập/Đăng ký**: Hỗ trợ đăng nhập qua email/mật khẩu, mã hóa bcrypt, trả về JWT Token.
- **Khôi phục mật khẩu**: Chức năng quên mật khẩu qua hệ thống `PasswordReset`.

### 5.2. Nhóm chức năng quản lý người dùng
- **Admin**: Thêm mới, xét duyệt hồ sơ bác sĩ, khóa tài khoản, quản lý tài khoản bệnh nhân và nhân viên.
- **Cá nhân hóa**: Đổi mật khẩu, cập nhật thông tin cá nhân (nhóm máu, tiền sử bệnh đối với bệnh nhân).

### 5.3. Nhóm chức năng quản lý dữ liệu nghiệp vụ
- **Bác sĩ & Chuyên khoa**: Tìm kiếm bác sĩ theo chuyên khoa, đánh giá, kinh nghiệm.
- **Hồ sơ bệnh án**: Lưu trữ quá trình khám, toa thuốc, chỉ định cận lâm sàng (`HoSoBenhAn`, `DonThuoc`).

### 5.4. Nhóm chức năng xử lý quy trình nghiệp vụ (Đặt lịch & Khám)
- **Slot Management**: Lịch hẹn (`LichKham`) chia theo khung giờ.
- **Luồng đặt lịch**: Chọn bác sĩ/giờ → Đặt lịch (`DatLich`) → Trạng thái: `CHO_XAC_NHAN` → `DA_XAC_NHAN` → `DA_HOAN_THANH` / `VANG_MAT`.
- **Khám Online**: Tích hợp Jitsi SDK gọi Video trực tiếp đúng giờ hẹn.
- **Chẩn đoán AI (AI Triage)**: Bệnh nhân chat với AI khai báo triệu chứng, AI gợi ý chuyên khoa/bác sĩ. Bác sĩ/Staff có thể xem lại tóm tắt này.

### 5.5. Nhóm chức năng Thanh toán
- **Thanh toán trực tuyến**: Cổng thanh toán (VNPay/Momo).
- **Thanh toán tại quầy**: Staff hỗ trợ thu tiền mặt, cập nhật trạng thái hóa đơn.

### 5.6. Nhóm chức năng báo cáo và thống kê
- **Dashboard Admin**: Thống kê doanh thu, bệnh nhân, hoạt động hệ thống.
- **Báo cáo chuyên sâu**: Biểu đồ tăng trưởng, xuất báo cáo (Excel/PDF).

## 6. Quy trình nghiệp vụ tổng quát

### 6.1. Quy trình xử lý cơ bản (Luồng Khám bệnh)
1. **Tìm kiếm & AI Tư vấn**: Bệnh nhân tìm bác sĩ hoặc dùng AI Triage để được gợi ý.
2. **Đặt lịch**: Bệnh nhân chọn slot khám (Online/Offline) và xác nhận.
3. **Tiếp nhận**: Hệ thống ghi nhận trạng thái chờ xác nhận. Staff/Hệ thống tự động xác nhận.
4. **Khám bệnh**:
   - *Online*: Gọi Video qua Jitsi.
   - *Offline*: Đến cơ sở y tế gặp trực tiếp.
5. **Hồ sơ & Kê đơn**: Bác sĩ cập nhật hồ sơ bệnh án, kê toa.
6. **Thanh toán**: Bệnh nhân thanh toán phí khám/thuốc.
7. **Đánh giá**: Bệnh nhân để lại nhận xét cho bác sĩ.

### Luồng trạng thái lịch hẹn:
```text
Chờ xác nhận → Đã xác nhận → Đang khám → Đã hoàn thành (hoặc Hủy/Vắng mặt)
```

## 7. Kiến trúc hệ thống

### 7.1. Sơ đồ kiến trúc logic
```text
Người dùng (Guest/Patient/Doctor/Staff/Admin)
   ↓
Frontend (React 18 / Vite / Tailwind CSS)
   ↓
Backend API (Node.js / Express)
   ↓
Business Logic (Sequelize ORM / Controllers)
   ↓
Database (MySQL 8.0) + External APIs (Gemini AI, Jitsi)
```

### 7.2. Thành phần frontend
* **Công nghệ**: React 18, Vite.
* **UI/UX**: Tailwind CSS, Shadcn UI, Framer Motion.
* **Kiến trúc**: Giao diện phân chia theo Role (Public, Patient, Doctor, Staff, Admin).

### 7.3. Thành phần backend
* **Ngôn ngữ/Framework**: Node.js, Express.
* **ORM**: Sequelize.
* **Giao tiếp thời gian thực**: Socket.io (cho Chat, thông báo trạng thái AI/Video).

### 7.4. Thành phần cơ sở dữ liệu
* **RDBMS**: MySQL 8.0.
* **Đặc điểm**: Hơn 30 bảng quan hệ chặt chẽ. Có script import dữ liệu mẫu.

## 8. Mô hình dữ liệu

### 8.1. Các nhóm dữ liệu chính
1. **Người dùng & Phân quyền**: `NguoiDung`, `VaiTro`, `NguoiDung_VaiTro`.
2. **Y tế & Lâm sàng**: `BenhNhan`, `BacSi`, `ChuyenKhoa`, `PhongKham`.
3. **Đặt lịch & Bệnh án**: `LichKham`, `DatLich`, `HoSoBenhAn`, `DanhGia`.
4. **Thanh toán**: `DonThuoc`, `ChiTietDonThuoc`, `HoaDon`, `ThanhToan`.
5. **AI & Giao tiếp**: `AITuVanPhien`, `Conversation`, `Message`, `SupportCase`.

### 8.2. Nguyên tắc quản lý dữ liệu
- Liên kết khóa ngoại chặt chẽ, sử dụng Id tự tăng hoặc UUID tùy bảng.
- Thông tin bệnh án không thể bị sửa đổi trái phép (Medical Privacy).

## 9. Tích hợp hệ thống

| Hệ thống tích hợp | Mục đích tích hợp | Giao thức |
| --- | --- | --- |
| **Gemini AI** | Tư vấn sức khỏe, chẩn đoán sơ bộ | REST API |
| **Jitsi SDK** | Khám trực tuyến Video Call | WebRTC |
| **VNPay/Momo** | Thanh toán trực tuyến | API/Webhook |

## 10. Bảo mật hệ thống
- **Xác thực**: JSON Web Tokens (JWT).
- **Mã hóa**: Mã hóa mật khẩu với `bcrypt`.
- **Phân quyền**: RBAC bảo vệ từng route và endpoint API.
- **Bảo mật dữ liệu y tế**: Tuân thủ nguyên tắc quyền riêng tư y khoa, bảo mật phiên AI Chat.

## 11. Hạ tầng triển khai
- **Môi trường Dev/Local**: Chạy qua scripts (`run_local.bat`).
- **Môi trường Production (Dự kiến)**:
  - Frontend: Vercel / Netlify.
  - Backend: VPS (Ubuntu) / Heroku / AWS EC2.
  - Database: AWS RDS / PlanetScale / CSDL MySQL Managed.

## 12. Vận hành hệ thống
- Hệ thống đi kèm các script tiện ích: `run_local.bat` (chạy cả FE/BE), `import_db.bat` (khởi tạo database mẫu).
- Yêu cầu Node.js >= 18.x và MySQL Server >= 8.0.

## 13. Danh mục màn hình hệ thống

| STT | Màn hình | Mục đích | Nhóm người dùng |
| --- | --- | --- | --- |
| 1 | Landing Page | Tìm kiếm, giới thiệu dịch vụ | Guest, All |
| 2 | Patient Dashboard | Quản lý lịch khám, bệnh án | Bệnh nhân |
| 3 | AI Chat | Tư vấn Triage | Bệnh nhân |
| 4 | Doctor Dashboard | Lịch làm việc, danh sách bệnh nhân | Bác sĩ |
| 5 | Consultation Room | Khám Video, kê đơn | Bác sĩ, Bệnh nhân |
| 6 | Staff Dashboard | Điều phối lịch, thu ngân, hàng chờ AI | Tiếp tân, Vận hành |
| 7 | Admin Dashboard | Thống kê doanh thu, quản lý user | Quản trị viên |

## 14. Kết luận
Hệ thống **MediSchedule** là một giải pháp hoàn chỉnh cho phòng khám/bệnh viện hiện đại, kết hợp hiệu quả giữa quy trình khám bệnh truyền thống và công nghệ tiên tiến (AI, Telemedicine). Tài liệu này cung cấp bức tranh toàn cảnh về kiến trúc, chức năng và quy trình hoạt động, là cơ sở vững chắc cho việc tiếp nhận, bảo trì và phát triển tính năng trong tương lai.
