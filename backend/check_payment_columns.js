const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const fs = require('fs');

async function checkColumns() {
    try {
        const [results, metadata] = await sequelize.query("SHOW COLUMNS FROM payments");
        fs.writeFileSync('backend/payment_columns.txt', 'Columns in payments table: ' + JSON.stringify(results));
    } catch (error) {
        fs.writeFileSync('backend/payment_columns.txt', 'Error checking columns: ' + error.message);
    } finally {
        await sequelize.close();
    }
}

checkColumns();
