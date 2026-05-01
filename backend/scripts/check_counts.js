
const { BacSi, BenhNhan, NguoiDung } = require('../models');
const sequelize = require('../config/database');

async function checkCounts() {
    try {
        await sequelize.authenticate();
        const doctorCount = await BacSi.count();
        const patientCount = await BenhNhan.count();
        console.log(`Doctors: ${doctorCount}`);
        console.log(`Patients: ${patientCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkCounts();
