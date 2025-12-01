const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const fs = require('fs');

async function checkAppointmentColumns() {
    try {
        const [results, metadata] = await sequelize.query("DESCRIBE appointments");
        fs.writeFileSync('backend/appointment_columns.txt', JSON.stringify(results, null, 2));
        console.log('Columns checked.');
    } catch (error) {
        console.error('Error checking columns:', error);
        fs.writeFileSync('backend/appointment_columns.txt', 'Error: ' + error.message);
    } finally {
        await sequelize.close();
    }
}

checkAppointmentColumns();
