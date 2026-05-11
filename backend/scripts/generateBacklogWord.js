const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, ShadingType } = require('docx');

const backlogData = [
    {
        id: "PB01",
        title: "Xác thực & Tài khoản",
        actor: "Bệnh nhân, Bác sĩ, Nhân viên lễ tân, Quản trị viên",
        desc: "Người dùng thực hiện đăng ký, đăng nhập và khôi phục mật khẩu để truy cập vào các chức năng của hệ thống theo vai trò.",
        criteria: [
            "1. Người dùng có thể đăng ký tài khoản mới qua Email/SĐT.",
            "2. Hệ thống xác thực thông tin đăng nhập chính xác.",
            "3. Hỗ trợ khôi phục mật khẩu qua mã xác minh khi người dùng quên.",
            "4. Đảm bảo tính duy nhất của Email/SĐT trên toàn hệ thống."
        ],
        pre: "Người dùng có thiết bị kết nối internet.",
        constraints: "Mật khẩu phải được mã hóa và tuân thủ quy tắc bảo mật."
    },
    {
        id: "PB02",
        title: "Quản lý hồ sơ người dùng",
        actor: "Bệnh nhân",
        desc: "Bệnh nhân cập nhật và quản lý thông tin cá nhân như ảnh đại diện, địa chỉ, ngày sinh để hồ sơ luôn chính xác.",
        criteria: [
            "1. Người dùng có thể chỉnh sửa các thông tin cơ bản.",
            "2. Hệ thống lưu trữ và hiển thị thông tin cập nhật ngay lập tức.",
            "3. Kiểm tra tính hợp lệ của định dạng dữ liệu đầu vào."
        ],
        pre: "Người dùng đã đăng nhập thành công.",
        constraints: "Chỉ các trường thông tin được phép mới có thể chỉnh sửa."
    },
    {
        id: "PB03",
        title: "Quản lý bác sĩ",
        actor: "Bệnh nhân, Nhân viên lễ tân",
        desc: "Người dùng tra cứu danh sách bác sĩ, xem hồ sơ chi tiết, chuyên khoa, kinh nghiệm và đánh giá để lựa chọn phù hợp.",
        criteria: [
            "1. Tìm kiếm bác sĩ theo chuyên khoa, tên hoặc cơ sở y tế.",
            "2. Hiển thị thông tin chi tiết: bằng cấp, phí khám, lịch trống.",
            "3. Cho phép xem các đánh giá từ bệnh nhân khác."
        ],
        pre: "Hồ sơ bác sĩ đã được Quản trị viên kích hoạt.",
        constraints: "Chỉ hiển thị các bác sĩ đang ở trạng thái hoạt động."
    },
    {
        id: "PB04",
        title: "Quản lý lịch khám",
        actor: "Bệnh nhân, Nhân viên lễ tân",
        desc: "Bệnh nhân đặt lịch khám trực tuyến hoặc đặt lịch nhanh. Nhân viên hỗ trợ đặt lịch cho bệnh nhân tại quầy.",
        criteria: [
            "1. Chọn bác sĩ, ngày khám và khung giờ còn trống.",
            "2. Hỗ trợ hình thức đặt lịch vãng lai (Guest booking).",
            "3. Hệ thống kiểm tra trùng lặp và xác nhận lịch hẹn thành công.",
            "4. Cho phép thay đổi (đổi giờ) lịch hẹn nếu đáp ứng chính sách."
        ],
        pre: "Bác sĩ đã thiết lập lịch làm việc.",
        constraints: "Không được đặt vào khung giờ đã có người hoặc ngoài giờ làm việc."
    },
    {
        id: "PB05",
        title: "Thanh toán & xử lý lịch hẹn",
        actor: "Bệnh nhân, Nhân viên lễ tân",
        desc: "Thực hiện thanh toán phí khám online hoặc xác nhận thanh toán tại quầy. Xử lý việc hủy lịch và liên kết lịch hẹn khách.",
        criteria: [
            "1. Hỗ trợ đa dạng phương thức thanh toán (Thẻ, ví điện tử, tiền mặt).",
            "2. Cập nhật trạng thái 'Đã thanh toán' ngay sau khi giao dịch thành công.",
            "3. Cho phép hủy lịch và thực hiện quy trình hoàn phí nếu có.",
            "4. Liên kết lịch hẹn vãng lai vào tài khoản chính thức."
        ],
        pre: "Lịch hẹn đã được tạo ở trạng thái chờ thanh toán.",
        constraints: "Giao dịch tài chính phải được lưu vết và bảo mật tuyệt đối."
    },
    {
        id: "PB06",
        title: "Nhắc lịch & thông báo",
        actor: "Bệnh nhân, Bác sĩ",
        desc: "Hệ thống tự động gửi thông báo nhắc lịch khám, thông báo thay đổi hoặc tin nhắn hệ thống đến người dùng.",
        criteria: [
            "1. Gửi thông báo nhắc lịch trước giờ khám (ví dụ: 30 phút, 1 ngày).",
            "2. Hiển thị thông báo trong ứng dụng và gửi qua Email/SMS.",
            "3. Người dùng có thể quản lý trạng thái bật/tắt thông báo."
        ],
        pre: "Người dùng có lịch hẹn sắp diễn ra hoặc sự kiện hệ thống.",
        constraints: "Thông báo phải gửi đúng đối tượng và đúng thời điểm."
    },
    {
        id: "PB07",
        title: "AI & hỗ trợ thông minh",
        actor: "Bệnh nhân",
        desc: "Sử dụng AI để chat tư vấn sơ bộ, gợi ý chuyên khoa, gợi ý cơ sở y tế gần nhất và cung cấp chỉ đường.",
        criteria: [
            "1. Phân tích triệu chứng người dùng nhập vào để gợi ý chuyên khoa.",
            "2. Chatbot phản hồi các thắc mắc y tế cơ bản 24/7.",
            "3. Gợi ý cơ sở y tế dựa trên vị trí địa lý của bệnh nhân.",
            "4. Hiển thị bản đồ chỉ đường đến cơ sở đã chọn."
        ],
        pre: "Người dùng cung cấp mô tả triệu chứng hoặc vị trí.",
        constraints: "Kết quả AI chỉ mang tính tham khảo, không thay thế chẩn đoán bác sĩ."
    },
    {
        id: "PB08",
        title: "Tư vấn & khám trực tuyến",
        actor: "Bệnh nhân, Bác sĩ",
        desc: "Thực hiện buổi khám qua Video Call trực tiếp giữa bác sĩ và bệnh nhân theo lịch hẹn.",
        criteria: [
            "1. Kết nối video và âm thanh ổn định, chất lượng cao.",
            "2. Hỗ trợ chia sẻ tài liệu/hình ảnh trong lúc tư vấn.",
            "3. Đảm bảo tính bảo mật và riêng tư cho phòng khám trực tuyến."
        ],
        pre: "Đến giờ hẹn và cả hai bên cùng tham gia phòng khám.",
        constraints: "Yêu cầu kết nối mạng ổn định và quyền truy cập camera/micro."
    },
    {
        id: "PB09",
        title: "Quản lý lịch làm việc bác sĩ",
        actor: "Bác sĩ, Quản trị viên",
        desc: "Bác sĩ tự thiết lập khung giờ làm việc theo tuần/tháng. Quản trị viên hỗ trợ cấu hình nếu cần.",
        criteria: [
            "1. Cho phép thêm mới, chỉnh sửa hoặc khóa khung giờ khám.",
            "2. Tự động đồng bộ lịch làm việc với chức năng đặt lịch của bệnh nhân.",
            "3. Kiểm tra tính hợp lệ và tránh trùng lặp thời gian."
        ],
        pre: "Tài khoản bác sĩ đã được kích hoạt trên hệ thống.",
        constraints: "Mọi thay đổi lịch phải được cập nhật ngay lập tức."
    },
    {
        id: "PB10",
        title: "Quản lý khám & bệnh nhân (Doctor)",
        actor: "Bác sĩ",
        desc: "Bác sĩ xem danh sách lịch khám, xem hồ sơ bệnh nhân, cập nhật chẩn đoán, ghi chú điều trị và đơn thuốc.",
        criteria: [
            "1. Hiển thị danh sách bệnh nhân chờ khám trong ngày.",
            "2. Truy cập xem tiền sử bệnh án và các lần khám trước của bệnh nhân.",
            "3. Nhập và lưu kết quả tư vấn vào hồ sơ y tế điện tử."
        ],
        pre: "Bác sĩ đã đăng nhập và có lịch hẹn với bệnh nhân.",
        constraints: "Chỉ bác sĩ phụ trách mới được xem/sửa hồ sơ bệnh nhân tương ứng."
    },
    {
        id: "PB11",
        title: "Quản lý chuyên khoa",
        actor: "Quản trị viên",
        desc: "Quản trị viên quản lý danh mục các chuyên khoa trong hệ thống (Thêm, sửa, ẩn/hiện).",
        criteria: [
            "1. Cập nhật thông tin mô tả và biểu tượng chuyên khoa.",
            "2. Gán bác sĩ vào các chuyên khoa tương ứng.",
            "3. Đảm bảo tính toàn vẹn dữ liệu khi có thay đổi chuyên khoa."
        ],
        pre: "Quản trị viên đăng nhập vào trang quản trị.",
        constraints: "Không xóa chuyên khoa đang có bác sĩ hoạt động."
    },
    {
        id: "PB12",
        title: "Quản lý tài khoản hệ thống",
        actor: "Quản trị viên",
        desc: "Quản lý tập trung toàn bộ tài khoản bác sĩ, bệnh nhân và nhân viên (Kích hoạt, khóa, phân quyền).",
        criteria: [
            "1. Tìm kiếm và lọc danh sách người dùng theo vai trò/trạng thái.",
            "2. Thực hiện khóa tài khoản vi phạm chính sách.",
            "3. Kiểm tra thông tin định danh của bác sĩ trước khi kích hoạt."
        ],
        pre: "Tài khoản có quyền quản trị cao nhất.",
        constraints: "Mọi thao tác thay đổi trạng thái tài khoản phải được lưu vết."
    },
    {
        id: "PB13",
        title: "Báo cáo & thống kê",
        actor: "Quản trị viên",
        desc: "Tổng hợp dữ liệu về doanh thu, số lượng lịch khám, tỷ lệ hủy lịch và hiệu suất hoạt động theo thời gian.",
        criteria: [
            "1. Xuất báo cáo theo ngày/tháng/năm hoặc theo cơ sở y tế.",
            "2. Hiển thị dữ liệu dưới dạng biểu đồ trực quan.",
            "3. Cung cấp số liệu chính xác để phục vụ việc ra quyết định."
        ],
        pre: "Hệ thống đã có dữ liệu giao dịch và lịch khám.",
        constraints: "Chỉ người có thẩm quyền mới được truy cập dữ liệu báo cáo."
    },
    {
        id: "PB14",
        title: "Quản lý cơ sở y tế",
        actor: "Quản trị viên",
        desc: "Quản trị thông tin danh sách các cơ sở y tế tham gia hệ thống (Địa chỉ, thông tin liên hệ, quy mô).",
        criteria: [
            "1. Thêm mới hoặc cập nhật thông tin chi tiết cơ sở.",
            "2. Quản lý trạng thái hoạt động (Mở cửa/Đóng cửa/Tạm ngưng).",
            "3. Đồng bộ thông tin cơ sở lên bản đồ tìm kiếm của bệnh nhân."
        ],
        pre: "Thông tin cơ sở y tế đã được xác thực pháp lý.",
        constraints: "Mỗi cơ sở phải có thông tin định vị chính xác."
    },
    {
        id: "PB15",
        title: "Phân bổ nhân sự",
        actor: "Quản trị viên",
        desc: "Gán bác sĩ và nhân viên lễ tân vào làm việc tại các cơ sở y tế cụ thể (Multi-tenant config).",
        criteria: [
            "1. Một nhân sự có thể được gán vào một hoặc nhiều cơ sở.",
            "2. Hệ thống kiểm soát quyền truy cập dữ liệu theo phạm vi cơ sở được gán.",
            "3. Dễ dàng luân chuyển nhân sự giữa các chi nhánh."
        ],
        pre: "Tài khoản nhân sự và cơ sở y tế đã tồn tại.",
        constraints: "Đảm bảo tính cách ly dữ liệu giữa các cơ sở y tế khác nhau."
    },
    {
        id: "PB16",
        title: "Quản lý quy trình tại quầy",
        actor: "Nhân viên lễ tân",
        desc: "Thực hiện tiếp nhận bệnh nhân, check-in vào hàng đợi khám và điều phối số thứ tự trực tiếp.",
        criteria: [
            "1. Tra cứu nhanh lịch hẹn của bệnh nhân khi đến cơ sở.",
            "2. Cập nhật trạng thái 'Đã đến/Check-in' để bác sĩ biết.",
            "3. Quản lý và điều phối hàng đợi đảm bảo trật tự khám bệnh."
        ],
        pre: "Bệnh nhân có lịch hẹn hoặc đến đăng ký trực tiếp.",
        constraints: "Đồng bộ dữ liệu hàng đợi thời gian thực với bác sĩ."
    },
    {
        id: "PB17",
        title: "Hỗ trợ tại cơ sở",
        actor: "Nhân viên lễ tân",
        desc: "Sử dụng Dashboard vận hành để theo dõi tình hình khám, hỗ trợ chat hành chính và xử lý ca AI triage chờ điều phối.",
        criteria: [
            "1. Dashboard hiển thị tổng quan số ca chờ, đang khám tại cơ sở.",
            "2. Trả lời tin nhắn hỗ trợ bệnh nhân về quy trình hành chính.",
            "3. Tiếp nhận các ca gợi ý từ AI để hướng dẫn bệnh nhân đặt lịch đúng chuyên khoa."
        ],
        pre: "Nhân viên đã được gán vào cơ sở tương ứng.",
        constraints: "Không can thiệp vào các quyết định mang tính chuyên môn y tế."
    },
    {
        id: "PB18",
        title: "Tìm kiếm & lịch sử",
        actor: "Bệnh nhân, Bác sĩ",
        desc: "Tra cứu lịch sử các lần khám trước đó, đơn thuốc và ghi chú để theo dõi quá trình điều trị.",
        criteria: [
            "1. Bệnh nhân xem lịch sử khám của cá nhân.",
            "2. Bác sĩ xem lịch sử khám của bệnh nhân có liên quan.",
            "3. Hỗ trợ lọc lịch sử theo thời gian hoặc theo bác sĩ/bệnh nhân."
        ],
        pre: "Dữ liệu lịch khám đã được lưu vào hệ thống.",
        constraints: "Tuân thủ nghiêm ngặt chính sách bảo mật thông tin y tế cá nhân."
    }
];

async function generateDoc() {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: "PRODUCT BACKLOG - HỆ THỐNG MEDISCHED AI (PHIÊN BẢN HỢP NHẤT)",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    text: "Danh sách 18 chức năng gộp hóa và gắn tác nhân",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),

                ...backlogData.flatMap(item => [
                    new Paragraph({
                        text: `${item.id} - ${item.title}`,
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 300, after: 100 }
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ 
                                        children: [new Paragraph({ children: [new TextRun({ text: "ID", bold: true })] })], 
                                        width: { size: 25, type: WidthType.PERCENTAGE },
                                        shading: { fill: "D9E2F3", type: ShadingType.CLEAR }
                                    }),
                                    new TableCell({ children: [new Paragraph({ text: item.id })], width: { size: 75, type: WidthType.PERCENTAGE } }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ 
                                        children: [new Paragraph({ children: [new TextRun({ text: "Tác nhân", bold: true })] })],
                                        shading: { fill: "D9E2F3", type: ShadingType.CLEAR }
                                    }),
                                    new TableCell({ children: [new Paragraph({ text: item.actor })] }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ 
                                        children: [new Paragraph({ children: [new TextRun({ text: "Mô tả", bold: true })] })],
                                        shading: { fill: "D9E2F3", type: ShadingType.CLEAR }
                                    }),
                                    new TableCell({ children: [new Paragraph({ text: item.desc })] }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ 
                                        children: [new Paragraph({ children: [new TextRun({ text: "Tiêu chí chấp nhận", bold: true })] })],
                                        shading: { fill: "D9E2F3", type: ShadingType.CLEAR }
                                    }),
                                    new TableCell({ children: item.criteria.map(c => new Paragraph({ text: c })) }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ 
                                        children: [new Paragraph({ children: [new TextRun({ text: "Điều kiện trước", bold: true })] })],
                                        shading: { fill: "D9E2F3", type: ShadingType.CLEAR }
                                    }),
                                    new TableCell({ children: [new Paragraph({ text: item.pre })] }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ 
                                        children: [new Paragraph({ children: [new TextRun({ text: "Điều kiện ràng buộc", bold: true })] })],
                                        shading: { fill: "D9E2F3", type: ShadingType.CLEAR }
                                    }),
                                    new TableCell({ children: [new Paragraph({ text: item.constraints })] }),
                                ],
                            }),
                        ],
                    }),
                    new Paragraph({ text: "", spacing: { after: 200 } })
                ])
            ],
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync("Product_Backlog_MediSched_AI_18_Items.docx", buffer);
    console.log("Document created successfully: Product_Backlog_MediSched_AI_18_Items.docx");
}

generateDoc().catch(console.error);
