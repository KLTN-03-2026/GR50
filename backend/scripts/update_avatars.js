const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { NguoiDung, VaiTro, NguoiDung_VaiTro } = require('../models');
const { Op } = require('sequelize');

async function updateAvatars() {
    try {
        console.log('Connecting to DB...');
        // Find all users who are doctors
        const doctorRole = await VaiTro.findOne({ where: { MaVaiTro: 'doctor' } });
        if (!doctorRole) {
            console.log('Role doctor not found');
            process.exit(1);
        }

        const userRoles = await NguoiDung_VaiTro.findAll({
            where: { Id_VaiTro: doctorRole.Id_VaiTro }
        });

        const userIds = userRoles.map(ur => ur.Id_NguoiDung);

        console.log(`Found ${userIds.length} doctors. Updating avatars to 3D icons...`);

        // Dicebear has many 3D/modern styles: 'micah', 'avataaars', 'adventurer', 'fun-emoji'
        // Using 'micah' which has a very premium 3D feel.
        let count = 0;
        for (const userId of userIds) {
            const user = await NguoiDung.findByPk(userId);
            if (user) {
                // Ensure no duplication by using userId as the seed
                const uniqueSeed = `MediSchedDoc_${userId}`;
                user.AnhDaiDien = `https://api.dicebear.com/9.x/micah/svg?seed=${uniqueSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf`;
                await user.save();
                count++;
            }
        }

        console.log(`Successfully updated avatars for ${count} doctors!`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating avatars:', error);
        process.exit(1);
    }
}

updateAvatars();
