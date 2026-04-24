const models = require('../models');
const bcrypt = require('bcryptjs');

const surnames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const middleNames = ['Văn', 'Thị', 'Xuân', 'Hải', 'Minh', 'Anh', 'Đức', 'Hồng', 'Phương', 'Bảo', 'Gia', 'Thanh'];
const lastNames = ['Nam', 'Lan', 'Hương', 'Hùng', 'Dũng', 'Ngọc', 'Linh', 'Thảo', 'Tuấn', 'Cường', 'Quân', 'Trang', 'Tuyết', 'Sơn', 'Tùng', 'Hà', 'Phúc'];

const degrees = ['Thạc sĩ, Bác sĩ', 'Tiến sĩ, Bác sĩ', 'Bác sĩ chuyên khoa I', 'Bác sĩ chuyên khoa II', 'GS.TS. Bác sĩ', 'PGS.TS. Bác sĩ'];

async function seed() {
    try {
        await models.sequelize.authenticate();
        console.log('Connected to database.');

        const hashedPassword = await bcrypt.hash('123456', 10);
        const specialties = await models.ChuyenKhoa.findAll();
        const facilities = await models.PhongKham.findAll();

        if (specialties.length === 0 || facilities.length === 0) {
            console.error('No specialties or facilities found. Please seed them first.');
            return;
        }

        console.log(`Starting to seed 500 doctors...`);

        for (let i = 0; i < 500; i++) {
            try {
                const sur = surnames[Math.floor(Math.random() * surnames.length)];
                const mid = middleNames[Math.floor(Math.random() * middleNames.length)];
                const last = lastNames[Math.floor(Math.random() * lastNames.length)];
                const fullName = `${sur} ${mid} ${last}`;
                
                const uniqueSuffix = Math.random().toString(36).substring(2, 8);
                const email = `doc_${i}_${uniqueSuffix}@medisched.ai`;
                const phone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;
                const gender = mid === 'Thị' ? 'Nu' : 'Nam';
                
                const avatar = `https://api.dicebear.com/7.x/micah/svg?seed=doc_${i}_${uniqueSuffix}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

                const user = await models.NguoiDung.create({
                    Ho: sur,
                    Ten: `${mid} ${last}`,
                    Email: email,
                    SoDienThoai: phone,
                    MatKhau: hashedPassword,
                    GioiTinh: gender,
                    NgaySinh: '1980-01-01',
                    AnhDaiDien: avatar,
                    TrangThai: 'HoatDong'
                });

                await models.NguoiDung_VaiTro.create({
                    Id_NguoiDung: user.Id_NguoiDung,
                    Id_VaiTro: 2
                });

                const specialty = specialties[Math.floor(Math.random() * specialties.length)];
                const degree = degrees[Math.floor(Math.random() * degrees.length)];

                const doctor = await models.BacSi.create({
                    Id_NguoiDung: user.Id_NguoiDung,
                    Id_ChuyenKhoa: specialty.Id_ChuyenKhoa,
                    SoChungChiHanhNghe: `CCHN-${Math.floor(100000 + Math.random() * 900000)}`,
                    SoNamKinhNghiem: Math.floor(5 + Math.random() * 25),
                    PhiTuVan: (Math.floor(3 + Math.random() * 10) * 50000),
                    GioiThieu: `Bác sĩ ${fullName} là chuyên gia đầu ngành trong lĩnh vực ${specialty.TenChuyenKhoa} với nhiều năm kinh nghiệm công tác tại các bệnh viện lớn.`,
                    HocHamHocVi: degree,
                    NoiLamViec: 'Đà Nẵng',
                    TrangThai: 'HoatDong'
                });

                const facility = facilities[Math.floor(Math.random() * facilities.length)];
                await models.BacSi_PhongKham.create({
                    doctor_id: doctor.Id_BacSi,
                    facility_id: facility.Id_PhongKham
                });

                if (i > 0 && i % 100 === 0) console.log(`Created ${i} doctors...`);
            } catch (err) {
                console.error(`Failed to create doctor ${i}:`, err.message);
            }
        }

        console.log('Successfully seeded 500 doctors!');
    } catch (error) {
        console.error('Error seeding doctors:', error);
    } finally {
        process.exit();
    }
}

seed();
