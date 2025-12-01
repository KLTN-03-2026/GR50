const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const MedicalRecord = require('./MedicalRecord');

const Prescription = sequelize.define('Prescription', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    record_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'medical_records',
            key: 'id'
        }
    },
    medicine_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    dosage: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    duration: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: false,
    tableName: 'prescriptions'
});



module.exports = Prescription;
