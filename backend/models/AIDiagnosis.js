const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AIDiagnosis = sequelize.define('AIDiagnosis', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'doctors',
            key: 'id'
        }
    },
    symptoms: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    diagnosis: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    advice: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    specialty: {
        type: DataTypes.STRING,
        allowNull: true
    },
    full_response: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'assigned', 'reviewed'),
        defaultValue: 'pending'
    }
}, {
    tableName: 'ai_diagnoses',
    timestamps: true
});

module.exports = AIDiagnosis;
