const sequelize = require('./config/database');
const fs = require('fs');

async function checkDoctorColumns() {
    try {
        const [results, metadata] = await sequelize.query("SHOW COLUMNS FROM doctors");
        fs.writeFileSync('backend/doctors_columns_output.txt', 'Columns in doctors table: ' + JSON.stringify(results.map(c => c.Field)));
    } catch (error) {
        fs.writeFileSync('backend/doctors_columns_output.txt', 'Error checking columns: ' + error.message);
    } finally {
        await sequelize.close();
    }
}

checkDoctorColumns();
