const { SystemSetting, sequelize } = require('./models');
const fs = require('fs');

async function checkSystemSettings() {
    const log = [];
    const logFn = (msg) => {
        console.log(msg);
        log.push(msg);
    };

    try {
        await sequelize.authenticate();
        logFn('Database connection OK.');

        // Check if table exists by trying to count
        try {
            const count = await SystemSetting.count();
            logFn(`SystemSetting table exists. Count: ${count}`);
        } catch (err) {
            logFn('Error querying SystemSetting table (likely does not exist): ' + err.message);

            // Try to sync just this model
            logFn('Attempting to sync SystemSetting model...');
            await SystemSetting.sync({ force: false });
            logFn('SystemSetting model synced.');
        }

        // Try to insert a dummy value if empty
        const settings = await SystemSetting.findAll();
        if (settings.length === 0) {
            logFn('Table is empty. Seeding default values...');
            await SystemSetting.create({ key: 'hospital_name', value: 'Phòng khám Đa khoa MediSchedule' });
            logFn('Seeded hospital_name.');
        } else {
            logFn('Current settings: ' + JSON.stringify(settings, null, 2));
        }

    } catch (error) {
        logFn('Fatal error: ' + error.message);
    } finally {
        await sequelize.close();
        fs.writeFileSync('backend/debug_system_output.txt', log.join('\n'));
    }
}

checkSystemSettings();
