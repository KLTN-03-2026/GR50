const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CancellationReceipt = sequelize.define('CancellationReceipt', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    receiptCode: { type: DataTypes.STRING(50), unique: true }, // CXL-xxxx
    appointmentId: { type: DataTypes.INTEGER, allowNull: false },
    patientId: { type: DataTypes.INTEGER, allowNull: false },
    facilityId: { type: DataTypes.INTEGER, allowNull: false },
    specialtyId: { type: DataTypes.INTEGER },
    doctorId: { type: DataTypes.INTEGER },
    reason: { type: DataTypes.STRING, defaultValue: 'EXPIRED_AT_16_40' },
    cancelTime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    originalFee: { type: DataTypes.DECIMAL(12, 2) },
    paidAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    penaltyAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    refundEstimated: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    cancelledBy: { type: DataTypes.STRING, defaultValue: 'SYSTEM' }
}, { 
    tableName: 'cancellation_receipts',
    timestamps: true 
});

module.exports = CancellationReceipt;
