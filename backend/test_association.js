const { sequelize, MedicalRecord, User, Appointment } = require('./models');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Try to fetch one record with includes
        const records = await MedicalRecord.findAll({
            limit: 1,
            include: [
                {
                    model: User,
                    as: 'Patient',
                    attributes: ['full_name']
                },
                {
                    model: Appointment,
                    attributes: ['appointment_date']
                }
            ]
        });
        console.log('Records found:', records.length);
        console.log('Test successful');
    } catch (error) {
        console.error('Unable to connect to the database or query failed:', error);
    } finally {
        await sequelize.close();
    }
}

test();
