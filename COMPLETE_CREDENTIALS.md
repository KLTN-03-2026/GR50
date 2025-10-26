# 🏥 MediSchedule - Thông tin đăng nhập

## 🌐 URL Truy cập
- **Frontend:** https://[your-domain].emergent.run
- **Backend API:** https://[your-domain].emergent.run/api
- **API Docs:** https://[your-domain].emergent.run/api/docs

---

## 👥 Tài khoản Test

### 👨‍⚕️ Admin (Quản trị viên)
```
Email: admin@medischedule.com
Password: 12345678
```
**Quyền hạn:**
- Tạo và quản lý tất cả user (bệnh nhân, bác sĩ, trưởng khoa, admin)
- Duyệt/từ chối bác sĩ
- Xem thống kê toàn hệ thống
- Quản lý thanh toán (PAYMENT)
- Quản lý chuyên khoa

---

### 🏥 Department Head (Trưởng khoa)
```
Email: departmenthead@test.com
Password: 12345678
```
**Quyền hạn:**
- Tạo tài khoản bác sĩ và bệnh nhân
- Quản lý bác sĩ trong chuyên khoa
- Duyệt/từ chối bác sĩ
- Xem thống kê chuyên khoa
- KHÔNG thể tạo admin hoặc trưởng khoa khác

---

### 👨‍⚕️ Doctor (Bác sĩ)
```
Email: doctor1@test.com
Password: 12345678
```
**Quyền hạn:**
- Xem và quản lý lịch hẹn của mình
- XÁC NHẬN hoặc HỦY lịch hẹn
- Cập nhật thông tin cá nhân
- Cập nhật chuyên khoa
- Cập nhật KHUNG GIỜ RẢNH (available schedule)
- Chat với bệnh nhân (tư vấn online)
- Xem thống kê thu nhập

**Bác sĩ khác:**
- doctor2@test.com / 12345678
- doctor3@test.com / 12345678

---

### 👤 Patient (Bệnh nhân)
```
Email: patient1@test.com
Password: 12345678
```
**Quyền hạn:**
- TÌM KIẾM BÁC SĨ theo chuyên khoa
- ĐẶT LỊCH khám trực tiếp
- ĐẶT LỊCH tư vấn online
- XEM LỊCH SỬ đặt lịch
- Chat với bác sĩ (tư vấn online)
- **THANH TOÁN** phí khám (Mock Payment System)
- Xem lịch sử thanh toán

**Bệnh nhân khác:**
- patient2@test.com / 12345678
- patient3@test.com / 12345678

---

## ✅ Checklist các tính năng đã triển khai

### 1️⃣ Bệnh nhân (Patient)
- [x] Đăng ký tài khoản
- [x] Đăng nhập
- [x] Quên mật khẩu
- [x] Tìm kiếm bác sĩ theo chuyên khoa
- [x] Đặt lịch khám trực tiếp
- [x] Đặt lịch tư vấn online
- [x] Xem lịch sử đặt lịch
- [x] **THANH TOÁN phí khám (Mock Payment)**

### 2️⃣ Bác sĩ (Doctor)
- [x] Đăng nhập quản lý tài khoản
- [x] Cập nhật thông tin chuyên khoa
- [x] Cập nhật khung giờ rảnh
- [x] Xác nhận lịch hẹn
- [x] Hủy lịch hẹn
- [x] Chat với bệnh nhân
- [x] Xem thống kê

### 3️⃣ Admin
- [x] Quản lý bác sĩ
- [x] Quản lý bệnh nhân
- [x] Tạo tài khoản (tất cả roles)
- [x] Duyệt/từ chối bác sĩ
- [x] Xem thống kê
- [x] **Quản lý thanh toán (PAYMENT)**

### 4️⃣ Department Head
- [x] Tạo tài khoản bác sĩ và bệnh nhân
- [x] Quản lý bác sĩ
- [x] Quản lý bệnh nhân
- [x] Duyệt/từ chối bác sĩ
- [x] Xem thống kê

---

## 💳 Hướng dẫn sử dụng Mock Payment System

### Bước 1: Đặt lịch khám
1. Đăng nhập với tài khoản bệnh nhân
2. Tìm bác sĩ theo chuyên khoa
3. Chọn bác sĩ và đặt lịch khám
4. Hệ thống tự động tạo payment pending

### Bước 2: Thanh toán
1. Vào menu "Thanh toán" (Payments)
2. Xem danh sách thanh toán chờ xử lý
3. Click "Thanh toán ngay"
4. Chọn phương thức thanh toán:
   - **Thẻ tín dụng/ghi nợ** (mock_card)
   - **Ví điện tử** (mock_wallet)  
   - **Chuyển khoản ngân hàng** (mock_bank)

### Bước 3: Nhập thông tin (Demo)
- Số thẻ: `4111111111111111` (hoặc bất kỳ)
- Tên chủ thẻ: `NGUYEN VAN A` (hoặc bất kỳ)
- Ngày hết hạn: `12/25` (hoặc bất kỳ)
- CVV: `123` (hoặc bất kỳ)

### Bước 4: Hoàn tất
- Click "Thanh toán"
- Hệ thống tự động xử lý (mock)
- Nhận mã giao dịch (TXN######)
- Thanh toán hoàn tất!

**Lưu ý:** Đây là hệ thống thanh toán giả lập. Không có giao dịch thật được thực hiện.

---

## 📊 Thông tin kỹ thuật

### Backend API Endpoints (Payment)
```
POST   /api/payments/create              - Tạo payment cho appointment
POST   /api/payments/{payment_id}/process - Xử lý thanh toán
GET    /api/payments/my                  - Lịch sử thanh toán bệnh nhân
GET    /api/payments/{payment_id}        - Chi tiết thanh toán
GET    /api/admin/payments               - Admin xem tất cả payments
GET    /api/doctor/payments              - Doctor xem payments của mình
```

### Payment Status
- `pending` - Chờ thanh toán
- `processing` - Đang xử lý
- `completed` - Thành công
- `failed` - Thất bại
- `refunded` - Đã hoàn tiền

### Payment Methods
- `mock_card` - Thẻ tín dụng/ghi nợ
- `mock_wallet` - Ví điện tử
- `mock_bank` - Chuyển khoản ngân hàng

---

## 🎯 Tỷ lệ hoàn thành

**13/13 yêu cầu = 100% ✅**

1. ✅ Đăng ký bệnh nhân
2. ✅ Đăng nhập bệnh nhân
3. ✅ Quên mật khẩu
4. ✅ Tìm kiếm bác sĩ theo chuyên khoa
5. ✅ Đặt lịch khám trực tiếp
6. ✅ Tư vấn online
7. ✅ Xem lịch sử đặt lịch
8. ✅ Đăng nhập bác sĩ
9. ✅ Cập nhật thông tin chuyên khoa
10. ✅ Cập nhật khung giờ rảnh
11. ✅ Xác nhận lịch hẹn
12. ✅ Hủy lịch hẹn
13. ✅ **Thanh toán - Admin** ✨ (MỚI)

---

## 🚀 Các tính năng nổi bật

### 🎨 UI/UX
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ Multi-language (Vietnamese/English)
- ✅ Beautiful gradients & animations
- ✅ Tailwind CSS styling

### 🔐 Security
- ✅ JWT Authentication
- ✅ Role-based access control
- ✅ Password hashing (bcrypt)
- ✅ Secure API endpoints

### 💾 Database
- ✅ MongoDB
- ✅ Collections: users, doctors, patients, appointments, chat_messages, payments
- ✅ Indexes for performance

### 🤖 AI Features (Limited by OpenAI quota)
- ⚠️ AI Health Consultation Chatbot
- ⚠️ AI Doctor Recommendation
- ⚠️ Conversation Summarization

---

## 📞 Hỗ trợ

Nếu có bất kỳ vấn đề nào, vui lòng:
1. Kiểm tra logs: `/var/log/supervisor/backend.*.log`
2. Restart services: `sudo supervisorctl restart all`
3. Check status: `sudo supervisorctl status`

---

**Chúc bạn sử dụng MediSchedule thành công! 🎉**
