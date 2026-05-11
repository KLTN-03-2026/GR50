const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentTransaction = sequelize.define('PaymentTransaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    paymentRequestId: { type: DataTypes.INTEGER, references: { model: 'payment_requests', key: 'id' } },
    appointmentId: { type: DataTypes.INTEGER, references: { model: 'datlich', key: 'Id_DatLich' } },
    facilityId: { type: DataTypes.INTEGER, references: { model: 'PhongKham', key: 'Id_PhongKham' } },
    provider: { type: DataTypes.ENUM('BANK', 'VNPAY', 'MOMO', 'CASH', 'POS'), allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false }, // Amount requested
    paidAmount: { type: DataTypes.DECIMAL(12, 2) }, // Actual amount received
    currency: { type: DataTypes.STRING(10), defaultValue: 'VND' },
    status: { 
        type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED', 'MISMATCH_AMOUNT', 'MISMATCH_CONTENT', 'OVERPAID'), 
        defaultValue: 'PENDING' 
    },
    transactionCode: { type: DataTypes.STRING(100) }, // Gateway/Bank transaction ID
    transferContent: { type: DataTypes.STRING(255) },
    signatureVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    moneyReceived: { type: DataTypes.BOOLEAN, defaultValue: false },
    paidAt: { type: DataTypes.DATE },
    rawPayload: { type: DataTypes.JSON } // Full callback data from provider
}, { tableName: 'payment_transactions', timestamps: true });

module.exports = PaymentTransaction;
