const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DisplaySequence = sequelize.define('DisplaySequence', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    facilityId: { type: DataTypes.INTEGER, allowNull: false },
    sequenceType: { 
        type: DataTypes.ENUM('BOOKING', 'APPOINTMENT', 'QUEUE', 'PAYMENT', 'REFUND'),
        allowNull: false 
    },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    currentNumber: { type: DataTypes.INTEGER, defaultValue: 0 },
    prefix: { type: DataTypes.STRING(10) },
    resetRule: { type: DataTypes.ENUM('DAILY', 'SHIFT', 'MONTHLY'), defaultValue: 'DAILY' }
}, { 
    tableName: 'display_sequences',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['facilityId', 'sequenceType', 'date'] }
    ]
});

module.exports = DisplaySequence;
