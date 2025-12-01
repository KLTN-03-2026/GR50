# Hướng Dẫn Triển Khai (Deployment Guide)

Tài liệu này hướng dẫn cách đưa ứng dụng MediSchedule lên môi trường internet (Public Hosting/Server).

## 1. Tổng Quan Kiến Trúc
Ứng dụng gồm 3 phần chính cần triển khai:
1.  **Database (MySQL)**: Lưu trữ dữ liệu.
2.  **Backend (Node.js/Express)**: Xử lý logic và API.
3.  **Frontend (React)**: Giao diện người dùng.

## 2. Chuẩn Bị
-   Tài khoản GitHub (để lưu mã nguồn).
-   Tài khoản các dịch vụ hosting (ví dụ: Railway, Render, Vercel).
-   Cài đặt Git trên máy tính.

## 3. Triển Khai Database (Cơ sở dữ liệu)
Bạn cần một dịch vụ hosting MySQL online.
**Gợi ý:** Railway, Aiven, hoặc PlanetScale.

**Các bước (Ví dụ với Railway):**
1.  Tạo tài khoản tại [railway.app](https://railway.app/).
2.  Tạo project mới -> Chọn "Provision MySQL".
3.  Sau khi tạo xong, vào tab "Variables" hoặc "Connect" để lấy các thông tin:
    -   `MYSQLHOST` (Host)
    -   `MYSQLPORT` (Port)
    -   `MYSQLUSER` (User)
    -   `MYSQLPASSWORD` (Password)
    -   `MYSQLDATABASE` (Database Name)

## 4. Triển Khai Backend
**Gợi ý:** Render hoặc Railway.

**Các bước (Ví dụ với Render):**
1.  Đẩy code `backend` lên GitHub (tốt nhất là để trong thư mục gốc hoặc set root directory khi deploy).
2.  Tạo tài khoản tại [render.com](https://render.com/).
3.  Chọn "New +" -> "Web Service".
4.  Kết nối với repository GitHub của bạn.
5.  Cấu hình:
    -   **Root Directory**: `backend` (nếu code backend nằm trong thư mục backend).
    -   **Build Command**: `npm install`
    -   **Start Command**: `node server.js`
6.  **Environment Variables (Biến môi trường)**:
    Thêm các biến sau vào phần Environment:
    -   `DB_HOST`: (Lấy từ bước 3)
    -   `DB_USER`: (Lấy từ bước 3)
    -   `DB_PASS`: (Lấy từ bước 3)
    -   `DB_NAME`: (Lấy từ bước 3)
    -   `PORT`: `8080` (hoặc để Render tự cấp)
    -   `JWT_SECRET`: (Điền một chuỗi bí mật bất kỳ)
    -   `GEMINI_API_KEY`: (Key API Gemini của bạn)

## 5. Triển Khai Frontend
**Gợi ý:** Vercel hoặc Netlify.

**Các bước (Ví dụ với Vercel):**
1.  Đẩy code `frontend` lên GitHub.
2.  Tạo tài khoản tại [vercel.com](https://vercel.com/).
3.  Chọn "Add New..." -> "Project".
4.  Import repository GitHub.
5.  Cấu hình:
    -   **Root Directory**: `frontend`
    -   **Framework Preset**: Create React App
6.  **Environment Variables**:
    -   `REACT_APP_BACKEND_URL`: Điền URL của Backend đã deploy ở bước 4 (ví dụ: `https://medischedule-backend.onrender.com`). **Lưu ý: Không có dấu `/` ở cuối.**
7.  Nhấn "Deploy".

## 6. Kiểm Tra
1.  Truy cập URL của Frontend do Vercel cung cấp.
2.  Thử đăng ký/đăng nhập.
3.  Nếu lỗi, kiểm tra tab "Logs" trên Render (Backend) và Vercel (Frontend).

## Lưu ý Quan Trọng
-   **CORS**: Trong `backend/server.js`, đảm bảo cấu hình CORS cho phép domain của Frontend (hoặc để `*` tạm thời).
-   **Database Migration**: Khi deploy lần đầu, Backend sẽ tự động chạy `sequelize.sync` để tạo bảng (do cấu hình hiện tại). Tuy nhiên, dữ liệu mẫu sẽ trống. Bạn có thể cần chạy script seed hoặc nhập liệu thủ công.

---
**Cần hỗ trợ?**
Nếu bạn gặp lỗi trong quá trình deploy, hãy copy log lỗi và gửi cho tôi.
