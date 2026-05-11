const { PhongKham, BusinessHourConfig } = require('./models');

async function seedBusinessHours() {
    try {
        console.log('Starting business hour seeding...');
        const facilities = await PhongKham.findAll();
        console.log(`Found ${facilities.length} facilities.`);

        const configs = [];
        for (const fac of facilities) {
            // Mon (1) to Sat (6)
            for (let day = 1; day <= 6; day++) {
                configs.push({
                    facility_id: fac.Id_PhongKham,
                    day_of_week: day,
                    start_time: '07:30:00',
                    end_time: '17:30:00',
                    break_start: '12:00:00',
                    break_end: '13:30:00',
                    is_active: true
                });
            }
        }

        await BusinessHourConfig.bulkCreate(configs);
        console.log(`Created ${configs.length} business hour configurations.`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding business hours:', error);
        process.exit(1);
    }
}

seedBusinessHours();
