const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const fs = require('fs');

async function updateMedicalRecordsTable() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('medical_records');

        if (!tableInfo.patient_id) {
            console.log('Adding patient_id column to medical_records table...');
            await queryInterface.addColumn('medical_records', 'patient_id', {
                type: Sequelize.INTEGER,
                allowNull: true, // Initially true to avoid errors with existing data
                references: {
                    model: 'users',
                    key: 'id'
                }
            });
            console.log('patient_id added.');
        }

        if (!tableInfo.doctor_id) {
            console.log('Adding doctor_id column to medical_records table...');
            await queryInterface.addColumn('medical_records', 'doctor_id', {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                }
            });
            console.log('doctor_id added.');
        }

        // Also make appointment_id nullable if it isn't
        if (tableInfo.appointment_id && !tableInfo.appointment_id.allowNull) {
            console.log('Making appointment_id nullable...');
            await queryInterface.changeColumn('medical_records', 'appointment_id', {
                type: Sequelize.INTEGER,
                allowNull: true
            });
            console.log('appointment_id modified.');
        }

    } catch (error) {
        console.error('Error updating medical_records table:', error);
        fs.writeFileSync('backend/migration_mr_error.txt', JSON.stringify(error, null, 2));
    } finally {
        await sequelize.close();
    }
}

updateMedicalRecordsTable();
