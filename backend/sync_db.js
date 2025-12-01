try {
    const { sequelize } = require('./models');

    async function sync() {
        try {
            await sequelize.sync({ alter: true });
            console.log('Database synced successfully');
        } catch (error) {
            console.error('Error syncing database:', error);
            const fs = require('fs');
            fs.writeFileSync('sync_error.log', JSON.stringify(error, null, 2));
        } finally {
            await sequelize.close();
        }
    }

    sync();
} catch (err) {
    console.error('Error loading models:', err);
    const fs = require('fs');
    fs.writeFileSync('load_error.log', JSON.stringify(err, null, 2));
}
