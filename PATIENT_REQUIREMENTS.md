# II. Nhóm giao diện Bệnh nhân (12–26)
12. Dashboard Bệnh nhân
12.1. Mục tiêu
Hiển thị tổng quan cá nhân sau đăng nhập.
Cho phép truy cập nhanh các chức năng quan trọng: tìm bác sĩ, lịch hẹn, lịch sử/AI, hồ sơ bệnh án.
Nổi bật lịch hẹn gần nhất hoặc sắp tới.
12.2. Tác nhân
Bệnh nhân đã đăng nhập
12.3. Điều kiện trước
Có tài khoản bệnh nhân hợp lệ.
Đăng nhập thành công.
12.4. Dữ liệu vào
Không có input bắt buộc ban đầu.
Tương tác từ shortcut card hoặc sidebar.
12.5. Dữ liệu ra
Lịch hẹn gần nhất
Thống kê cá nhân:
số lịch sắp tới
số lịch đã khám
số phiên AI
trạng thái thanh toán gần đây
Shortcut điều hướng
12.6. Luồng nghiệp vụ chính
Bệnh nhân đăng nhập.
Hệ thống xác định vai trò bệnh nhân và điều hướng vào dashboard.
Hệ thống truy vấn:
thông tin hồ sơ bệnh nhân
lịch hẹn gần nhất / sắp tới
dữ liệu lịch sử khám cơ bản
phiên AI gần đây
Hiển thị các card hành động:
Tìm bác sĩ
Lịch hẹn
Lịch sử / lịch chờ
AI / hồ sơ
Nếu có lịch sắp diễn ra, ưu tiên hiển thị Next appointment card.
Nếu không có dữ liệu, hiển thị empty state.
12.7. Ngoại lệ
Không có lịch hẹn nào: hiển thị “Bạn chưa có lịch hẹn nào gần đây”.
Lỗi tải dashboard: hiển thị error state + nút tải lại.
12.8. Ràng buộc nghiệp vụ
Chỉ hiển thị dữ liệu của chính bệnh nhân.
Shortcut không được mở màn vượt quyền.
Dữ liệu thống kê chỉ mang tính tổng hợp cá nhân, không hiển thị dữ liệu nhạy cảm quá chi tiết trên màn chính.
12.9. Bảng dữ liệu liên quan
NguoiDung
BenhNhan
DatLich
HoSoBenhAn
ThanhToan

13. DS Lịch hẹn
13.1. Mục tiêu
Quản lý tất cả lịch hẹn của bệnh nhân.
Cho phép xem trạng thái, hủy lịch, đổi lịch, tham gia video call, đánh giá sau khám.
13.2. Tác nhân
Bệnh nhân đã đăng nhập
13.3. Điều kiện trước
Đăng nhập thành công.
Có hoặc chưa có lịch hẹn.
13.4. Dữ liệu vào
Bộ lọc:
tất cả
sắp tới
đã hoàn thành
đã hủy
chờ thanh toán / chờ xác nhận
Tác vụ:
hủy
đổi lịch
tham gia video
đánh giá
13.5. Dữ liệu ra
Danh sách lịch hẹn
Trạng thái từng lịch
Nút hành động hợp lệ theo trạng thái
13.6. Luồng nghiệp vụ chính
Bệnh nhân mở màn “Lịch hẹn của tôi”.
Hệ thống truy vấn toàn bộ DatLich của bệnh nhân theo thời gian.
Hiển thị từng lịch với thông tin:
bác sĩ
chuyên khoa
thời gian
hình thức khám
trạng thái
Hệ thống xác định nút hành động:
Hủy lịch nếu còn trong thời gian cho phép
Đổi lịch nếu bác sĩ còn slot khác
Join Video nếu lịch đã xác nhận và đang trong khung giờ khám
Đánh giá nếu lịch đã hoàn thành
Khi bệnh nhân chọn hủy:
yêu cầu xác nhận
kiểm tra điều kiện hủy
cập nhật trạng thái lịch
gửi thông báo tới bác sĩ
Khi chọn đổi lịch:
hiển thị slot mới khả dụng
nếu hợp lệ thì cập nhật
Khi chọn video:
kiểm tra quyền và thời gian
mở phòng gọi video
Khi chọn đánh giá:
mở form đánh giá bác sĩ.
13.7. Ngoại lệ
Không có lịch → hiển thị empty state.
Không được hủy do quá hạn → báo lỗi.
Không còn slot để đổi lịch → báo lỗi.
Link video chưa sẵn sàng → báo chưa thể tham gia.
13.8. Ràng buộc nghiệp vụ
Chỉ bệnh nhân sở hữu lịch mới được thao tác.
Không được đổi hoặc hủy lịch ngoài chính sách thời gian.
Chỉ lịch DA_HOAN_THANH mới được đánh giá.
Chỉ lịch DA_XAC_NHAN và đúng thời gian mới được vào video.
13.9. Bảng dữ liệu liên quan
DatLich
LichKham
KhamOnline
ThanhToan

14. Tìm kiếm Bác sĩ
14.1. Mục tiêu
Hỗ trợ tìm bác sĩ theo chuyên khoa, phí, kinh nghiệm, khung giờ.
Là điểm bắt đầu của quy trình đặt lịch chuyên sâu.
14.2. Tác nhân
Bệnh nhân đã đăng nhập
14.3. Điều kiện trước
Đăng nhập thành công.
14.4. Dữ liệu vào
Từ khóa tên bác sĩ
Bộ lọc:
chuyên khoa
mức phí
kinh nghiệm
lịch trống
hình thức khám
Tác vụ:
xem chi tiết
đặt lịch
14.5. Dữ liệu ra
Danh sách bác sĩ phù hợp
Slot trống hoặc thông tin khả dụng
Điều hướng sang hồ sơ bác sĩ hoặc booking flow
14.6. Luồng nghiệp vụ chính
Bệnh nhân mở màn tìm kiếm bác sĩ.
Hệ thống tải danh sách bác sĩ đang hoạt động.
Hiển thị card bác sĩ với:
tên
chuyên khoa
kinh nghiệm
phí tư vấn
rating
Bệnh nhân nhập từ khóa/chọn filter.
Hệ thống lọc danh sách.
Bệnh nhân có thể:
xem chi tiết hồ sơ
đặt lịch nhanh
Nếu đặt lịch nhanh:
chọn bác sĩ
chọn ngày/giờ
hệ thống kiểm tra slot
chuyển sang xác nhận đặt lịch.
14.7. Ngoại lệ
Không tìm thấy bác sĩ → thông báo phù hợp.
Bác sĩ không còn slot → chỉ cho xem hồ sơ, không cho đặt nhanh.
14.8. Ràng buộc nghiệp vụ
Chỉ hiển thị bác sĩ active, công khai.
Kết quả filter phải đồng nhất với dữ liệu thật.
Slot hiển thị chỉ là tham khảo, khi đặt phải kiểm tra lại một lần nữa.
14.9. Bảng dữ liệu liên quan
BacSi
NguoiDung
ChuyenKhoa
LichKham

15. Hồ sơ Bác sĩ (Detail)
15.1. Mục tiêu
Hiển thị thông tin chi tiết của bác sĩ để bệnh nhân quyết định đặt lịch.
15.2. Tác nhân
Bệnh nhân đã đăng nhập
15.3. Điều kiện trước
Bác sĩ có hồ sơ công khai.
Đăng nhập thành công.
15.4. Dữ liệu vào
doctorId
15.5. Dữ liệu ra
Thông tin chi tiết:
bio
chứng chỉ
chuyên khoa
kinh nghiệm
phí tư vấn
lịch làm việc / khung giờ khả dụng
danh sách đánh giá
15.6. Luồng nghiệp vụ chính
Bệnh nhân chọn một bác sĩ.
Hệ thống truy vấn hồ sơ bác sĩ.
Hiển thị:
thông tin chuyên môn
chứng chỉ
nơi làm việc
giới thiệu
mức phí
đánh giá
Hệ thống tải khung giờ khả dụng.
Bệnh nhân chọn:
đặt lịch khám
nhắn tin nếu hệ thống cho phép
Nếu đặt lịch:
chọn thời gian
chọn hình thức khám
xác nhận thông tin
tạo lịch.
15.7. Ngoại lệ
Hồ sơ bác sĩ không còn khả dụng → báo lỗi.
Không còn khung giờ → ẩn nút đặt hoặc báo hết slot.
15.8. Ràng buộc nghiệp vụ
Chỉ hiển thị hồ sơ bác sĩ đang hoạt động.
Đánh giá hiển thị phải là dữ liệu hợp lệ, không lộ dữ liệu nhạy cảm của bệnh nhân.
Phí hiển thị lấy từ cấu hình hiện hành của bác sĩ.
15.9. Bảng dữ liệu liên quan
BacSi
NguoiDung
ChuyenKhoa
LichKham

16. Tư vấn AI (Chat)
16.1. Mục tiêu
Cho bệnh nhân mô tả triệu chứng và nhận tư vấn sơ bộ từ AI.
16.2. Tác nhân
Bệnh nhân đã đăng nhập
16.3. Điều kiện trước
Đăng nhập thành công.
Hệ thống AI đang khả dụng.
16.4. Dữ liệu vào
Nội dung mô tả triệu chứng
Có thể kèm ảnh nếu triển khai image upload theo danh mục 53 giao diện.
16.5. Dữ liệu ra
Phản hồi AI:
phân tích sơ bộ
khuyến nghị chăm sóc cơ bản
gợi ý chuyên khoa
cảnh báo mức độ ưu tiên
Session hội thoại được lưu
16.6. Luồng nghiệp vụ chính
Bệnh nhân mở màn tư vấn AI.
Hệ thống hiển thị form nhập triệu chứng.
Bệnh nhân nhập mô tả, có thể đính kèm ảnh.
Hệ thống gửi dữ liệu sang AI service.
AI trả phản hồi sơ bộ.
Hệ thống hiển thị phản hồi trong chat.
Hệ thống lưu session để bệnh nhân xem lại sau này.
Nếu AI gợi ý chuyên khoa, hiển thị nút đi tới tìm bác sĩ phù hợp.
16.7. Ngoại lệ
Không nhập nội dung → báo “Vui lòng nhập mô tả triệu chứng”.
Lỗi kết nối AI → báo lỗi phù hợp.
Ảnh sai định dạng/kích thước → từ chối upload.
16.8. Ràng buộc nghiệp vụ
AI chỉ hỗ trợ tham khảo ban đầu, không thay thế bác sĩ.
Nội dung nhạy cảm hoặc có nguy cơ cao có thể đưa vào luồng kiểm duyệt AI.
Không đưa chẩn đoán xác quyết nếu hệ thống không được thiết kế cho mục đích đó.
16.9. Bảng dữ liệu liên quan
Có thể cần bảng/session AI riêng
NoiDungChoDuyet, NoiDungDaDuyet nếu có luồng kiểm duyệt

17. Lịch sử Tư vấn AI
17.1. Mục tiêu
Cho bệnh nhân xem lại các phiên tư vấn AI trước đây.
17.2. Tác nhân
Bệnh nhân đã đăng nhập
17.3. Điều kiện trước
Có hoặc chưa có lịch sử AI.
17.4. Dữ liệu vào
Bộ lọc theo ngày / triệu chứng / session
Chọn một session để mở lại
17.5. Dữ liệu ra
Danh sách session
Nội dung hội thoại theo nhóm tin nhắn
17.6. Luồng nghiệp vụ chính
Bệnh nhân mở màn lịch sử AI.
Hệ thống truy vấn tất cả các session AI của tài khoản.
Hiển thị danh sách theo thời gian.
Bệnh nhân chọn một session.
Hệ thống tải lại toàn bộ hội thoại.
Bệnh nhân có thể:
đọc lại kết quả
từ đó đi tới tìm bác sĩ / đặt lịch nếu cần.
17.7. Ngoại lệ
Chưa có lịch sử → hiển thị empty state.
Session bị lỗi dữ liệu → hiển thị báo lỗi.
17.8. Ràng buộc nghiệp vụ
Chỉ hiển thị lịch sử của chính bệnh nhân.
Không cho sửa nội dung lịch sử gốc.
Có thể cho phép xóa mềm khỏi danh sách hiển thị nếu muốn bảo vệ riêng tư.
17.9. Bảng dữ liệu liên quan
Kho/session lưu lịch sử AI

18. Phòng gọi Video
18.1. Mục tiêu
Cho phép bệnh nhân tham gia buổi tư vấn trực tuyến theo lịch hẹn.
18.2. Tác nhân
Bệnh nhân đã đăng nhập
18.3. Điều kiện trước
Có lịch hẹn online hợp lệ.
Lịch đã xác nhận.
Đang trong khoảng thời gian cho phép vào phòng.
18.4. Dữ liệu vào
appointmentId
Link phòng họp / token tham gia
Trạng thái mic/cam
18.5. Dữ liệu ra
Kết nối video call
Trạng thái tham gia
Nhật ký bắt đầu/kết thúc phiên
18.6. Luồng nghiệp vụ chính
Bệnh nhân bấm Join Video từ lịch hẹn.
Hệ thống kiểm tra:
bệnh nhân có sở hữu lịch này không
lịch là khám online
lịch đã xác nhận
thời gian hiện tại hợp lệ
Hệ thống lấy KhamOnline.LinkPhongHop.
Mở phòng video.
Trong phiên, bệnh nhân có thể:
bật/tắt mic
bật/tắt camera
chat nhanh
Khi kết thúc:
ghi nhận thời gian kết thúc
cập nhật trạng thái phiên khám.
18.7. Ngoại lệ
Chưa tới giờ → không cho vào hoặc cho vào waiting room.
Không có link phòng → báo lỗi.
Mất kết nối → cho phép reconnect.
18.8. Ràng buộc nghiệp vụ
Chỉ bệnh nhân thuộc lịch mới vào được.
Không cho vào phòng nếu lịch đã hủy.
Nếu bác sĩ chưa vào, bệnh nhân có thể ở trạng thái chờ.
Thời gian tham gia có thể bị giới hạn quanh khung giờ khám.
18.9. Bảng dữ liệu liên quan
DatLich
KhamOnline

19. Chat theo lịch hẹn
19.1. Mục tiêu
Cho phép bệnh nhân trao đổi với bác sĩ trước hoặc trong ca khám theo lịch hẹn.
19.2. Tác nhân
Bệnh nhân đã đăng nhập
19.3. Điều kiện trước
Có lịch hẹn hợp lệ với bác sĩ.
Kênh chat đã được tạo hoặc được phép tạo.
19.4. Dữ liệu vào
Nội dung tin nhắn
File đính kèm
appointmentId
19.5. Dữ liệu ra
Tin nhắn đã gửi
Trạng thái đọc/chưa đọc
Tệp đính kèm
19.6. Luồng nghiệp vụ chính
Bệnh nhân mở chat từ lịch hẹn.
Hệ thống kiểm tra quyền trên lịch đó.
Tải thread chat liên quan đến lịch khám.
Bệnh nhân gửi tin nhắn / file.
Hệ thống lưu tin nhắn và cập nhật realtime.
Bác sĩ nhận được thông báo nếu đang offline.
Hệ thống lưu trạng thái đọc/chưa đọc.
Database hiện có TinNhanKham gắn với KhamOnline, phù hợp để lưu nội dung chat khám online.
19.7. Ngoại lệ
Không có quyền truy cập thread → từ chối.
Tệp quá dung lượng / sai định dạng → báo lỗi.
Bác sĩ chưa có thread → hệ thống tạo thread ban đầu hoặc báo chưa khả dụng.
19.8. Ràng buộc nghiệp vụ
Chỉ các bên liên quan tới lịch khám mới truy cập được.
Có thể khóa chat sau khi lịch đóng một khoảng thời gian.
File đính kèm phải kiểm tra định dạng an toàn.
19.9. Bảng dữ liệu liên quan
DatLich
KhamOnline
TinNhanKham

20. DS Chat (List)
20.1. Mục tiêu
Hiển thị danh sách các bác sĩ/cuộc chat mà bệnh nhân đang trao đổi.
20.2. Tác nhân
Bệnh nhân đã đăng nhập
20.3. Điều kiện trước
Có hoặc chưa có lịch sử chat.
20.4. Dữ liệu vào
Từ khóa tìm kiếm tên bác sĩ / nội dung
Bộ lọc unread/all
20.5. Dữ liệu ra
Danh sách thread chat
Preview tin nhắn mới nhất
Badge chưa đọc
20.6. Luồng nghiệp vụ chính
Bệnh nhân mở DS Chat.
Hệ thống lấy toàn bộ thread chat của bệnh nhân.
Sắp xếp theo tin nhắn mới nhất.
Hiển thị:
tên bác sĩ
avatar
preview tin cuối
số chưa đọc
Bệnh nhân chọn một thread để mở nội dung chi tiết.
20.7. Ngoại lệ
Không có cuộc trò chuyện → empty state.
Lỗi tải danh sách → error state.
20.8. Ràng buộc nghiệp vụ
Chỉ hiển thị thread thuộc tài khoản hiện tại.
Preview phải che bớt nội dung nhạy cảm khi cần.
20.9. Bảng dữ liệu liên quan
TinNhanKham
thread chat tổng hợp nếu có

21. Danh sách Hội thoại
21.1. Mục tiêu
Quản lý các hội thoại tự do ngoài lịch hẹn cụ thể.
21.2. Tác nhân
Bệnh nhân đã đăng nhập
21.3. Điều kiện trước
Hệ thống cho phép chat tự do ngoài lịch.
Người nhận hợp lệ.
21.4. Dữ liệu vào
Từ khóa tìm người dùng
Tạo hội thoại mới
Gửi tin nhắn
21.5. Dữ liệu ra
Danh sách hội thoại tự do
Trạng thái mới nhất của từng hội thoại
21.6. Luồng nghiệp vụ chính
Bệnh nhân mở danh sách hội thoại.
Hệ thống hiển thị các cuộc chat không gắn lịch.
Bệnh nhân tìm bác sĩ/người dùng được phép nhắn.
Hệ thống tạo hội thoại mới khi hợp lệ.
Bệnh nhân gửi tin nhắn.
Hệ thống lưu và cập nhật danh sách thread.
21.7. Ngoại lệ
Không tìm thấy người nhận → báo lỗi.
Không được phép tạo chat với đối tượng đó → từ chối.
21.8. Ràng buộc nghiệp vụ
Không nên cho bệnh nhân chat tự do với mọi người dùng nếu không có ràng buộc.
Có thể chỉ mở cho bác sĩ đã từng có lịch hoặc cùng cơ sở.
21.9. Bảng dữ liệu liên quan
Hệ thống chat tổng quát

22. Chat Tổng hợp
22.1. Mục tiêu
Là hub tin nhắn trung tâm, gom các loại chat vào một nơi.
22.2. Tác nhân
Bệnh nhân đã đăng nhập
22.3. Điều kiện trước
Đăng nhập thành công.
22.4. Dữ liệu vào
Chọn tab:
chat với bác sĩ
trợ lý AI
hội thoại khác
Chọn thread cụ thể
22.5. Dữ liệu ra
Danh sách hội thoại theo tab
Nội dung thread
Thao tác tạo cuộc hội thoại mới
22.6. Luồng nghiệp vụ chính
Bệnh nhân mở hub chat.
Hệ thống hiển thị tab chat:
Bác sĩ
AI
khác
Bệnh nhân chọn tab.
Hệ thống tải danh sách thread tương ứng.
Bệnh nhân mở một thread và tương tác.
Nếu chọn AI, có thể chuyển sang màn tư vấn AI hoặc mở thread AI ngay tại hub.
22.7. Ngoại lệ
Không có thread trong tab → empty state.
Không tải được nội dung chat → báo lỗi.
22.8. Ràng buộc nghiệp vụ
Phân tách rõ loại hội thoại.
Không trộn dữ liệu khám bệnh với chat tự do nếu cần compliance.
Sidebar và multi-tab phải tuân AuthGuard và chỉ hiện chức năng hợp lệ.
22.9. Bảng dữ liệu liên quan
TinNhanKham
Lịch sử AI
Thread chat tự do

23. Quản lý Thanh toán
23.1. Mục tiêu
Cho bệnh nhân theo dõi các giao dịch thanh toán/hóa đơn liên quan tới lịch khám.
23.2. Tác nhân
Bệnh nhân đã đăng nhập
23.3. Điều kiện trước
Có hoặc chưa có giao dịch.
23.4. Dữ liệu vào
Bộ lọc:
thành công
thất bại
chờ xử lý
Tìm theo mã giao dịch / mã đơn hàng / lịch hẹn
23.5. Dữ liệu ra
Danh sách giao dịch
Trạng thái
Mã giao dịch
Số tiền
Phương thức
Điều hướng sang thanh toán lại nếu cần
23.6. Luồng nghiệp vụ chính
Bệnh nhân mở màn quản lý thanh toán.
Hệ thống truy vấn ThanhToan theo bệnh nhân.
Hiển thị lịch sử giao dịch:
mã đơn hàng
mã giao dịch
trạng thái
số tiền
thời gian
Nếu có giao dịch thất bại/chờ thanh toán cho lịch hiện hữu:
hiển thị nút thanh toán lại
Bệnh nhân có thể quay lại lịch hẹn để xem ca khám tương ứng.
23.7. Ngoại lệ
Chưa có giao dịch → hiển thị “Chưa có giao dịch”.
Lỗi tải danh sách → error state.
23.8. Ràng buộc nghiệp vụ
Chỉ thấy giao dịch của chính bệnh nhân.
Không cho sửa dữ liệu thanh toán từ UI.
Chỉ cho retry khi trạng thái cho phép.
23.9. Bảng dữ liệu liên quan
ThanhToan
DatLich

24. Xử lý Thanh toán
24.1. Mục tiêu
Là màn xử lý giao dịch cho một lịch khám cụ thể, đóng vai trò cổng thanh toán mô phỏng.
24.2. Tác nhân
Bệnh nhân đã đăng nhập
24.3. Điều kiện trước
Đã có lịch hẹn cần thanh toán.
Lịch chưa được xác nhận hoàn tất thanh toán.
24.4. Dữ liệu vào
appointmentId
Phương thức thanh toán
Thông tin giao dịch mô phỏng
Xác nhận thanh toán
24.5. Dữ liệu ra
Kết quả thanh toán:
thành công
thất bại
hủy
hết hạn
Trạng thái lịch hẹn sau thanh toán
24.6. Luồng nghiệp vụ chính
Sau khi tạo lịch hẹn, nếu cần trả phí, hệ thống chuyển đến màn xử lý thanh toán.
Hiển thị:
thông tin lịch hẹn
bác sĩ
ngày giờ
số tiền
QR / bank info / countdown
Bệnh nhân chọn phương thức và xác nhận thanh toán.
Hệ thống tạo/ghi nhận bản ghi ThanhToan.
Nếu thanh toán thành công:
cập nhật ThanhToan = DA_THANH_TOAN
cập nhật DatLich = DA_XAC_NHAN
Nếu thất bại:
cập nhật ThanhToan = THAT_BAI
lịch vẫn chưa xác nhận
cho retry
Nếu hết thời gian countdown:
cập nhật HET_HAN hoặc DA_HUY.
24.7. Ngoại lệ
Bệnh nhân đóng trang giữa chừng → giao dịch treo/chờ xử lý.
Hết hạn thanh toán → báo hết hạn.
Số tiền không khớp → từ chối xử lý.
24.8. Ràng buộc nghiệp vụ
Một lịch hẹn chỉ được xác nhận khi thanh toán thành công nếu lịch yêu cầu phí.
Không tạo nhiều giao dịch active đồng thời cho cùng một lịch nếu không cần.
Thông tin thanh toán phải được bảo mật, trạng thái rõ ràng.
24.9. Bảng dữ liệu liên quan
DatLich
ThanhToan

25. Hồ sơ bệnh án
25.1. Mục tiêu
Cho bệnh nhân xem kết quả khám, tóm tắt chẩn đoán, hồ sơ và tệp liên quan.
25.2. Tác nhân
Bệnh nhân đã đăng nhập
25.3. Điều kiện trước
Đã có buổi khám hoàn thành và có hồ sơ bệnh án.
25.4. Dữ liệu vào
Chọn hồ sơ cụ thể
Bộ lọc theo thời gian / bác sĩ / loại khám
25.5. Dữ liệu ra
Danh sách hồ sơ bệnh án
Tóm tắt chẩn đoán
Tệp PDF / hồ sơ chi tiết
Đơn thuốc / khuyến nghị nếu có
25.6. Luồng nghiệp vụ chính
Bệnh nhân mở hồ sơ bệnh án.
Hệ thống truy vấn HoSoBenhAn liên kết với các lịch khám của bệnh nhân.
Hiển thị danh sách bệnh án theo thời gian.
Bệnh nhân chọn một hồ sơ.
Hệ thống hiển thị:
triệu chứng
đánh giá bác sĩ
chẩn đoán
kế hoạch điều trị
ghi chú
Nếu có tệp đính kèm/PDF, cho phép xem hoặc tải xuống.
25.7. Ngoại lệ
Chưa có hồ sơ → hiển thị “Bạn chưa có hồ sơ bệnh án nào”.
Tệp không tồn tại / lỗi mở file → báo lỗi.
25.8. Ràng buộc nghiệp vụ
Chỉ bệnh nhân sở hữu hồ sơ mới xem được.
Hồ sơ chỉ xuất hiện sau khi buổi khám hoàn tất và bác sĩ đã cập nhật bệnh án.
Không cho chỉnh sửa hồ sơ bệnh án từ phía bệnh nhân.
25.9. Bảng dữ liệu liên quan
HoSoBenhAn
DatLich
BenhNhan
BacSi
DonThuoc
ChiTietDonThuoc

26. Cài đặt Tài khoản
26.1. Mục tiêu
Cho bệnh nhân chỉnh sửa thông tin cá nhân và thiết lập hồ sơ tài khoản.
26.2. Tác nhân
Bệnh nhân đã đăng nhập
26.3. Điều kiện trước
Đăng nhập thành công.
26.4. Dữ liệu vào
Avatar
Họ tên
Ngày sinh
Địa chỉ
Giới tính
Bio/mô tả
Thông tin liên hệ
26.5. Dữ liệu ra
Hồ sơ tài khoản đã cập nhật
Thông báo thành công/thất bại
26.6. Luồng nghiệp vụ chính
Bệnh nhân mở màn cài đặt tài khoản.
Hệ thống tải dữ liệu hồ sơ hiện tại.
Bệnh nhân chỉnh sửa các trường cho phép.
Hệ thống kiểm tra:
định dạng dữ liệu
ảnh đại diện hợp lệ
ngày sinh hợp lệ
Nếu hợp lệ:
cập nhật NguoiDung
cập nhật BenhNhan nếu có trường mở rộng
Hiển thị thông báo thành công.
26.7. Ngoại lệ
Dữ liệu sai định dạng → báo lỗi.
Ảnh upload lỗi → báo lỗi.
Email/số điện thoại mới bị trùng → báo lỗi nếu cho chỉnh sửa.
26.8. Ràng buộc nghiệp vụ
Chỉ được sửa các trường được cấp quyền.
Một số trường định danh nhạy cảm có thể cần xác minh lại nếu thay đổi.
Ảnh đại diện phải qua kiểm tra định dạng/dung lượng.
26.9. Bảng dữ liệu liên quan
NguoiDung
BenhNhan
