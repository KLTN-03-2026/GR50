const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const fs = require('fs');

async function cleanupIndexes() {
    try {
        const [indexes] = await sequelize.query("SHOW INDEX FROM users");
        const duplicates = indexes.filter(idx => idx.Key_name !== 'PRIMARY' && idx.Key_name !== 'email' && idx.Key_name !== 'username');

        // Filter unique index names to avoid trying to drop the same index multiple times (though SHOW INDEX returns one row per column in index)
        const uniqueIndexNames = [...new Set(duplicates.map(idx => idx.Key_name))];

        for (const indexName of uniqueIndexNames) {
            console.log(`Dropping index ${indexName}...`);
            await sequelize.query(`DROP INDEX ${indexName} ON users`);
        }

        fs.writeFileSync('backend/cleanup_indexes_status.txt', `Dropped ${uniqueIndexNames.length} duplicate indexes.`);
    } catch (error) {
        fs.writeFileSync('backend/cleanup_indexes_status.txt', 'Error cleaning indexes: ' + error.message);
    } finally {
        await sequelize.close();
    }
}

cleanupIndexes();
