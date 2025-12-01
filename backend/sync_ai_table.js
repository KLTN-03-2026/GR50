const { sequelize, AIDiagnosis } = require('./models');

async function syncAITable() {
    try {
        console.log('Syncing AIDiagnosis table...');
        await AIDiagnosis.sync({ alter: true });
        console.log('AIDiagnosis table synced successfully.');

        const count = await AIDiagnosis.count();
        console.log(`Current diagnosis count: ${count}`);
    } catch (error) {
        console.error('Error syncing table:', error);
    } finally {
        await sequelize.close();
    }
}

syncAITable();
