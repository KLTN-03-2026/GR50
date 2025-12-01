const { Specialty, sequelize } = require('./models');

async function syncSpecialty() {
    try {
        console.log('Syncing Specialty model...');
        await Specialty.sync({ alter: true });
        console.log('Specialty model synced.');
    } catch (error) {
        console.error('Error syncing Specialty model:', error);
    } finally {
        await sequelize.close();
    }
}

syncSpecialty();
