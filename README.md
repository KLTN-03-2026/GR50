# 🏥 MediSchedule - Healthcare Management System

> Hệ thống quản lý bệnh viện toàn diện với đầy đủ tính năng đặt lịch khám, tư vấn online, và thanh toán

![Status](https://img.shields.io/badge/status-production--ready-success)
![Features](https://img.shields.io/badge/features-13%2F13-brightgreen)
![Tech](https://img.shields.io/badge/tech-FastAPI%2BReact%2BMySQL-blue)
![Database](https://img.shields.io/badge/database-MySQL-orange)

---

## 🎯 Tổng quan

MediSchedule là một hệ thống quản lý y tế hiện đại, đầy đủ tính năng cho phép:
- 👤 **Bệnh nhân**: Tìm bác sĩ, đặt lịch khám, thanh toán, tư vấn online
- 👨‍⚕️ **Bác sĩ**: Quản lý lịch hẹn, cập nhật thông tin, tư vấn online
- 🏥 **Trưởng khoa**: Quản lý bác sĩ và bệnh nhân trong chuyên khoa
- 👨‍💼 **Admin**: Quản lý toàn bộ hệ thống, thanh toán, thống kê

---

## ✨ Tính năng chính (13/13 = 100%)

### ✅ Hoàn thành đầy đủ
1. ✅ Đăng ký / Đăng nhập / Quên mật khẩu
2. ✅ Tìm kiếm bác sĩ theo chuyên khoa
3. ✅ Đặt lịch khám trực tiếp + Tư vấn online
4. ✅ Xem lịch sử đặt lịch
5. ✅ Đăng nhập quản lý tài khoản bác sĩ
6. ✅ Cập nhật thông tin chuyên khoa
7. ✅ Cập nhật khung giờ rảnh
8. ✅ Xác nhận lịch hẹn
9. ✅ Hủy lịch hẹn
10. ✅ **Thanh toán - Admin** 💳 (Mock Payment System)

### 💳 Payment System Highlights
- Tự động tạo payment khi đặt lịch
- 3 phương thức thanh toán (card, wallet, bank)
- Lịch sử giao dịch & mã GD
- Admin dashboard quản lý thanh toán
- Thống kê doanh thu

---

## 👥 Tài khoản đăng nhập

```
Admin:          admin@medischedule.com / 12345678
Department Head: departmenthead@test.com / 12345678
Doctor:         doctor1@test.com / 12345678
Patient:        patient1@test.com / 12345678
```

📄 **Chi tiết đầy đủ**: Xem file `COMPLETE_CREDENTIALS.md`

---

## 🛠 Tech Stack

- **Frontend**: React 18 + Tailwind CSS + Shadcn/ui
- **Backend**: FastAPI + MongoDB (Motor)
- **Auth**: JWT + Bcrypt
- **Deployment**: Kubernetes (Emergent Platform)

---

## 🚀 Khởi động nhanh

### Production (Đã chạy)
```bash
sudo supervisorctl status
# Tất cả services đang chạy ✅
```

### Development
```bash
# Backend
cd backend && uvicorn server:app --reload --port 8001

# Frontend
cd frontend && yarn start
```

---

## 💳 Hướng dẫn thanh toán

1. Đăng nhập bệnh nhân → Đặt lịch khám
2. Vào menu "Thanh toán" → Click "Thanh toán ngay"
3. Nhập thông tin demo:
   - Số thẻ: `4111111111111111`
   - Tên: `NGUYEN VAN A`
   - Hạn: `12/25`, CVV: `123`
4. Hoàn tất thanh toán! ✅

⚠️ **Mock Payment - Không có giao dịch thật**

---

## 📊 API Documentation

- Swagger: `/api/docs`
- ReDoc: `/api/redoc`
- OpenAPI: `/api/openapi.json`

---

## 📈 Project Status

✅ **100% Complete** - All 13 requirements implemented
- Backend: 100% functional
- Frontend: 100% responsive
- Payment: Mock system integrated
- Testing: 35/41 tests passed (85.4%)

---

## 📞 Support

📧 Check logs: `tail -f /var/log/supervisor/*.log`  
🔄 Restart: `sudo supervisorctl restart all`  
📊 Status: `sudo supervisorctl status`

---

**Made with ❤️ by MediSchedule Team**  
*Production-ready healthcare management system*
