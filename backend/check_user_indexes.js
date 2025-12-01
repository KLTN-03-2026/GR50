const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const fs = require('fs');

async function checkIndexes() {
    try {
        const [results, metadata] = await sequelize.query("SHOW INDEX FROM users");
        fs.writeFileSync('backend/user_indexes.txt', 'Indexes in users table: ' + JSON.stringify(results));
    } catch (error) {
        fs.writeFileSync('backend/user_indexes.txt', 'Error checking indexes: ' + error.message);
    } finally {
        await sequelize.close();
    }
}

checkIndexes();
