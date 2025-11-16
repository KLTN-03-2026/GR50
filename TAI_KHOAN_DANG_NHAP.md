# 🔐 TÀI KHOẢN ĐĂNG NHẬP - MEDISCHEDULE

## ✅ HỆ THỐNG ĐÃ HOẠT ĐỘNG

### 🌐 Truy Cập Ứng Dụng
**Frontend:** https://ui-color-update-1.preview.emergentagent.com

**Backend API:** https://ui-color-update-1.preview.emergentagent.com/api

**API Documentation:** https://ui-color-update-1.preview.emergentagent.com/docs

---

## 👥 TÀI KHOẢN TEST

### 🔴 ADMIN (Quản Trị Viên)
- **Email:** admin@medischedule.com
- **Password:** 12345678
- **Quyền hạn:**
  - Quản lý toàn bộ hệ thống
  - Tạo/xóa/sửa bác sĩ, bệnh nhân, admin
  - Quản lý chuyên khoa
  - Xem thống kê
  - Tạo tài khoản admin khác

---

### 🟡 DEPARTMENT HEAD (Trưởng Khoa)
- **Email:** departmenthead@test.com
- **Password:** 12345678
- **Quyền hạn:**
  - Tạo tài khoản bác sĩ và bệnh nhân
  - Quản lý bác sĩ và bệnh nhân
  - Xem thống kê
  - KHÔNG thể tạo admin hoặc department head khác

---

### 🟢 BÁC SĨ (Doctors)

#### Bác Sĩ 1
- **Email:** doctor1@test.com
- **Password:** 12345678
- **Tên:** Dr. Nguyễn Văn A
- **Chuyên khoa:** Nội khoa

#### Bác Sĩ 2
- **Email:** doctor2@test.com
- **Password:** 12345678
- **Tên:** Dr. Trần Thị B
- **Chuyên khoa:** Ngoại khoa

#### Bác Sĩ 3
- **Email:** doctor3@test.com
- **Password:** 12345678
- **Tên:** Dr. Lê Văn C
- **Chuyên khoa:** Nhi khoa

**Quyền hạn bác sĩ:**
- Xem danh sách lịch hẹn
- Chat với bệnh nhân
- Cập nhật hồ sơ cá nhân
- Xem lịch làm việc

---

### 🔵 BỆNH NHÂN (Patients)

#### Bệnh Nhân 1
- **Email:** patient1@test.com
- **Password:** 12345678
- **Tên:** Nguyễn Văn X

#### Bệnh Nhân 2
- **Email:** patient2@test.com
- **Password:** 12345678
- **Tên:** Trần Thị Y

#### Bệnh Nhân 3
- **Email:** patient3@test.com
- **Password:** 12345678
- **Tên:** Lê Văn Z

**Quyền hạn bệnh nhân:**
- Tìm kiếm bác sĩ
- Đặt lịch khám
- Chat với bác sĩ (có thể gửi hình ảnh)
- Xem lịch sử khám bệnh
- Thanh toán viện phí

---

## 🎯 HƯỚNG DẪN SỬ DỤNG

### 1. Đăng Nhập
1. Truy cập: https://ui-color-update-1.preview.emergentagent.com
2. Nhấn nút **"Đăng nhập"**
3. Nhập email và mật khẩu từ danh sách trên
4. Nhấn **"Đăng nhập"**

### 2. Đăng Ký Tài Khoản Mới
1. Nhấn **"Đăng ký"** trên trang login
2. Chọn vai trò: **Bác sĩ** hoặc **Bệnh nhân**
3. Điền thông tin
4. Nhấn **"Đăng ký"**

⚠️ **Lưu ý:** Tài khoản Admin và Department Head chỉ được tạo bởi Admin hiện tại.

---

## 🔧 THÔNG TIN KỸ THUẬT

### Database: MySQL
- **Host:** localhost
- **Port:** 3306
- **Database:** medischedule
- **User:** root
- **Password:** 190705

### Tables Created:
- ✅ users
- ✅ patients
- ✅ doctors
- ✅ specialties (8 chuyên khoa)
- ✅ appointments
- ✅ chat_messages
- ✅ payments
- ✅ conversations
- ✅ admin_permissions
- ✅ ai_chat_history

---

## 🌟 TÍNH NĂNG CHÍNH

### ✅ Đã Hoạt Động
- ✅ Đăng nhập / Đăng ký
- ✅ Quản lý bác sĩ (Admin, Department Head)
- ✅ Quản lý bệnh nhân (Admin, Department Head)
- ✅ Đặt lịch khám
- ✅ Chat giữa bác sĩ - bệnh nhân (có gửi hình ảnh)
- ✅ Thanh toán viện phí
- ✅ Quản lý chuyên khoa
- ✅ Hệ thống phân quyền
- ✅ Thống kê dữ liệu
- ✅ Đa ngôn ngữ (Tiếng Việt / English)
- ✅ Dark Mode / Light Mode

### 🟡 Tính Năng AI (Cần API Key)
- AI Chat tư vấn sức khỏe
- AI gợi ý bác sĩ phù hợp
- AI tóm tắt cuộc hội thoại

---

## 🎨 CHUYÊN KHOA CÓ SẴN

1. ❤️ **Nội khoa** - Internal Medicine
2. 🔪 **Ngoại khoa** - Surgery
3. 👶 **Nhi khoa** - Pediatrics
4. 🤰 **Sản phụ khoa** - Obstetrics & Gynecology
5. 🦷 **Răng hàm mặt** - Dentistry
6. 🌸 **Da liễu** - Dermatology
7. 👁️ **Mắt** - Ophthalmology
8. 🧠 **Thần kinh** - Neurology

---

## 📞 HỖ TRỢ

### Kiểm Tra Hệ Thống
```bash
# Backend health check
curl https://ui-color-update-1.preview.emergentagent.com/health

# Test login API
curl -X POST https://ui-color-update-1.preview.emergentagent.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"patient1@test.com","password":"12345678"}'
```

### Nếu Gặp Vấn Đề
1. ✅ Kiểm tra đã nhập đúng email và password
2. ✅ Thử refresh trang (F5 hoặc Ctrl+R)
3. ✅ Xóa cache trình duyệt
4. ✅ Thử trình duyệt khác (Chrome, Firefox, Edge)
5. ✅ Kiểm tra kết nối internet

---

## 🎉 BẮT ĐẦU SỬ DỤNG

1. **Truy cập:** https://ui-color-update-1.preview.emergentagent.com
2. **Đăng nhập bằng một trong các tài khoản trên**
3. **Khám phá các tính năng!**

### Test Flow Đầy Đủ:
1. **Đăng nhập Admin** → Tạo thêm bác sĩ/bệnh nhân
2. **Đăng nhập Bệnh nhân** → Tìm bác sĩ → Đặt lịch
3. **Đăng nhập Bác sĩ** → Xem lịch hẹn → Chat với bệnh nhân
4. **Chat** → Gửi tin nhắn, gửi hình ảnh

---

**Chúc bạn sử dụng thành công! 🚀**

*Last Updated: 11/11/2025 - Hệ thống đang chạy MySQL + FastAPI + React*
