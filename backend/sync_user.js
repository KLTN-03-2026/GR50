const { User, sequelize } = require('./models');

async function syncUser() {
    try {
        console.log('Syncing User model...');
        await User.sync({ alter: true });
        console.log('User model synced.');
    } catch (error) {
        console.error('Error syncing User model:', error);
    } finally {
        await sequelize.close();
    }
}

syncUser();
