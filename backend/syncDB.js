const { sequelize } = require('./models');

async function syncDB() {
    try {
        console.log('Synchronizing database schema (alter)...');
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error synchronizing database:', error);
        process.exit(1);
    }
}

syncDB();
