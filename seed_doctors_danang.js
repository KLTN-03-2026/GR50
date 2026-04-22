require('dotenv').config({ path: './backend/.env' });
const { sequelize, NguoiDung, BacSi, PhongKham, ChuyenKhoa, VaiTro, NguoiDung_VaiTro } = require('./backend/models');

const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        console.log('Starting seed process...');

        // Ensure DB schema is up to date
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully.');

        // 1. Ensure Roles
        const [doctorRole] = await VaiTro.findOrCreate({ where: { MaVaiTro: 'doctor' }, defaults: { TenVaiTro: 'Bác sĩ' } });
        console.log('Roles ensured.');

        // 2. Define Real Clinics in Da Nang
        const clinicsData = [
            { TenPhongKham: 'Bệnh viện Đa khoa Đà Nẵng', DiaChi: '124 Hải Phòng, Thạch Thang, Hải Châu, Đà Nẵng', SoDienThoai: '02363821118', UrlLogo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/B%E1%BB%87nh_vi%E1%BB%87n_%C4%90%C3%A0_N%E1%BA%B5ng.jpeg', UrlBanner: 'https://bvdn.danang.gov.vn/wps/wcm/connect/bvdn/7ca6e469-8735-4309-8d18-8f52af8321cb/1/banner+bvdn.png?MOD=AJPERES' },
            { TenPhongKham: 'Bệnh viện Hoàn Mỹ Đà Nẵng', DiaChi: '291 Nguyễn Văn Linh, Thạc Gián, Thanh Khê, Đà Nẵng', SoDienThoai: '02363650676', UrlLogo: 'https://hoanmy.com/wp-content/uploads/2023/10/logo_hm.svg', UrlBanner: 'https://www.hoanmy.com/wp-content/uploads/2023/05/Hoan-My-Da-Nang-2.jpg' },
            { TenPhongKham: 'Bệnh viện Gia Đình (Family Hospital)', DiaChi: '73 Nguyễn Hữu Thọ, Hòa Thuận Nam, Hải Châu, Đà Nẵng', SoDienThoai: '19002250', UrlLogo: 'https://familyhospital.vn/wp-content/uploads/2020/04/Logo-BVG%C4%90-01.png', UrlBanner: 'https://familyhospital.vn/wp-content/uploads/2020/04/Banner-Trang-Chu-1.jpg' },
            { TenPhongKham: 'Bệnh viện Vinmec Đà Nẵng', DiaChi: 'Đường 30 Tháng 4, Khu dân cư số 4 Nguyễn Tri Phương, Hòa Cường Bắc, Hải Châu, Đà Nẵng', SoDienThoai: '02363711111', UrlLogo: 'https://vinmec-prod.s3.amazonaws.com/images/20200527_024016_402127_vinmec-da-nang.max-1800x1800.jpg', UrlBanner: 'https://vinmec-prod.s3.amazonaws.com/images/20200527_024016_402127_vinmec-da-nang.max-1800x1800.jpg' },
            { TenPhongKham: 'Bệnh viện C Đà Nẵng', DiaChi: '74 Hải Phòng, Thạch Thang, Hải Châu, Đà Nẵng', SoDienThoai: '02363821480', UrlLogo: 'http://bvcdn.org.vn/wp-content/uploads/2019/08/logo-bvdc.png', UrlBanner: 'https://bvcdn.org.vn/wp-content/themes/bvcmn/images/banner.jpg' },
            { TenPhongKham: 'Phòng khám Đa khoa Pasteur Đà Nẵng', DiaChi: '19 Nguyễn Tường Tộ, Hòa Cường Bắc, Hải Châu, Đà Nẵng', SoDienThoai: '02363811868', UrlLogo: 'https://pasteur.com.vn/wp-content/uploads/2018/11/logo-pasteur.png', UrlBanner: 'https://pasteur.com.vn/wp-content/uploads/2019/06/banner-trang-chu.jpg' }
        ];

        const clinics = [];
        for (const data of clinicsData) {
            const [clinic, created] = await PhongKham.findOrCreate({ where: { TenPhongKham: data.TenPhongKham }, defaults: data });
            if (!created) {
                await clinic.update({ UrlLogo: data.UrlLogo, UrlBanner: data.UrlBanner });
            }
            clinics.push(clinic);
        }

        // 3. Ensure some Specialties
        const specialtiesData = [
            'Nội tổng quát', 'Ngoại tổng quát', 'Sản phụ khoa', 'Nhi khoa', 'Răng Hàm Mặt',
            'Tai Mũi Họng', 'Mắt', 'Da liễu', 'Tim mạch', 'Cơ xương khớp', 'Thần kinh', 'Tiêu hóa'
        ];
        const specialties = [];
        for (const name of specialtiesData) {
            const [specialty] = await ChuyenKhoa.findOrCreate({ where: { TenChuyenKhoa: name } });
            specialties.push(specialty);
        }

        const hashedPassword = await bcrypt.hash('123456', 10);

        // 4. Generate 150 Doctors
        const hoList = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô'];
        const lotList = ['Văn', 'Thị', 'Minh', 'Anh', 'Duy', 'Quang', 'Hữu', 'Đức', 'Thanh', 'Tú'];
        const tenList = ['Nam', 'Hùng', 'Cường', 'An', 'Bình', 'Hải', 'Sơn', 'Tuân', 'Phương', 'Lan', 'Hoa', 'Mai', 'Linh', 'Dũng', 'Tâm'];

        console.log('Generating 150 doctors...');
        for (let i = 1; i <= 150; i++) {
            const ho = hoList[Math.floor(Math.random() * hoList.length)];
            const lot = lotList[Math.floor(Math.random() * lotList.length)];
            const ten = tenList[Math.floor(Math.random() * tenList.length)];
            const fullName = `${ho} ${lot} ${ten}`;
            const email = `doctor${i}@medisched.ai`;

            const [user] = await NguoiDung.findOrCreate({
                where: { Email: email },
                defaults: {
                    Ho: ho,
                    Ten: `${lot} ${ten}`,
                    Email: email,
                    MatKhau: hashedPassword,
                    SoDienThoai: `0905${Math.floor(100000 + Math.random() * 900000)}`,
                    AnhDaiDien: `https://i.pravatar.cc/300?u=${email}`,
                    TrangThai: 'HoatDong'
                }
            });

            await NguoiDung_VaiTro.findOrCreate({
                where: { Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: doctorRole.Id_VaiTro }
            });

            const clinic = clinics[Math.floor(Math.random() * clinics.length)];
            const specialty = specialties[Math.floor(Math.random() * specialties.length)];

            await BacSi.findOrCreate({
                where: { Id_NguoiDung: user.Id_NguoiDung },
                defaults: {
                    Id_ChuyenKhoa: specialty.Id_ChuyenKhoa,
                    Id_PhongKham: clinic.Id_PhongKham,
                    SoChungChiHanhNghe: `CCHN-${100000 + i}`,
                    SoNamKinhNghiem: Math.floor(2 + Math.random() * 25),
                    PhiTuVan: 100000 + Math.floor(Math.random() * 10) * 50000,
                    GioiThieu: `Bác sĩ chuyên khoa ${specialty.TenChuyenKhoa} với nhiều năm kinh nghiệm tại ${clinic.TenPhongKham}.`,
                    HocHamHocVi: Math.random() > 0.5 ? 'Thạc sĩ, Bác sĩ' : 'Bác sĩ CKI',
                    NoiLamViec: clinic.TenPhongKham,
                    TrangThai: 'HoatDong'
                }
            });
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
};

seedData();
