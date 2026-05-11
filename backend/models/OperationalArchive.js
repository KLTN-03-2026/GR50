const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OperationalArchive = sequelize.define('OperationalArchive', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sourceType: { 
        type: DataTypes.ENUM('BOOKING', 'APPOINTMENT', 'QUEUE', 'PAYMENT'),
        allowNull: false 
    },
    sourceId: { type: DataTypes.INTEGER, allowNull: false },
    facilityId: { type: DataTypes.INTEGER, allowNull: false },
    snapshotData: { type: DataTypes.JSON, allowNull: false },
    archiveReason: { type: DataTypes.STRING },
    archivedBy: { type: DataTypes.STRING, defaultValue: 'SYSTEM' },
    archivedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { 
    tableName: 'operational_archives',
    timestamps: false
});

module.exports = OperationalArchive;
