const { SystemSetting, sequelize } = require('./models');

async function checkSystemSettings() {
    try {
        await sequelize.authenticate();
        console.log('Database connection OK.');

        // Check if table exists by trying to count
        try {
            const count = await SystemSetting.count();
            console.log(`SystemSetting table exists. Count: ${count}`);
        } catch (err) {
            console.error('Error querying SystemSetting table (likely does not exist):', err.message);

            // Try to sync just this model
            console.log('Attempting to sync SystemSetting model...');
            await SystemSetting.sync({ force: false });
            console.log('SystemSetting model synced.');
        }

        // Try to insert a dummy value if empty
        const settings = await SystemSetting.findAll();
        if (settings.length === 0) {
            console.log('Table is empty. Seeding default values...');
            await SystemSetting.create({ key: 'hospital_name', value: 'Phòng khám Đa khoa MediSchedule' });
            console.log('Seeded hospital_name.');
        } else {
            console.log('Current settings:', JSON.stringify(settings, null, 2));
        }

    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await sequelize.close();
    }
}

checkSystemSettings();
