const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const fs = require('fs');

async function checkConsultations() {
    try {
        const [results, metadata] = await sequelize.query("SELECT count(*) as count FROM consultations");
        fs.writeFileSync('backend/consultations_count.txt', 'Consultations count: ' + JSON.stringify(results));
    } catch (error) {
        fs.writeFileSync('backend/consultations_count.txt', 'Error checking consultations: ' + error.message);
    } finally {
        await sequelize.close();
    }
}

checkConsultations();
