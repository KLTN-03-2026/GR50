const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentRequest = sequelize.define('PaymentRequest', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    appointmentId: { type: DataTypes.INTEGER, references: { model: 'datlich', key: 'Id_DatLich' } },
    patientId: { type: DataTypes.INTEGER, references: { model: 'benhnhan', key: 'Id_BenhNhan' } },
    facilityId: { type: DataTypes.INTEGER, references: { model: 'PhongKham', key: 'Id_PhongKham' } },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    currency: { type: DataTypes.STRING(10), defaultValue: 'VND' },
    paymentMethod: { 
        type: DataTypes.ENUM('BANK_QR', 'GATEWAY', 'COUNTER', 'VNPAY', 'MOMO'), 
        allowNull: false 
    },
    status: { 
        type: DataTypes.ENUM('PENDING', 'WAITING_PAYMENT', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED', 'MISMATCH_AMOUNT', 'MISMATCH_CONTENT'), 
        defaultValue: 'PENDING' 
    },
    expiredAt: { type: DataTypes.DATE },
    policyAccepted: { type: DataTypes.BOOLEAN, defaultValue: false },
    policyVersion: { type: DataTypes.STRING(50) }
}, { tableName: 'payment_requests', timestamps: true });

module.exports = PaymentRequest;
