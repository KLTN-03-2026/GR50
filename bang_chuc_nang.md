# Bảng Tổng hợp Chức năng Hệ thống MediSched AI

Hệ thống được chia thành 4 vai trò chính: **Bệnh nhân (Patient), Bác sĩ (Doctor), Nhân viên tiếp tân (Staff), và Quản trị viên (Admin)**. Dưới đây là bảng tổng hợp tất cả các chức năng theo từng vai trò.

## 1. Giao diện Công khai (Public / Khách chưa đăng nhập)

| Chức năng | Mô tả chi tiết | Đường dẫn (Route) |
| :--- | :--- | :--- |
| **Trang chủ (Landing Page)** | Giới thiệu hệ thống, dịch vụ nổi bật, bác sĩ tiêu biểu, cơ sở y tế. Có thanh tìm kiếm tổng hợp. | `/` |
| **Tìm kiếm tổng hợp** | Tìm kiếm bác sĩ, cơ sở y tế, chuyên khoa từ thanh tìm kiếm trang chủ. | N/A |
| **Đăng ký / Đăng nhập** | Tạo tài khoản mới, đăng nhập vào hệ thống, quên mật khẩu, đặt lại mật khẩu. | `/login`, `/register`, `/forgot-password` |
| **Danh sách Dịch vụ** | Xem tất cả các dịch vụ (khám tổng quát, khám từ xa, xét nghiệm...). | `/services`, `/services/:slug` |
| **Danh sách Chuyên khoa** | Xem các chuyên khoa và danh sách bác sĩ thuộc chuyên khoa đó. | `/specialties`, `/specialty/:id` |
| **Danh sách Cơ sở y tế** | Tìm kiếm các bệnh viện, phòng khám, xem địa chỉ trên bản đồ. | `/facilities`, `/facility/:id` |
| **Danh sách Bác sĩ** | Tra cứu thông tin bác sĩ, đánh giá, kinh nghiệm, phí khám. | `/doctors`, `/doctors/:id` |
| **Trợ lý AI tư vấn** | Nút Chat AI nổi trên góc phải trang chủ (yêu cầu đăng nhập để lưu trữ lịch sử). | Floating Chat |

## 2. Vai trò: Bệnh nhân (Patient)

| Chức năng | Mô tả chi tiết | Đường dẫn (Route) |
| :--- | :--- | :--- |
| **Dashboard cá nhân** | Tổng quan số lịch hẹn sắp tới, lịch hẹn đã hoàn thành, số phiên tư vấn AI. | `/patient/dashboard` |
| **Tư vấn AI Triage** | Chat với AI để chẩn đoán sơ bộ, phân luồng chuyên khoa, và đặt lịch tự động từ kết quả AI. | Kích hoạt qua Chatbot |
| **Lịch sử AI** | Xem lại tất cả các phiên chẩn đoán với AI trước đây. | `/patient/ai-history` |
| **Đặt lịch khám** | Chọn bác sĩ, chọn giờ khám, chọn hình thức (Trực tiếp / Online), khai báo triệu chứng. | `/patient/search-doctors`, `/patient/doctor/:id` |
| **Quản lý Lịch hẹn** | Xem danh sách lịch hẹn (sắp tới, đã hủy, đã hoàn thành), hủy lịch hẹn. | `/patient/appointments` |
| **Thanh toán & Hóa đơn** | Thanh toán trực tuyến (VNPay/Momo) cho các hóa đơn, xem lịch sử giao dịch. | `/patient/payments`, `/patient/payment/:id` |
| **Khám Online (Video Call)**| Gọi video trực tuyến với bác sĩ đúng giờ hẹn, chia sẻ màn hình. | `/patient/video-consultation/:id` |
| **Tin nhắn (Chat)** | Nhắn tin với bác sĩ (nếu lịch hẹn cho phép), hoặc nhắn tin với Nhân viên hỗ trợ. | `/patient/messages` |
| **Hồ sơ bệnh án** | Xem toa thuốc, chỉ định cận lâm sàng, kết quả khám do bác sĩ cập nhật. | `/patient/medical-records` |
| **Cài đặt tài khoản** | Cập nhật thông tin cá nhân (Nhóm máu, Tiền sử bệnh, Người liên hệ khẩn cấp), đổi ảnh đại diện. | `/patient/account-settings` |

## 3. Vai trò: Bác sĩ (Doctor)

| Chức năng | Mô tả chi tiết | Đường dẫn (Route) |
| :--- | :--- | :--- |
| **Dashboard Bác sĩ** | Thống kê số bệnh nhân hôm nay, số lịch khám, bệnh nhân mới. | `/doctor/dashboard` |
| **Quản lý Lịch hẹn** | Xem danh sách bệnh nhân đặt lịch, thay đổi trạng thái (Đang khám, Đã hoàn thành, Hủy). | `/doctor/appointments` |
| **Lịch làm việc** | Thiết lập thời gian làm việc (ca sáng/chiều), ngày nghỉ để hệ thống cho bệnh nhân đặt lịch. | `/doctor/schedule` |
| **Khám Online (Video Call)**| Gọi video với bệnh nhân đúng giờ hẹn. | `/doctor/video-consultation/:id` |
| **Hồ sơ bệnh án & Kê đơn**| Viết ghi chú khám bệnh, kê đơn thuốc, ghi chú dặn dò sau khám cho bệnh nhân. Tạo hóa đơn. | `/doctor/medical-records` |
| **Tin nhắn & Tư vấn** | Trả lời tin nhắn của bệnh nhân (thường hỗ trợ sau khám). | `/doctor/conversations` |
| **Chẩn đoán AI (Tham khảo)**| Xem lại bản tóm tắt mà AI đã chẩn đoán cho bệnh nhân trước khi bệnh nhân gặp bác sĩ. | `/doctor/ai-diagnoses` |
| **Cài đặt dịch vụ** | Cập nhật phí khám (Online/Offline), tiểu sử kinh nghiệm. | `/doctor/service-settings` |
| **Hồ sơ cá nhân** | Đổi mật khẩu, đổi avatar, thông tin liên hệ. | `/doctor/profile` |

## 4. Vai trò: Nhân viên Tiếp tân / Vận hành (Staff)

| Chức năng | Mô tả chi tiết | Đường dẫn (Route) |
| :--- | :--- | :--- |
| **Dashboard Vận hành** | Giám sát tải hệ thống, số lượng cuộc gọi online đang diễn ra, số bệnh nhân đang chờ. | `/staff/dashboard` |
| **Tiếp nhận Bệnh nhân** | Tạo tài khoản cho bệnh nhân mới tới khám trực tiếp, tra cứu thông tin bệnh nhân. | `/staff/patients` |
| **Điều phối Lịch khám** | Quản lý, phê duyệt, dời lịch, hủy lịch hẹn thay cho bác sĩ hoặc bệnh nhân. | `/staff/appointments` |
| **Hỗ trợ đặt lịch (Offline)**| Đặt lịch hẹn giúp bệnh nhân khi họ gọi điện thoại hoặc tới quầy lễ tân. | `/staff/booking-assist` |
| **Hàng chờ AI Triage** | Xem các ca bệnh mà AI vừa chẩn đoán (ưu tiên ca cấp cứu), và chỉ định/chuyển ca đó cho bác sĩ phù hợp. | `/staff/triage-queue` |
| **Hỗ trợ Thanh toán** | Thu tiền mặt/chuyển khoản từ bệnh nhân khám trực tiếp, cập nhật trạng thái hóa đơn thành Đã thanh toán. | `/staff/payments` |
| **Hỗ trợ Giao tiếp (Chat)** | Giải đáp thắc mắc chung của bệnh nhân qua kênh Chat hỗ trợ. | `/staff/messages` |
| **Hỗ trợ Khám Online** | Theo dõi các phòng khám Online để can thiệp kỹ thuật nếu bác sĩ/bệnh nhân gặp sự cố kết nối. | `/staff/video-support` |

## 5. Vai trò: Quản trị viên (Admin)

| Chức năng | Mô tả chi tiết | Đường dẫn (Route) |
| :--- | :--- | :--- |
| **Dashboard Admin** | Thống kê doanh thu, tổng số bệnh nhân, bác sĩ, hoạt động hệ thống. | `/admin/dashboard` |
| **Quản lý Bác sĩ** | Thêm mới bác sĩ, cấp tài khoản, xét duyệt hồ sơ, khóa tài khoản bác sĩ. | `/admin/doctors` |
| **Quản lý Bệnh nhân** | Xem danh sách bệnh nhân toàn hệ thống, reset mật khẩu khi bệnh nhân yêu cầu. | `/admin/patients` |
| **Quản lý Chuyên khoa** | Thêm, sửa, xóa các chuyên khoa bệnh viện. Tải lên hình ảnh chuyên khoa. | `/admin/specialties` |
| **Quản lý Quản trị viên** | Tạo tài khoản cho các Admin khác (Nếu có quyền Super Admin). | `/admin/admins`, `/admin/create-accounts` |
| **Quản lý Thanh toán** | Xem lịch sử toàn bộ dòng tiền, đối soát doanh thu. | `/admin/payments` |
| **Báo cáo (Reports)** | Xuất báo cáo doanh thu, hiệu suất bác sĩ, tỷ lệ bệnh nhân theo định dạng Excel/PDF. | `/admin/reports` |
| **Thống kê chuyên sâu** | Biểu đồ tăng trưởng, xu hướng chuyên khoa được đặt nhiều nhất. | `/admin/stats` |
| **Giám sát AI (Oversight)** | Giám sát độ chính xác của AI Triage, đánh giá xem AI phân luồng có đúng không. | `/admin/ai-diagnoses` |
| **Cài đặt Hệ thống** | Thay đổi số điện thoại, email, địa chỉ bệnh viện hiển thị trên Footer/Landing Page. | `/admin/system-settings` |
