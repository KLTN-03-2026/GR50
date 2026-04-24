# Hướng dẫn kích hoạt đường dẫn Web Live

Chào bạn, để có một đường dẫn web mà "chỉ cần bấm vào là chạy", bạn cần thực hiện một bước nhỏ trên giao diện GitHub vì lý do bảo mật của GitHub.

---

### Cách 1: Sử dụng GitHub Pages (Đã cài đặt sẵn)

Tôi đã thiết lập hệ thống tự động build, bạn chỉ cần bật nó lên:

1. Truy cập vào Repository của bạn: [https://github.com/KLTN-GR50/KLTN_06-2026](https://github.com/KLTN-GR50/KLTN_06-2026)
2. Nhấn vào tab **Settings** (Cài đặt) ở trên cùng.
3. Ở cột bên trái, tìm và nhấn vào mục **Pages**.
4. Tại phần **Build and deployment** > **Branch**:
   - Chọn branch là: **`gh-pages`** (Nếu chưa thấy, hãy đợi 1 phút rồi F5 lại trang).
   - Folder là: **`/(root)`**.
5. Nhấn **Save**.
6. Đợi khoảng 30 giây, bạn sẽ thấy một đường dẫn hiện ra ở trên cùng (ví dụ: `https://KLTN-GR50.github.io/KLTN_06-2026/`). Đó chính là link web của bạn!

---

### Cách 2: Sử dụng Vercel (Khuyên dùng - Nhanh và Chuyên nghiệp)

Nếu bạn muốn một đường dẫn đẹp và ổn định hơn:

1. Truy cập [Vercel.com](https://vercel.com) và đăng nhập bằng GitHub.
2. Nhấn **Add New** > **Project**.
3. Tìm repo `KLTN_06-2026` và nhấn **Import**.
4. **Quan trọng**: Ở phần "Root Directory", hãy nhấn **Edit** và chọn thư mục **`frontend`**.
5. Nhấn **Deploy**.
6. Vercel sẽ cho bạn một đường dẫn (ví dụ: `kltn-06-2026.vercel.app`) chạy cực nhanh.

---

### Tại sao hiện tại link chưa chạy?
GitHub Pages mặc định bị tắt để tránh tốn tài nguyên, nên bạn cần vào mục **Settings** nhấn **Save** như bước trên thì link mới bắt đầu hoạt động.

**Đường dẫn dự kiến của bạn:**
👉 [https://KLTN-GR50.github.io/KLTN_06-2026/](https://KLTN-GR50.github.io/KLTN_06-2026/)
