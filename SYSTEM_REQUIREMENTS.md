# I. Logic dùng chung cho toàn hệ thống
## 1) Xác thực và phân quyền
Khách vãng lai chỉ được vào nhóm giao diện công cộng.
Người dùng đăng nhập thành công được điều hướng theo vai trò: Bệnh nhân, Bác sĩ, Admin, Trưởng khoa (nếu mở rộng).
Mọi màn hình nghiệp vụ phải có AuthGuard kiểm tra quyền trước khi render.

## 2) Trạng thái dữ liệu chuẩn
Mỗi màn phải có: loading, empty, success, error.

## 3) Đối tượng nghiệp vụ lõi
NguoiDung, BacSi, BenhNhan, ChuyenKhoa, LichKham, DatLich, KhamOnline, TinNhanKham, HoSoBenhAn, ThanhToan, NoiDungChoDuyet / NoiDungDaDuyet.

## 4) Trạng thái lịch hẹn nên dùng
CHO_XAC_NHAN, CHO_THANH_TOAN, DA_XAC_NHAN, DA_HOAN_THANH, DA_HUY, VANG_MAT

## 5) Trạng thái thanh toán nên dùng
CHO_THANH_TOAN, DANG_XU_LY, DA_THANH_TOAN, THAT_BAI, DA_HUY, HET_HAN

## 6) Quy tắc lịch khám
- Chỉ đặt vào slot còn trống.
- Không đặt ngoài lịch làm việc bác sĩ.
- Không vượt SoLuongToiDa.
- Hủy/đổi lịch phải theo chính sách thời gian.

## 7) Quy tắc AI
- AI chỉ hỗ trợ tư vấn sơ bộ, không thay thế bác sĩ.
- Nội dung AI nhạy cảm có thể đưa vào luồng kiểm duyệt.

# II. Logic nghiệp vụ nhóm giao diện công cộng (1–11)
1. Trang chủ: Hiển thị giới thiệu, dịch vụ, tìm kiếm nhánh, luồng công khai. CTA chuyển sang dashboard theo vai trò.
2. Đăng nhập: Nhập email/mật khẩu -> Kiểm tra khóa -> Tạo JWT, điều hướng.
3. Đăng ký: Kiểm tra email, SĐT duy nhất. Tạo users. Bác sĩ cần chờ duyệt.
4. Quên mật khẩu: OTP/link reset -> Đổi mật khẩu.
5. DS Dịch vụ: Lọc dịch vụ publish.
6. Chi tiết Dịch vụ: Mô tả, phân bổ bác sĩ. Nút “Đặt lịch”.
7. DS Chuyên khoa: Lọc, nhấn vào xem bác sĩ.
8. Chi tiết Chuyên khoa: Hiện bác sĩ active.
9. DS Cơ sở y tế: Liệt kê phòng khám phối hợp, vị trí.
10. Chi tiết Cơ sở y tế: Lead sang booking theo cơ sở.
11. DS Bác sĩ (Public): Lọc chuyên khoa, review, hiển thị public profile.

# III. Logic nghiệp vụ nhóm bệnh nhân (12–26)
12. Dashboard Bệnh nhân: Lịch hẹn gần, thống kê, nhắc lịch, DS shortcut.
13. DS Lịch hẹn: Hủy, đổi, video ca, review. Chỉ tài sản của chính bệnh nhân.
14. Tìm kiếm Bác sĩ: Booking chuyên sâu.
15. Hồ sơ Bác sĩ: Đặt lịch. 
16. Tư vấn AI: Khám sơ bộ, suggest ưu tiên, cảnh báo nếu nguy hiểm.
17. Lịch sử Tư vấn AI: Xem history cấm sửa.
18. Phòng gọi Video: Đúng khung giờ, đã xác nhận, kết thúc chuyển trạng thái.
19. Chat theo lịch hẹn: Khóa chat sau khung giờ nhất định.
20. DS Chat: Unread badges.
21. Danh sách Hội thoại: Free chat nếu được phép.
22. Chat Tổng hợp: Đa tab nội bộ.
23. Quản lý Thanh toán: Lịch sử nạp/xuất/thanh toán.
24. Xử lý Thanh toán: Redirect gateway -> callback ThanhToan và DatLich.
25. Hồ sơ bệnh án: Summary khám xong. Xem hồ sơ cá nhân.
26. Cài đặt Tài khoản: Validate update profile.

# IV. Logic nghiệp vụ nhóm bác sĩ (27–36)
27. Dashboard Bác sĩ: Bếp khám hôm nay, doanh thu, hàng chờ.
28. Hồ sơ Bác sĩ (Edit): Cập nhật bio, có admin kiểm duyệt (tùy chọn).
29. QL Lịch làm việc: Không chồng slot, không xóa nếu booking đã khớp.
30. QL Lịch hẹn (Full): Đón khách, status confirm.
31. Phòng khám Video: Ghi chú y khoa, chia sẻ màn hình.
32. Hệ thống Chat: Quick reply với context.
33. Hồ sơ bệnh án (View): Bệnh án thuộc phạm vi thăm khám.
34. Chẩn đoán AI: Support nội bộ bác sĩ.
35. Video Hội chẩn: B2B họp báo y khoa.
36. Cài đặt dịch vụ: Chỉnh giá tư vấn, thời gian. Không hồi tố phí cũ.

# V. Logic nghiệp vụ nhóm admin (37–47)
37. Dashboard Admin: Tổng số lượng record tích hợp, cảnh báo sức khoẻ server.
38. Quản lý Bác sĩ: CRUD, Duyệt bác sĩ.
39. Quản lý Bệnh nhân: Khóa, xóa mềm user, không xóa cứng nếu đã giao dịch.
40. Thống kê chuyên sâu: Heatmap, AI sessions.
41. Quản lý Admin: Tạo sub-admin.
42. Tạo tài khoản hàng loạt: Import CSV.
43. Quản lý Thanh toán: Tra soát logs giao dịch.
44. Báo cáo: PDF/Excel theo luồng kế toán.
45. Cài đặt hệ thống: Ghi log thay đổi thiết lập trọng yếu.
46. Kiểm duyệt AI: Flag review và custom bot prompt.
47. Quản lý Chuyên khoa: Sắp xếp sơ đồ chuyên khoa, khóa nếu hết lượt.

# VI. Logic nghiệp vụ nhóm trưởng khoa (48–53)
48. Dashboard Trưởng khoa: Hiệu suất khoa.
49. Quản lý Bác sĩ trong khoa: Phân trực, đánh giá công việc. 
50. Theo dõi Bệnh nhân tập trung: Nhóm điều trị phụ trách.
51. Thông báo nội bộ khoa: Push info group. 
52. Báo cáo chuyên môn khoa: Data silo.
53. Chat/Hội nghị khoa: Khởi tạo group chat nội bộ.

# VII. Flow nghiệp vụ trọng tâm nên chuẩn hóa
1) Đặt lịch: Tìm bác sĩ -> Xem hồ sơ -> Chọn slot -> Tạo DatLich -> Thanh toán (nếu có) -> Xác nhận -> ... -> Khám -> Đóng ca.
2) Flow AI: Vào hỏi -> Bot check symptom -> List khoa bác sĩ liên quan.
3) Thanh toán: Trả result xử lý DatLich.
4) Khám online: Jitsi / VideoRTC setup -> Đã khám.
5) Kiểm duyệt AI: NoiDungChoDuyet -> Amin accept -> Update.

# VIII. Rule dữ liệu rất quan trọng
- 1 lịch hẹn = 1 bệnh nhân.
- Slot bác sĩ có max threshold.
- Booking qua phí bắt buộc phải payment confirm.
- AI không sửa data. Chat log tracking. Medical records security bảo mật thông tin nội khoa nghiêm ngặt.
