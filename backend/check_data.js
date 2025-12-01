const { User, Doctor } = require('./models');

async function checkData() {
    try {
        const users = await User.findAll();
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => console.log(`User: ${u.id} - ${u.email} - ${u.role}`));

        const doctors = await Doctor.findAll();
        console.log(`Total Doctors: ${doctors.length}`);
        doctors.forEach(d => console.log(`Doctor: ${d.id} - UserID: ${d.user_id}`));

    } catch (error) {
        console.error('Error:', error);
    }
}

checkData();
