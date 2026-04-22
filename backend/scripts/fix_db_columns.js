const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize } = require('../models');

async function fixDB() {
    try {
        console.log('Fixing database columns manually...');

        try {
            await sequelize.query('ALTER TABLE aituvanphien ADD COLUMN Id_PhongKham INTEGER;');
            console.log('Added Id_PhongKham to aituvanphien');
        } catch (e) {
            console.log('Id_PhongKham might already exist in aituvanphien:', e.message);
        }

        try {
            await sequelize.query('ALTER TABLE conversations ADD COLUMN facility_id INTEGER;');
            console.log('Added facility_id to conversations');
        } catch (e) {
            console.log('facility_id might already exist in conversations:', e.message);
        }

        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit(0);
}
fixDB();
