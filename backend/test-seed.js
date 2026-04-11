const bcrypt = require('bcrypt');
const {
    sequelize,
    VaiTro,
    NguoiDung,
    NguoiDung_VaiTro,
    ChuyenKhoa,
    BacSi,
    BenhNhan
} = require('./models');

async function seed() {
    const fs = require('fs');
    fs.writeFileSync('seed_crash.log', 'Start seeding\n');

    try {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        fs.appendFileSync('seed_crash.log', 'FK checks disabled\n');

        await sequelize.sync({ force: true });
        fs.appendFileSync('seed_crash.log', 'Database synced\n');

        // 1. Roles (VaiTrò)
        const rolesData = [
            { MaVaiTro: 'admin', TenVaiTro: 'Quản trị viên', MoTa: 'Toàn quyền hệ thống' },
            { MaVaiTro: 'doctor', TenVaiTro: 'Bác sĩ', MoTa: 'Chẩn đoán và khám bệnh' },
            { MaVaiTro: 'patient', TenVaiTro: 'Bệnh nhân', MoTa: 'Đăng ký khám' },
            { MaVaiTro: 'department_head', TenVaiTro: 'Trưởng khoa', MoTa: 'Quản lý chuyên khoa' }
        ];
        const roles = await VaiTro.bulkCreate(rolesData);
        fs.appendFileSync('seed_crash.log', 'Roles seeded\n');

        const adminRole = roles.find(r => r.MaVaiTro === 'admin');
        const patientRole = roles.find(r => r.MaVaiTro === 'patient');
        const doctorRole = roles.find(r => r.MaVaiTro === 'doctor');

        const hashedPassword = await bcrypt.hash('12345678', 10);
        const adminUser = await NguoiDung.create({
            Ho: 'Quản',
            Ten: 'Trị',
            Email: 'admin@medischedule.com',
            MatKhau: hashedPassword,
            TrangThai: 'HoatDong'
        });
        await NguoiDung_VaiTro.create({ Id_NguoiDung: adminUser.Id_NguoiDung, Id_VaiTro: adminRole.Id_VaiTro });
        fs.appendFileSync('seed_crash.log', 'Admin seeded\n');

        fs.appendFileSync('seed_crash.log', 'Seeding completed!\n');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (err) {
        fs.appendFileSync('seed_crash.log', 'Seeding error: ' + err.stack + '\n');
    } finally {
        process.exit();
    }
}

seed();
