require('dotenv').config();
const { sequelize, NguoiDung, VaiTro, NguoiDung_VaiTro } = require('./models');

const updateAvatars = async () => {
    try {
        console.log('Starting avatar update process...');
        await sequelize.authenticate();

        const role = await VaiTro.findOne({ where: { MaVaiTro: 'doctor' } });
        if (!role) {
            console.log('Doctor role not found!');
            process.exit(1);
        }

        const userRoles = await NguoiDung_VaiTro.findAll({ where: { Id_VaiTro: role.Id_VaiTro } });
        const doctorIds = userRoles.map(ur => ur.Id_NguoiDung);

        const doctors = await NguoiDung.findAll({ where: { Id_NguoiDung: doctorIds } });

        console.log(`Found ${doctors.length} doctors.`);

        for (const doctor of doctors) {
            const avatarArray = doctor.GioiTinh === 'Nu'
                ? ['/uploads/avatars/f1.png', '/uploads/avatars/f2.png']
                : ['/uploads/avatars/m1.png', '/uploads/avatars/m2.png'];

            // Re-evaluating gender since random gen previous might not have saved 'GioiTinh'.
            // Look at Ho (last name). If not present or unknown, just use random.
            let isFemale = Math.random() > 0.5;
            if (doctor.Ten && (doctor.Ten.includes('Thị') || doctor.Ten.match(/Nga|Hương|Lan|Hoa|Mai/i))) {
                isFemale = true;
            } else if (doctor.Ten && doctor.Ten.match(/Văn|Hùng|Dũng|Tuấn/i)) {
                isFemale = false;
            }

            const finalAvatarArray = isFemale
                ? ['/uploads/avatars/f1.png', '/uploads/avatars/f2.png']
                : ['/uploads/avatars/m1.png', '/uploads/avatars/m2.png'];

            const randomAvatar = finalAvatarArray[Math.floor(Math.random() * finalAvatarArray.length)];

            await doctor.update({ AnhDaiDien: randomAvatar });
        }

        console.log('Successfully updated avatars for existing doctors!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating avatars:', error);
        process.exit(1);
    }
};

updateAvatars();
