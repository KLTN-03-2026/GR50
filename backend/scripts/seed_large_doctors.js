const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { 
    sequelize, 
    VaiTro, 
    NguoiDung, 
    NguoiDung_VaiTro, 
    BacSi, 
    ChuyenKhoa, 
    PhongKham, 
    BacSi_PhongKham 
} = require('../models');

// Vietnamese Name Generators
const hoNam = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const demNam = ['Văn', 'Hữu', 'Đức', 'Nhật', 'Minh', 'Quang', 'Bá', 'Đình', 'Xuân', 'Hải'];
const tenNam = ['Hùng', 'Dũng', 'Đạt', 'Kiên', 'Cường', 'Tuấn', 'Phong', 'Hải', 'Lâm', 'Sơn', 'Quân', 'Phát', 'Huy', 'Hoàng', 'Bình', 'Long', 'Anh', 'Tài', 'Thành', 'Thắng'];

const hoNu = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const demNu = ['Thị', 'Ngọc', 'Thu', 'Thanh', 'Xuân', 'Kim', 'Bảo', 'Hoài', 'Thảo', 'Bích'];
const tenNu = ['Lan', 'Mai', 'Hoa', 'Thảo', 'Linh', 'Trang', 'Nhung', 'Phương', 'Hà', 'Hiền', 'Yến', 'Quỳnh', 'Nga', 'My', 'Tiên', 'Trâm', 'Ngân', 'Vy', 'Oanh', 'Châu'];

const chuyenKhoaList = [
    'Tim mạch', 'Cơ Xương Khớp', 'Tiêu hóa', 'Nhi khoa', 'Da liễu', 
    'Nội thần kinh', 'Ngoại tổng quát', 'Sản phụ khoa', 'Nhãn khoa', 'Tai Mũi Họng',
    'Nha khoa', 'Tâm lý', 'Nam khoa', 'Dinh dưỡng', 'Hô hấp'
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDoctor(gender, index) {
    const isMale = gender === 'Nam';
    const ho = isMale ? hoNam[getRandomInt(0, hoNam.length - 1)] : hoNu[getRandomInt(0, hoNu.length - 1)];
    const dem = isMale ? demNam[getRandomInt(0, demNam.length - 1)] : demNu[getRandomInt(0, demNu.length - 1)];
    const ten = isMale ? tenNam[getRandomInt(0, tenNam.length - 1)] : tenNu[getRandomInt(0, tenNu.length - 1)];
    
    const first_name = `${ho} ${dem}`;
    const last_name = ten;
    const full_name = `${first_name} ${last_name}`;
    
    const emailStr = `${ho}${dem}${ten}${index}@medisched.com`.toLowerCase().replace(/ /g, '').replace(/đ/g, 'd');
    const phone = `09${getRandomInt(10000000, 99999999)}`;
    const specialty = chuyenKhoaList[getRandomInt(0, chuyenKhoaList.length - 1)];
    const experience = getRandomInt(5, 35);
    const fee = getRandomInt(2, 10) * 100000;
    
    // Use DiceBear micah 3D icons for unique modern avatars
    const uniqueSeed = `Doc_${index}_${Date.now()}`;
    const avatar = `https://api.dicebear.com/9.x/micah/svg?seed=${uniqueSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf`;

    const bio = `Bác sĩ ${full_name} có ${experience} năm kinh nghiệm trong lĩnh vực ${specialty}, chuyên khám và điều trị các bệnh lý liên quan. Bác sĩ hỗ trợ tư vấn trực tiếp và trực tuyến, chú trọng chẩn đoán chính xác, theo dõi sát và hướng dẫn điều trị rõ ràng cho người bệnh. Luôn tận tâm vì sức khỏe cộng đồng.`;

    return {
        email: emailStr,
        phone,
        first_name,
        last_name,
        gender,
        specialty,
        bio,
        experience,
        fee,
        avatar
    };
}

async function seedLargeDoctors() {
    try {
        console.log('Connecting to DB...');
        await sequelize.authenticate();
        console.log('Connected!');

        const [doctorRole] = await VaiTro.findOrCreate({
            where: { MaVaiTro: 'doctor' },
            defaults: { TenVaiTro: 'Bác sĩ' }
        });

        // Get all active facilities
        const facilities = await PhongKham.findAll();
        if (facilities.length === 0) {
            console.log('No facilities found. Please create facilities first.');
            process.exit(1);
        }

        console.log(`Found ${facilities.length} facilities. Generating 60 doctors per facility...`);

        const passwordHash = await bcrypt.hash('123456', 10);
        let globalDoctorIndex = 0;

        for (const facility of facilities) {
            const doctorsCount = getRandomInt(50, 70); // 50-70 doctors per facility
            console.log(`\nGenerating ${doctorsCount} doctors for ${facility.TenPhongKham}...`);

            const doctorRecords = [];
            for (let i = 0; i < doctorsCount; i++) {
                globalDoctorIndex++;
                const gender = Math.random() > 0.5 ? 'Nam' : 'Nu';
                const docData = generateDoctor(gender, globalDoctorIndex);

                // Ensure specialty
                const [specialty] = await ChuyenKhoa.findOrCreate({
                    where: { TenChuyenKhoa: docData.specialty },
                    defaults: { MoTa: 'Chuyên khoa ' + docData.specialty }
                });

                // Create User
                const user = await NguoiDung.create({
                    Ho: docData.first_name,
                    Ten: docData.last_name,
                    Email: docData.email,
                    MatKhau: passwordHash,
                    SoDienThoai: docData.phone,
                    GioiTinh: docData.gender,
                    AnhDaiDien: docData.avatar,
                    KichHoat: 1
                });

                // Assign Role
                await NguoiDung_VaiTro.create({
                    Id_NguoiDung: user.Id_NguoiDung,
                    Id_VaiTro: doctorRole.Id_VaiTro
                });

                // Create Doctor
                const doctor = await BacSi.create({
                    Id_NguoiDung: user.Id_NguoiDung,
                    Id_ChuyenKhoa: specialty.Id_ChuyenKhoa,
                    SoNamKinhNghiem: docData.experience,
                    PhiTuVan: docData.fee,
                    GioiThieu: docData.bio,
                    TrangThai: 'HoatDong'
                });

                // Assign to current facility
                await BacSi_PhongKham.create({
                    doctor_id: doctor.Id_BacSi,
                    facility_id: facility.Id_PhongKham,
                    is_primary: true,
                    consultation_fee_offline: docData.fee,
                    consultation_fee_online: docData.fee,
                    is_active: true
                });

                // Optionally assign 10% of doctors to a second random facility
                if (Math.random() < 0.1 && facilities.length > 1) {
                    let secondFac;
                    do {
                        secondFac = facilities[getRandomInt(0, facilities.length - 1)];
                    } while (secondFac.Id_PhongKham === facility.Id_PhongKham);

                    await BacSi_PhongKham.create({
                        doctor_id: doctor.Id_BacSi,
                        facility_id: secondFac.Id_PhongKham,
                        is_primary: false,
                        consultation_fee_offline: docData.fee,
                        consultation_fee_online: docData.fee,
                        is_active: true
                    });
                }
            }
            console.log(`✓ Completed ${doctorsCount} doctors for ${facility.TenPhongKham}`);
        }

        console.log(`\n🎉 Mass Seeding completed successfully! Total doctors added: ${globalDoctorIndex}`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedLargeDoctors();
