const { AIDiagnosis, sequelize } = require('./models');

async function checkAIDiagnosis() {
    try {
        await sequelize.authenticate();
        console.log('Database connection OK.');

        await AIDiagnosis.sync({ force: false });
        console.log('AIDiagnosis table synced.');

        const count = await AIDiagnosis.count();
        console.log(`AIDiagnosis count: ${count}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkAIDiagnosis();
