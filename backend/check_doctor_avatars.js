const { User } = require('./models');
const fs = require('fs');

async function checkDoctorAvatars() {
    try {
        const doctors = await User.findAll({ where: { role: 'doctor' } });
        const log = doctors.map(d => `${d.full_name}: ${d.avatar}`).join('\n');
        console.log(log);
        fs.writeFileSync('backend/doctor_avatars_log.txt', log);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkDoctorAvatars();
