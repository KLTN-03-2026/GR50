# Hướng dẫn phục hồi dữ liệu MediSchedule

Để người nhận file nén có đầy đủ dữ liệu như bạn đang có, họ cần thực hiện các bước sau:

## Cách 1: Sử dụng file SQL Dump (Khuyên dùng)
Đây là cách nhanh nhất để có chính xác 100% dữ liệu hiện tại của bạn.

1. Mở **MySQL Workbench** hoặc **HeidiSQL**.
2. Tạo một database mới tên là `database_benhvien` (nếu chưa có).
3. Sử dụng tính năng **Import/Restore** và chọn file:
   - Đường dẫn: `backend/database_benhvien.sql`
4. Sau khi import xong, toàn bộ bảng, dữ liệu bác sĩ, phòng khám và lịch hẹn sẽ được phục hồi.

## Cách 2: Sử dụng Script Seed (Dành cho nhà phát triển)
Nếu muốn khởi tạo lại dữ liệu mẫu sạch sẽ (clean production data):

1. Mở terminal tại thư mục `backend`.
2. Chỉnh sửa file `.env` để khớp với thông tin MySQL của máy mới.
3. Chạy lệnh:
   ```bash
   node seed.js
   ```
   *Lưu ý: Lệnh này sẽ xóa toàn bộ dữ liệu cũ trong database và tạo mới dữ liệu mẫu.*

## Cấu hình kết nối
Đảm bảo file `backend/.env` đã được cấu hình đúng:
- `DB_NAME=database_benhvien`
- `DB_USER=root`
- `DB_PASS=Mật_khẩu_MySQL_của_họ`
- `DB_HOST=127.0.0.1`
