
const { NguoiDung, BenhNhan, BacSi, DanhGia, VaiTro, NguoiDung_VaiTro } = require('../models');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const hoArray = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const demArray = ['Thị', 'Văn', 'Minh', 'Anh', 'Hồng', 'Ngọc', 'Kim', 'Thanh', 'Đức', 'Xuân'];
const tenArray = ['Lan', 'Hùng', 'Hương', 'Dũng', 'Trang', 'Sơn', 'Linh', 'Tùng', 'Hoa', 'Hải', 'Mai', 'Tuấn', 'Thủy', 'Phúc', 'Oanh'];

const positiveReviews = [
    "Bác sĩ rất nhiệt tình và chu đáo. Tôi rất hài lòng với kết quả điều trị.",
    "Tư vấn rất kỹ lưỡng, giải thích dễ hiểu. Cảm ơn bác sĩ nhiều!",
    "Bác sĩ có tâm, chuyên môn giỏi. Phòng khám sạch sẽ, hiện đại.",
    "Thái độ phục vụ của bác sĩ và nhân viên đều rất tốt.",
    "Tôi đã bớt bệnh sau lần khám đầu tiên. Bác sĩ kê đơn thuốc rất hiệu quả.",
    "Rất yên tâm khi được bác sĩ thăm khám. Chuyên môn cực kỳ vững.",
    "Bác sĩ nhẹ nhàng, tâm lý. Giải đáp mọi thắc mắc của bệnh nhân.",
    "Dịch vụ tốt, đặt lịch nhanh chóng. Bác sĩ đến đúng giờ.",
    "Rất hài lòng về cách làm việc chuyên nghiệp của bác sĩ.",
    "Bác sĩ giỏi, tư vấn rất tận tình. Sẽ quay lại nếu cần.",
    "Cảm ơn bác sĩ đã giúp tôi tìm ra nguyên nhân bệnh mà bấy lâu nay không biết.",
    "Khám bệnh rất kỹ, không hề qua loa. Rất đáng tin cậy.",
    "Bác sĩ vui tính, làm giảm bớt căng thẳng cho bệnh nhân.",
    "Chuyên môn cao, chẩn đoán bệnh rất chính xác.",
    "Bác sĩ theo dõi tình trạng bệnh nhân rất sát sao."
];

const neutralReviews = [
    "Bác sĩ khám ổn, nhưng phải chờ hơi lâu một chút.",
    "Dịch vụ bình thường, bác sĩ tư vấn hơi nhanh.",
    "Mọi thứ đều ổn, giá cả hơi cao so với mặt bằng chung.",
    "Bác sĩ chuyên môn tốt nhưng phòng khám hơi đông người.",
    "Tư vấn được, nhưng tôi muốn được giải thích kỹ hơn về tác dụng phụ của thuốc."
];

async function seedReviews() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const patientRole = await VaiTro.findOne({ where: { MaVaiTro: 'patient' } });
        const doctors = await BacSi.findAll();
        const existingPatients = await BenhNhan.findAll();
        
        let allPatients = [...existingPatients];

        // Create 50 more patients
        console.log('Creating 50 more patients...');
        const hashedPassword = await bcrypt.hash('123456', 10);
        for (let i = 0; i < 50; i++) {
            const ho = hoArray[Math.floor(Math.random() * hoArray.length)];
            const dem = demArray[Math.floor(Math.random() * demArray.length)];
            const ten = tenArray[Math.floor(Math.random() * tenArray.length)];
            const fullName = `${ho} ${dem} ${ten}`;
            const email = `patient_extra_${i}_${Date.now()}@gmail.com`;
            
            const user = await NguoiDung.create({
                Ho: ho,
                Ten: `${dem} ${ten}`,
                Email: email,
                MatKhau: hashedPassword,
                SoDienThoai: `03${Math.floor(10000000 + Math.random() * 90000000)}`,
                TrangThai: 'HoatDong'
            });

            if (patientRole) {
                await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: patientRole.Id_VaiTro });
            }

            const patient = await BenhNhan.create({
                Id_NguoiDung: user.Id_NguoiDung,
                SoDienThoaiLienHe: user.SoDienThoai
            });
            allPatients.push(patient);
        }

        console.log(`Total patients: ${allPatients.length}. Starting to add reviews...`);

        // Add 500 reviews distributed among doctors
        const totalReviews = 500;
        for (let i = 0; i < totalReviews; i++) {
            const doctor = doctors[Math.floor(Math.random() * doctors.length)];
            const patient = allPatients[Math.floor(Math.random() * allPatients.length)];
            
            const isPositive = Math.random() > 0.1; // 90% positive reviews
            const star = isPositive ? (Math.floor(Math.random() * 2) + 4) : (Math.floor(Math.random() * 3) + 1);
            const commentList = isPositive ? positiveReviews : neutralReviews;
            const comment = commentList[Math.floor(Math.random() * commentList.length)];

            await DanhGia.create({
                Id_BacSi: doctor.Id_BacSi,
                Id_BenhNhan: patient.Id_BenhNhan,
                SoSao: star,
                BinhLuan: comment,
                NgayTao: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) // Random date in last 30 days
            });

            if ((i + 1) % 50 === 0) {
                console.log(`Added ${i + 1} reviews...`);
            }
        }

        console.log('Seed reviews completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding reviews:', error);
        process.exit(1);
    }
}

seedReviews();
