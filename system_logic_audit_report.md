# Báo cáo Kiểm tra Toàn diện Logic Hệ thống (System Logic Audit Report)

Dưới đây là báo cáo phân tích và kiểm tra toàn diện logic của hệ thống. Quá trình kiểm tra đã được thực hiện bằng cách rà soát mã nguồn (code review) ở các thành phần cốt lõi: Auth, Appointment, Payment, Medical Record, AI Chat.

Quá trình kiểm tra đã phát hiện ra **các lỗ hổng bảo mật nghiêm trọng (Critical)** và **các lỗi logic hệ thống (System Bugs)** cần được khắc phục ngay lập tức để đảm bảo an toàn và tính toàn vẹn dữ liệu.

---

## 1. Lỗ hổng Bảo mật Nghiêm trọng (Critical Security Vulnerabilities)

### 1.1. Lỗ hổng Bypass quy trình Quên Mật Khẩu (Password Reset Bypass)
- **Vị trí**: `backend/controllers/authController.js` -> `resetPassword`
- **Mô tả**: Hàm `resetPassword` chỉ yêu cầu `resetId` và `newPassword` để thay đổi mật khẩu của một user. Hàm này hoàn toàn KHÔNG kiểm tra xem mã OTP đã thực sự được nhập đúng hay chưa. Hơn thế nữa, `resetId` trong bảng `password_resets` là một số nguyên tự tăng (auto-increment). 
- **Cách tấn công**: Kẻ tấn công chỉ cần gọi API `forgotPassword` bằng email của Admin để tạo ra 1 record. Sau đó, kẻ tấn công gọi thẳng API `resetPassword` và truyền vào `resetId` (có thể đoán được vì là số tự tăng) cùng mật khẩu mới. Tài khoản Admin sẽ bị chiếm đoạt mà không cần biết mã OTP.
- **Cách khắc phục**: 
  - Thêm cờ `is_verified: { type: DataTypes.BOOLEAN, defaultValue: false }` vào model `PasswordReset`.
  - Trong hàm `verifyOtp`, khi OTP đúng, set `is_verified = true` và lưu lại.
  - Trong hàm `resetPassword`, bắt buộc phải kiểm tra `is_verified === true` trước khi cho phép đổi mật khẩu. Đổi xong mới set `is_used = true`.

### 1.2. Lỗ hổng IDOR trong Thanh toán (Insecure Direct Object Reference)
- **Vị trí**: `backend/controllers/paymentController.js` -> `getPaymentById` và `processPayment`
- **Mô tả**: Khi người dùng gọi API để lấy thông tin thanh toán hoặc xử lý thanh toán thông qua tham số `:id` (ví dụ: `GET /api/payments/5`), hệ thống chỉ thực hiện `ThanhToan.findByPk(id)` mà KHÔNG kiểm tra xem mã thanh toán này có thuộc về bệnh nhân đang đăng nhập (`req.user.id`) hay không.
- **Cách tấn công**: Một người dùng bất kỳ có thể xem hoá đơn của người khác hoặc tự ý thay đổi trạng thái thanh toán của người khác bằng cách thay đổi ID trên URL.
- **Cách khắc phục**: Sau khi tìm thấy `payment`, cần phải truy xuất `DatLich` liên quan để đối chiếu `Id_BenhNhan` của `DatLich` với `req.user.id`. Nếu không khớp, trả về lỗi `403 Forbidden`.

---

## 2. Các lỗi Logic Hệ thống và Toàn vẹn Dữ liệu (System Logic & Data Integrity Issues)

### 2.1. Thiếu Database Transaction khi thực hiện nhiều thao tác ghi
- **Vị trí**: `appointmentController.js` (các hàm `create`, `completeExam`), `paymentController.js`.
- **Mô tả**: Khi tạo một lịch hẹn mới, hệ thống tạo `DatLich` rồi ngay lập tức tạo tiếp `ThanhToan` ở trạng thái UNPAID. Tương tự, khi hoàn tất khám (`completeExam`), hệ thống cập nhật `DatLich`, tạo `HoaDon`, rồi tạo hoặc cập nhật `ThanhToan`. Toàn bộ các thao tác này không được đặt trong một Transaction (giao dịch) của Sequelize.
- **Hậu quả**: Nếu thao tác tạo `ThanhToan` bị lỗi (ví dụ rớt mạng DB hoặc lỗi cấu trúc), thì `DatLich` vẫn được lưu vào DB, tạo ra dữ liệu rác (mồ côi) và làm sai lệch trạng thái hệ thống.
- **Cách khắc phục**: Wrap các đoạn code này vào trong `sequelize.transaction(async (t) => { ... })` và truyền `{ transaction: t }` vào các hàm `create`, `update`.

### 2.2. Lỗi Race Condition (Xung đột đồng thời) khi đặt lịch
- **Vị trí**: `appointmentController.js` -> `create`
- **Mô tả**: Đoạn code kiểm tra số lượng: 
  ```javascript
  if (lichKham.SoLuongDaDat >= lichKham.SoLuongToiDa) return error;
  lichKham.SoLuongDaDat += 1;
  await lichKham.save();
  ```
- **Hậu quả**: Đây là lỗi logic cổ điển (Race condition). Nếu 2 bệnh nhân cùng nhấn nút đặt lịch ở cùng 1 phần nghìn giây cuối cùng trước khi lịch đầy, cả 2 luồng đều sẽ đọc được `SoLuongDaDat` chưa vượt quá giới hạn và cùng cộng 1, dẫn đến số lượng bệnh nhân thực tế vượt quá `SoLuongToiDa`.
- **Cách khắc phục**: Dùng tính năng atomic increment của database: `await lichKham.increment('SoLuongDaDat', { by: 1 })` hoặc sử dụng row-level locking (`lock: true` trong Sequelize).

### 2.3. Rác Dữ Liệu Thanh Toán khi Huỷ Lịch
- **Vị trí**: `appointmentController.js` -> `cancelAppointment`
- **Mô tả**: Khi bệnh nhân tự huỷ lịch khám (trạng thái cập nhật thành `CANCELLED`), hệ thống cập nhật lại trạng thái lịch nhưng lại "bỏ quên" bản ghi `ThanhToan` ban đầu đã được tạo.
- **Hậu quả**: Bản ghi `ThanhToan` vẫn giữ trạng thái `UNPAID` vĩnh viễn trong database, gây ra sai lệch trong các báo cáo doanh thu treo.
- **Cách khắc phục**: Bổ sung logic tìm `ThanhToan` của `Id_DatLich` đó và chuyển trạng thái thành `CANCELLED` nếu lịch hẹn bị huỷ.

---

## 3. Các điểm tốt cần ghi nhận
- Middleware phân quyền `roleMiddleware.js` được áp dụng khá đầy đủ trên các route quan trọng (`adminRoutes.js`, `medicalRecordRoutes.js`, `aiRoutes.js`), chống lại việc bệnh nhân gọi API của bác sĩ/admin.
- Logic kiểm tra quyền sở hữu (Ownership) ở `medicalRecordController.js` hoạt động tốt (đã kiểm tra `record.Id_BenhNhan === patient.Id_BenhNhan`).

---
**Khuyến nghị**: Đội ngũ phát triển cần ưu tiên sửa ngay **Mục 1.1 và 1.2** vì đây là lỗi bảo mật có thể bị khai thác trực tiếp. Tiếp đó áp dụng Database Transactions cho các luồng thanh toán và đặt lịch ở **Mục 2.1**.
