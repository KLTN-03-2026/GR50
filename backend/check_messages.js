const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const fs = require('fs');

async function checkMessages() {
    try {
        const [results, metadata] = await sequelize.query("SELECT count(*) as count FROM messages");
        fs.writeFileSync('backend/messages_count.txt', 'Messages count: ' + JSON.stringify(results));
    } catch (error) {
        fs.writeFileSync('backend/messages_count.txt', 'Error checking messages: ' + error.message);
    } finally {
        await sequelize.close();
    }
}

checkMessages();
