# ⚠️ THÔNG TIN QUAN TRỌNG VỀ APP NÀY

## 📌 TÌNH TRẠNG HIỆN TẠI

✅ **App đang hoạt động hoàn hảo trên LOCALHOST**
- Frontend: http://localhost:3000
- Backend: http://localhost:8001
- Database: MySQL (localhost:3306)

❌ **Preview URL KHÔNG HOẠT ĐỘNG và sẽ KHÔNG BAO GIỜ hoạt động**
- Lý do: Emergent platform chỉ hỗ trợ MongoDB
- App này sử dụng MySQL
- Preview URL yêu cầu MongoDB nên không thể chạy

---

## 🎯 QUYẾT ĐỊNH CỦA BẠN

Bạn đã chọn **LỰA CHỌN 2**: Giữ MySQL và chỉ chạy trên localhost

**Điều này có nghĩa:**
- ✅ App chạy tốt trên máy local của bạn
- ❌ Không có Preview URL online
- ❌ Không thể chia sẻ link cho người khác
- ❌ Không deploy được lên Emergent

---

## 🔄 NẾU BẠN MUỐN THAY ĐỔI

### Option A: Muốn có Preview URL?
→ Cần convert sang MongoDB (mất 1-2 giờ)

### Option B: Muốn deploy online với MySQL?
→ Cần dùng platform khác:
- AWS + RDS MySQL
- Heroku + ClearDB
- DigitalOcean + MySQL
- Google Cloud Platform
- VPS riêng

---

## 🔐 TÀI KHOẢN TEST

- **Admin:** admin@medischedule.com / 12345678
- **Bác sĩ:** doctor1@test.com / 12345678
- **Bệnh nhân:** patient1@test.com / 12345678

---

## 📂 FILE QUAN TRỌNG

- `HUONG_DAN_LOCALHOST.md` - Hướng dẫn chi tiết chạy app
- `backend/.env` - Cấu hình database MySQL
- `backend/server.py` - Main backend file
- `frontend/.env` - Cấu hình frontend

---

## ✅ TÍNH NĂNG ĐÃ CÓ

1. Đăng nhập / Đăng ký ✅
2. Chat bác sĩ - bệnh nhân ✅
3. Chia sẻ hình ảnh trong chat ✅
4. Quản lý appointments ✅
5. Quản lý thanh toán ✅
6. Dashboard cho tất cả roles ✅
7. Multi-language (VI/EN) ✅

---

## 🚀 KHỞI ĐỘNG NHANH

```bash
# Backend
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend (terminal khác)
cd /app/frontend
yarn start
```

Sau đó truy cập: http://localhost:3000

---

## ❓ CÂU HỎI THƯỜNG GẶP

**Q: Tại sao Preview URL không hoạt động?**
A: Vì app dùng MySQL nhưng Emergent chỉ hỗ trợ MongoDB.

**Q: Làm sao để có Preview URL?**
A: Cần convert app sang MongoDB.

**Q: App có chạy được không?**
A: Có! App chạy hoàn hảo trên localhost.

**Q: Có thể deploy ở đâu với MySQL?**
A: AWS, Heroku, DigitalOcean, GCP, hoặc VPS riêng.

---

**Cập nhật:** 31/10/2025
**Status:** ✅ Hoạt động tốt trên localhost
