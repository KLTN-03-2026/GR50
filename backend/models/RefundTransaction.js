const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RefundTransaction = sequelize.define('RefundTransaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    appointment_id: { type: DataTypes.INTEGER, references: { model: 'datlich', key: 'Id_DatLich' } },
    payment_id: { type: DataTypes.INTEGER, references: { model: 'thanhtoan', key: 'Id_ThanhToan' } },
    refund_percent: { type: DataTypes.INTEGER, defaultValue: 80 },
    penalty_percent: { type: DataTypes.INTEGER, defaultValue: 20 },
    refund_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    penalty_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    reason: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('PENDING', 'PROCESSED', 'FAILED'), defaultValue: 'PENDING' },
    processed_by: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    processed_at: { type: DataTypes.DATE }
}, {
    tableName: 'refund_transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = RefundTransaction;
