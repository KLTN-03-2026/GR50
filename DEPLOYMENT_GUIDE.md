# Hướng dẫn chạy ứng dụng trên mạng LAN (Cho máy khác truy cập)

Để các máy khác (điện thoại, laptop khác) trong cùng mạng WiFi/LAN có thể truy cập vào ứng dụng của bạn, hãy làm theo các bước sau:

## 1. Tìm địa chỉ IP của máy chủ (Máy đang chạy code)
1. Mở Terminal (Command Prompt hoặc PowerShell).
2. Gõ lệnh: `ipconfig`
3. Tìm dòng **IPv4 Address**. Ví dụ: `192.168.1.15` (Đây là địa chỉ IP của máy bạn).

## 2. Cấu hình Backend
Backend mặc định chạy trên cổng `8001`.
- Đảm bảo bạn đã chạy backend: `cd backend` -> `npm run dev`
- Kiểm tra kết nối bằng cách mở trình duyệt và vào: `http://localhost:8001/api/health`
- Nếu thấy thông báo `{"status":"ok","message":"Server is running"}`, backend đã sẵn sàng.

## 3. Cấu hình Frontend
Để Frontend kết nối được với Backend từ máy khác, bạn cần thay đổi địa chỉ `localhost` thành địa chỉ IP vừa tìm được.

1. Mở file `frontend/.env` (nếu chưa có thì tạo mới).
2. Thêm hoặc sửa dòng sau:
   ```env
   REACT_APP_BACKEND_URL=http://192.168.1.15:8001
   ```
   *(Thay `192.168.1.15` bằng IP thực tế của bạn)*

3. Khởi động lại Frontend:
   - `cd frontend`
   - `npm start`

## 4. Truy cập từ máy khác
1. Đảm bảo máy tính và thiết bị khác (điện thoại) kết nối cùng một mạng WiFi.
2. Trên thiết bị khác, mở trình duyệt.
3. Nhập địa chỉ: `http://192.168.1.15:3000` (Thay IP và cổng frontend tương ứng).

## 5. Xử lý lỗi (Nếu không truy cập được)
- **Tường lửa (Firewall):** Windows Firewall có thể chặn kết nối. Hãy thử tắt tạm thời hoặc cho phép Node.js đi qua tường lửa.
- **Mạng:** Đảm bảo các thiết bị ping được thấy nhau.
