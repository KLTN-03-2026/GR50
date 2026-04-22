require('dotenv').config();
const { sequelize, NguoiDung, BacSi, PhongKham, ChuyenKhoa, VaiTro, NguoiDung_VaiTro } = require('./models');
const bcrypt = require('bcryptjs');
const { fakerVI: faker } = require('@faker-js/faker');

const seedData = async () => {
    try {
        console.log('Starting seed process for 150 Da Nang doctors...');

        // Ensure DB schema is up to date (add Id_PhongKham if missing)
        await sequelize.sync({ alter: true });
        console.log('Database synced.');

        // 1. Ensure Role
        const [doctorRole] = await VaiTro.findOrCreate({
            where: { MaVaiTro: 'doctor' },
            defaults: { TenVaiTro: 'Bác sĩ', MoTa: 'Chẩn đoán và khám bệnh' }
        });

        // 2. Define Real Clinics in Da Nang
        const clinicsData = [
            { TenPhongKham: 'Bệnh viện Đa khoa Đà Nẵng', DiaChi: '124 Hải Phòng, Thạch Thang, Hải Châu, Đà Nẵng', SoDienThoai: '02363821118' },
            { TenPhongKham: 'Bệnh viện Hoàn Mỹ Đà Nẵng', DiaChi: '291 Nguyễn Văn Linh, Thạc Gián, Thanh Khê, Đà Nẵng', SoDienThoai: '02363650676' },
            { TenPhongKham: 'Bệnh viện Gia Đình (Family Hospital)', DiaChi: '73 Nguyễn Hữu Thọ, Hòa Thuận Nam, Hải Châu, Đà Nẵng', SoDienThoai: '19002250' },
            { TenPhongKham: 'Bệnh viện Vinmec Đà Nẵng', DiaChi: 'Đường 30 Tháng 4, Khu dân cư số 4 Nguyễn Tri Phương, Hòa Cường Bắc, Hải Châu, Đà Nẵng', SoDienThoai: '02363711111' },
            { TenPhongKham: 'Bệnh viện C Đà Nẵng', DiaChi: '74 Hải Phòng, Thạch Thang, Hải Châu, Đà Nẵng', SoDienThoai: '02363821480' },
            { TenPhongKham: 'Phòng khám Đa khoa Pasteur Đà Nẵng', DiaChi: '19 Nguyễn Tường Tộ, Hòa Cường Bắc, Hải Châu, Đà Nẵng', SoDienThoai: '02363811868' },
            { TenPhongKham: 'Trung tâm Y tế Quận Sơn Trà', DiaChi: '1111 Ngô Quyền, An Hải Bắc, Sơn Trà, Đà Nẵng', SoDienThoai: '02363831215' }
        ];

        const clinics = [];
        for (const data of clinicsData) {
            const [clinic] = await PhongKham.findOrCreate({ where: { TenPhongKham: data.TenPhongKham }, defaults: data });
            clinics.push(clinic);
        }

        // 3. Ensure Specialties
        const specialtiesData = [
            { TenChuyenKhoa: 'Nội tổng quát', MoTa: 'Khám và điều trị các bệnh lý nội khoa.' },
            { TenChuyenKhoa: 'Ngoại tổng quát', MoTa: 'Phẫu thuật và điều trị các bệnh lý ngoại khoa.' },
            { TenChuyenKhoa: 'Sản phụ khoa', MoTa: 'Chăm sóc sức khỏe phụ nữ và thai sản.' },
            { TenChuyenKhoa: 'Nhi khoa', MoTa: 'Chăm sóc sức khỏe trẻ em.' },
            { TenChuyenKhoa: 'Tim mạch', MoTa: 'Bệnh lý về tim và mạch máu.' },
            { TenChuyenKhoa: 'Cơ xương khớp', MoTa: 'Bệnh lý về hệ vận động.' },
            { TenChuyenKhoa: 'Da liễu', MoTa: 'Bệnh lý về da và thẩm mỹ da.' },
            { TenChuyenKhoa: 'Mắt', MoTa: 'Khám và điều trị các bệnh về mắt.' },
            { TenChuyenKhoa: 'Tai Mũi Họng', MoTa: 'Khám và điều trị các bệnh TMH.' },
            { TenChuyenKhoa: 'Răng Hàm Mặt', MoTa: 'Chăm sóc sức khỏe răng miệng.' }
        ];
        const specialties = [];
        for (const data of specialtiesData) {
            const [specialty] = await ChuyenKhoa.findOrCreate({ where: { TenChuyenKhoa: data.TenChuyenKhoa }, defaults: data });
            specialties.push(specialty);
        }

        const hashedPassword = await bcrypt.hash('123456', 10);

        // 4. Generate 150 Doctors
        console.log('Inserting 150 doctors...');
        for (let i = 1; i <= 150; i++) {
            const gender = faker.person.sexType();
            const firstName = faker.person.firstName(gender);
            const lastName = faker.person.lastName(gender);
            const fullName = `${lastName} ${firstName}`;
            const email = `doctor.dn${i}${faker.string.alphanumeric(3).toLowerCase()}@medisched.ai`;

            const avatarArray = gender === 'male' ? ['/uploads/avatars/m1.png', '/uploads/avatars/m2.png'] : ['/uploads/avatars/f1.png', '/uploads/avatars/f2.png'];
            const avatarFile = avatarArray[Math.floor(Math.random() * avatarArray.length)];

            const user = await NguoiDung.create({
                Ho: lastName,
                Ten: firstName,
                Email: email,
                MatKhau: hashedPassword,
                SoDienThoai: faker.phone.number({ style: 'national' }).replace(/\s/g, ''),
                AnhDaiDien: avatarFile,
                TrangThai: 'HoatDong'
            });

            await NguoiDung_VaiTro.create({
                Id_NguoiDung: user.Id_NguoiDung,
                Id_VaiTro: doctorRole.Id_VaiTro
            });

            const clinic = clinics[Math.floor(Math.random() * clinics.length)];
            const specialty = specialties[Math.floor(Math.random() * specialties.length)];
            const hocVitxt = faker.helpers.arrayElement(['Thạc sĩ, Bác sĩ', 'Bác sĩ CKI', 'Bác sĩ CKII', 'TS.BS']);

            await BacSi.create({
                Id_NguoiDung: user.Id_NguoiDung,
                Id_ChuyenKhoa: specialty.Id_ChuyenKhoa,
                Id_PhongKham: clinic.Id_PhongKham,
                SoChungChiHanhNghe: `CCHN-${faker.string.numeric(6)}`,
                SoNamKinhNghiem: faker.number.int({ min: 5, max: 35 }),
                PhiTuVan: faker.helpers.arrayElement([150000, 200000, 300000, 500000]),
                GioiThieu: `Bác sĩ ${fullName} là chuyên gia đầu ngành trong lĩnh vực ${specialty.TenChuyenKhoa}, hiện đang công tác tại ${clinic.TenPhongKham}.`,
                HocHamHocVi: hocVitxt,
                NoiLamViec: clinic.TenPhongKham,
                TrangThai: 'HoatDong'
            });

            if (i % 30 === 0) console.log(`Processed ${i} doctors...`);
        }

        console.log('Seeding completed successfully! 150 doctors added to Da Nang facilities.');
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
};

seedData();
