const { sequelize } = require('./models');

async function check() {
    try {
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log('Tables:', tables);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

check();
