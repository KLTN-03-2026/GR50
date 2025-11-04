# 🚀 BẮT ĐẦU TẠI ĐÂY - CHẠY LOCAL VỚI MySQL

## ✅ ỨNG DỤNG CHỈ DÙNG MySQL (ĐÃ LOẠI BỎ MongoDB)

---

## 📖 CHỌN HƯỚNG DẪN PHÙ HỢP

### 🎯 Cho người mới bắt đầu (KHUYÊN DÙNG)
👉 **[README_SIMPLE_MYSQL.md](./README_SIMPLE_MYSQL.md)**
- Hướng dẫn 3 bước đơn giản
- Dễ hiểu, dễ làm theo
- Có scripts tự động

### 📚 Cho người muốn hiểu chi tiết
👉 **[HUONG_DAN_MYSQL_LOCAL.md](./HUONG_DAN_MYSQL_LOCAL.md)**
- Hướng dẫn đầy đủ từng bước
- Giải thích rõ ràng
- Troubleshooting chi tiết

### ⚡ Cho người đã có kinh nghiệm
👉 **[README_CHAY_LOCAL.md](./README_CHAY_LOCAL.md)**
- Hướng dẫn nhanh
- Lệnh command line
- Setup thủ công

---

## 🎮 CÁCH NHANH NHẤT (Windows)

### Lần đầu:
1. **Cài MySQL** (password: `190705`)
   - Download: https://dev.mysql.com/downloads/installer/

2. **Click đúp:** `SETUP_MYSQL_LOCAL.bat`
   - Tự động tạo database và cài dependencies

3. **Chạy Backend:** Click đúp `START_BACKEND_LOCAL.bat`

4. **Chạy Frontend:** Click đúp `START_FRONTEND_LOCAL.bat`

5. **Truy cập:** http://localhost:3000

### Lần sau (đã setup rồi):
1. Click `START_BACKEND_LOCAL.bat`
2. Click `START_FRONTEND_LOCAL.bat`
3. Vào http://localhost:3000

---

## 🔐 TÀI KHOẢN TEST

**Password: 12345678**

```
Admin:     admin@medischedule.com
Doctor:    doctor1@test.com
Patient:   patient1@test.com
```

---

## 🗂️ CÁC TÀI LIỆU KHÁC

| File | Mô tả |
|------|-------|
| `THAY_DOI_MYSQL.md` | Thay đổi đã thực hiện (loại bỏ MongoDB) |
| `README.md` | README chính của project |
| `test_result.md` | Kết quả testing |

---

## 📊 THÔNG TIN DATABASE

- **Database:** medischedule
- **User:** root
- **Password:** 190705
- **Port:** 3306
- **Bảng:** 9 bảng (users, patients, doctors, specialties, appointments, payments, chat_messages, ai_chat_history, admin_permissions)

---

## 🐛 GẶP VẤN ĐỀ?

### MySQL không kết nối?
```bash
# Windows
services.msc → Tìm MySQL80 → Start

# Linux
sudo systemctl start mariadb
```

### Port bị chiếm?
```bash
# Tìm process
netstat -ano | findstr :8001

# Kill process
taskkill /PID [số_PID] /F
```

### Xem thêm:
- Mở file hướng dẫn chi tiết để troubleshoot
- Kiểm tra backend logs trong terminal

---

## 🎯 CHECKLIST

- [ ] MySQL đã cài đặt
- [ ] Đã chạy SETUP_MYSQL_LOCAL.bat
- [ ] Backend chạy tại :8001
- [ ] Frontend chạy tại :3000
- [ ] Login thành công

---

## 🎉 HOÀN TẤT!

**Bạn đã sẵn sàng sử dụng ứng dụng với MySQL!**

📍 **URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8001
- API Docs: http://localhost:8001/api/docs

💡 **Mẹo:** Đánh dấu file này để dễ tìm lại!
