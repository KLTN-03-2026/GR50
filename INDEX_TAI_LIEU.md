# 📚 TÀI LIỆU HƯỚNG DẪN - MEDISCHEDULE

## 🎯 CHỌN HƯỚNG DẪN PHÙ HỢP

### 🏠 CHẠY 100% LOCAL TRÊN WINDOWS (KHUYÊN DÙNG)
**File:** `HUONG_DAN_100_PHAN_TRAM_LOCAL.md` ⭐⭐⭐

**Dành cho:** Ai muốn chạy backend + frontend hoàn toàn trên máy Windows

**Nội dung:**
- ✅ Hướng dẫn chi tiết từ A-Z
- ✅ Cấu hình MySQL local
- ✅ Backend chạy tại: http://localhost:8001
- ✅ Frontend chạy tại: http://localhost:3000
- ✅ Troubleshooting đầy đủ
- ✅ File .bat tự động hóa

**Bắt đầu:** Đọc file `HUONG_DAN_100_PHAN_TRAM_LOCAL.md`

---

### ⚡ QUICK START (3 BƯỚC)
**File:** `QUICK_START_WINDOWS.md` ⚡

**Dành cho:** Ai muốn bắt đầu nhanh nhất có thể

**Nội dung:**
- 3 bước đơn giản
- Dùng file .bat tự động
- Không cần hiểu chi tiết

**Bắt đầu:** Đọc file `QUICK_START_WINDOWS.md`

---

### 📖 README ĐẦY ĐỦ
**File:** `README_WINDOWS.md` 📖

**Dành cho:** Ai muốn overview tổng quan

**Nội dung:**
- Cấu trúc project
- Lệnh quản lý
- Troubleshooting cơ bản
- Thông tin tài khoản test

**Bắt đầu:** Đọc file `README_WINDOWS.md`

---

### 📋 CHECKLIST
**File:** `CHECKLIST_CAI_DAT.md` ✅

**Dành cho:** Ai muốn đảm bảo không bỏ sót bước nào

**Nội dung:**
- Danh sách tick từng bước
- Đảm bảo đầy đủ
- Dễ theo dõi tiến độ

**Bắt đầu:** Đọc file `CHECKLIST_CAI_DAT.md`

---

### 🌐 CHẠY TRÊN CONTAINER
**File:** `HUONG_DAN_CHAY_LOCAL.md`

**Dành cho:** Ai muốn test nhanh trên container (không cần cài đặt)

**Nội dung:**
- Ứng dụng đã chạy sẵn
- Truy cập ngay
- Không cần setup

**Địa chỉ:**
- Frontend: https://auth-troubleshoot-20.preview.emergentagent.com
- Backend: https://auth-troubleshoot-20.preview.emergentagent.com/api

---

## 🎬 BẮT ĐẦU TỪ ĐÂU?

### Nếu bạn MỚI bắt đầu:
1. Đọc `QUICK_START_WINDOWS.md` trước
2. Làm theo 3 bước
3. Nếu gặp lỗi, đọc `HUONG_DAN_100_PHAN_TRAM_LOCAL.md`

### Nếu bạn là DEVELOPER:
1. Đọc `README_WINDOWS.md` để hiểu tổng quan
2. Đọc `HUONG_DAN_100_PHAN_TRAM_LOCAL.md` cho chi tiết
3. Dùng `CHECKLIST_CAI_DAT.md` để đảm bảo không bỏ sót

### Nếu bạn chỉ muốn TEST NHANH:
1. Truy cập: https://auth-troubleshoot-20.preview.emergentagent.com
2. Login: `patient1@test.com` / `12345678`
3. Xong!

---

## 🔧 FILE .BAT TỰ ĐỘNG HÓA

### `SETUP_DATABASE.bat`
**Chức năng:** Cài đặt lần đầu (chỉ chạy 1 lần)
- Tạo virtual environment
- Cài đặt dependencies
- Tạo database tables
- Tạo admin + test accounts

**Khi nào dùng:**
- Lần đầu cài đặt
- Khi muốn reset database
- Khi lỗi database

### `START_BACKEND.bat`
**Chức năng:** Khởi động Backend server
- Kích hoạt virtual environment
- Kiểm tra MySQL connection
- Start server tại port 8001

**Khi nào dùng:**
- Mỗi lần muốn chạy backend
- Backend chạy tại: http://localhost:8001

### `START_FRONTEND.bat`
**Chức năng:** Khởi động Frontend
- Kiểm tra dependencies
- Start React app tại port 3000

**Khi nào dùng:**
- Mỗi lần muốn chạy frontend
- Frontend chạy tại: http://localhost:3000

---

## 🔐 TÀI KHOẢN TEST

**TẤT CẢ PASSWORD:** `12345678`

| Email | Role | Mô tả |
|-------|------|-------|
| admin@medischedule.com | Admin | Quản trị viên |
| departmenthead@test.com | Dept Head | Trưởng khoa |
| doctor1@test.com | Doctor | Bác sĩ Tim mạch |
| doctor2@test.com | Doctor | Bác sĩ Nội khoa |
| doctor3@test.com | Doctor | Bác sĩ Ngoại khoa |
| patient1@test.com | Patient | Bệnh nhân |
| patient2@test.com | Patient | Bệnh nhân |
| patient3@test.com | Patient | Bệnh nhân |

---

## 🎯 CHỨC NĂNG CHÍNH

### 🏥 Admin
- Quản lý tất cả users
- Quản lý specialties
- Xem thống kê
- Tạo admin khác
- Approve/reject doctors

### 👨‍⚕️ Department Head (Trưởng khoa)
- Tạo doctor/patient accounts
- Quản lý doctors
- Quản lý patients
- Xem thống kê bộ phận

### 👨‍⚕️ Doctor
- Xem lịch hẹn
- Chat với patients
- Cập nhật profile
- Xem lịch làm việc

### 🏥 Patient
- Tìm bác sĩ
- Đặt lịch hẹn
- Chat với doctors
- Xem lịch sử khám
- Thanh toán

---

## 🚀 WORKFLOW NHANH

### Lần đầu tiên:
1. Cài Python, Node.js, MySQL
2. Tạo database trong MySQL
3. Click `SETUP_DATABASE.bat`
4. Xong!

### Mỗi lần sử dụng:
1. Click `START_BACKEND.bat`
2. Click `START_FRONTEND.bat`
3. Mở http://localhost:3000
4. Login và sử dụng

### Khi gặp lỗi:
1. Đọc phần Troubleshooting trong `HUONG_DAN_100_PHAN_TRAM_LOCAL.md`
2. Kiểm tra MySQL có chạy không
3. Kiểm tra password trong `.env`
4. Restart backend/frontend

---

## 📊 CẤU TRÚC DATABASE

**9 bảng chính:**
- `users` - Tất cả người dùng
- `patients` - Profile bệnh nhân
- `doctors` - Profile bác sĩ
- `specialties` - Chuyên khoa
- `appointments` - Lịch hẹn
- `payments` - Thanh toán
- `chat_messages` - Tin nhắn chat
- `ai_chat_history` - Lịch sử AI chat
- `admin_permissions` - Quyền admin

---

## 🐛 LỖI THƯỜNG GẶP

### 1. MySQL không kết nối
→ Kiểm tra MySQL đang chạy trong Services

### 2. Port đã được sử dụng
→ Kill process hoặc dùng port khác

### 3. Frontend không gọi được Backend
→ Kiểm tra `.env` có đúng `http://localhost:8001`

### 4. Bcrypt warning
→ Bỏ qua, không ảnh hưởng

### 5. Database tables không tồn tại
→ Chạy lại `SETUP_DATABASE.bat`

**Chi tiết:** Xem phần Troubleshooting trong `HUONG_DAN_100_PHAN_TRAM_LOCAL.md`

---

## 💡 TIPS

1. **Giữ 2 terminal luôn mở** (backend + frontend)
2. **MySQL tự chạy** khi Windows khởi động
3. **Code tự reload** khi sửa (không cần restart)
4. **Bookmark** http://localhost:3000 để truy cập nhanh
5. **F12** trong browser để xem console logs

---

## 📞 HỖ TRỢ

**Thứ tự xem tài liệu:**
1. `QUICK_START_WINDOWS.md` - Bắt đầu nhanh
2. `README_WINDOWS.md` - Overview
3. `HUONG_DAN_100_PHAN_TRAM_LOCAL.md` - Chi tiết đầy đủ
4. `CHECKLIST_CAI_DAT.md` - Checklist từng bước

**Thông tin cần cung cấp khi báo lỗi:**
- Thông báo lỗi đầy đủ
- `python --version`
- `node --version`
- `mysql --version`
- Screenshot (nếu có)

---

## 🎉 KẾT LUẬN

Tất cả tài liệu đã được chuẩn bị để bạn có thể:
- ✅ Chạy ứng dụng 100% local trên Windows
- ✅ Tự động hóa với file .bat
- ✅ Troubleshooting đầy đủ
- ✅ Test với 8 tài khoản sẵn có

**Chúc bạn thành công! 🚀**
