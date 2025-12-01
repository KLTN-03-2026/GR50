const { User } = require('./models');
const fs = require('fs');
const path = require('path');

const doctorImages = [
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d',
    'https://images.unsplash.com/photo-1594824476969-513346381849',
    'https://images.unsplash.com/photo-1651008325506-71d34584e317',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7',
];

async function updateAvatars() {
    let log = '';
    try {
        const doctors = await User.findAll({
            where: { role: 'doctor' }
        });

        log += `Found ${doctors.length} doctors.\n`;

        for (let i = 0; i < doctors.length; i++) {
            const doctor = doctors[i];
            const image = doctorImages[i % doctorImages.length];

            doctor.avatar = image;
            await doctor.save();
            log += `Updated avatar for doctor ${doctor.full_name} (${doctor.id})\n`;
        }

        log += 'All doctor avatars updated successfully.\n';
    } catch (error) {
        log += `Error updating avatars: ${error}\n`;
    } finally {
        fs.writeFileSync(path.join(__dirname, 'update_log.txt'), log);
        process.exit();
    }
}

updateAvatars();
