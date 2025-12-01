const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');

async function checkColumns() {
    try {
        const [results, metadata] = await sequelize.query("SHOW COLUMNS FROM users");
        const fs = require('fs');
        fs.writeFileSync('backend/columns_output.txt', 'Columns in users table: ' + JSON.stringify(results.map(c => c.Field)));
    } catch (error) {
        const fs = require('fs');
        fs.writeFileSync('backend/columns_output.txt', 'Error checking columns: ' + error.message);
    } finally {
        await sequelize.close();
    }
}

checkColumns();
