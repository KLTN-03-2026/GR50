const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize } = require('../models');

async function syncDB() {
    try {
        console.log('Syncing database...');
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully!');
    } catch (error) {
        console.error('Error syncing DB:', error);
    }
    process.exit(0);
}
syncDB();
