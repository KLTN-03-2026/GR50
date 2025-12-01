const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const fs = require('fs');

async function addConversationIdToMessages() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('messages');

        if (!tableInfo.conversation_id) {
            console.log('Adding conversation_id column to messages table...');
            await queryInterface.addColumn('messages', 'conversation_id', {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'conversations',
                    key: 'id'
                }
            });
            console.log('Column added successfully.');
        } else {
            console.log('conversation_id column already exists.');
        }

        // Also check if consultation_id is nullable, if not make it nullable
        // Note: modifying column to be nullable is tricky in some dialects, but let's try
        if (tableInfo.consultation_id && !tableInfo.consultation_id.allowNull) {
            console.log('Making consultation_id nullable...');
            await queryInterface.changeColumn('messages', 'consultation_id', {
                type: Sequelize.INTEGER,
                allowNull: true
            });
            console.log('Column modified successfully.');
        }

    } catch (error) {
        console.error('Error updating messages table:', error);
        fs.writeFileSync('backend/migration_error.txt', JSON.stringify(error, null, 2));
    } finally {
        await sequelize.close();
    }
}

addConversationIdToMessages();
