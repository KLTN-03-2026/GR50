const { Review, Doctor, sequelize } = require('./models');

async function syncOthers() {
    try {
        console.log('Syncing Doctor model...');
        await Doctor.sync({ alter: true });
        console.log('Doctor model synced.');

        console.log('Syncing Review model...');
        await Review.sync({ alter: true });
        console.log('Review model synced.');
    } catch (error) {
        console.error('Error syncing models:', error);
    } finally {
        await sequelize.close();
    }
}

syncOthers();
