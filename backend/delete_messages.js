const { Sequelize } = require('sequelize');

const sequelize = require('./config/database');
const fs = require('fs');

async function deleteMessages() {
    try {
        await sequelize.query("DELETE FROM messages");
        await sequelize.query("DELETE FROM reviews");
        fs.writeFileSync('backend/delete_messages_status.txt', 'Messages and reviews deleted successfully.');
    } catch (error) {
        fs.writeFileSync('backend/delete_messages_status.txt', 'Error deleting data: ' + error.message);
    } finally {
        await sequelize.close();
    }
}

deleteMessages();
