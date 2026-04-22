const { sequelize } = require('./models');

async function testSync() {
    try {
        await sequelize.sync({ alter: true });
        console.log("Database sync completed without errors.");
        process.exit(0);
    } catch (e) {
        console.error("Sync failed:", e.message);
        process.exit(1);
    }
}
testSync();
