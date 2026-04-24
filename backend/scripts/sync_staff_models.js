const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize, StaffProfile, Staff_Facility } = require('../models');

async function syncNewModels() {
    try {
        console.log('Syncing StaffProfile and Staff_Facility models...');
        await StaffProfile.sync({ alter: true });
        await Staff_Facility.sync({ alter: true });
        console.log('Models synced successfully!');
    } catch (error) {
        console.error('Error syncing models:', error);
    }
    process.exit(0);
}

syncNewModels();
