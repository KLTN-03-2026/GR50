const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const fs = require('fs');

async function addDateColumn() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('medical_records');

        if (!tableInfo.date) {
            console.log('Adding date column to medical_records table...');
            await queryInterface.addColumn('medical_records', 'date', {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            });
            console.log('date added.');
        } else {
            console.log('date column already exists.');
        }

    } catch (error) {
        console.error('Error updating medical_records table:', error);
    } finally {
        await sequelize.close();
    }
}

addDateColumn();
