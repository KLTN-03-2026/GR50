const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppointmentPaymentPolicyAcceptance = sequelize.define('AppointmentPaymentPolicyAcceptance', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    appointment_id: { type: DataTypes.INTEGER, references: { model: 'datlich', key: 'Id_DatLich' } },
    patient_id: { type: DataTypes.INTEGER, references: { model: 'benhnhan', key: 'Id_BenhNhan' } },
    policy_version: { type: DataTypes.STRING(20), defaultValue: '2.0' },
    accepted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    ip_address: { type: DataTypes.STRING(45) },
    user_agent: { type: DataTypes.TEXT },
    content_snapshot: { type: DataTypes.TEXT }
}, {
    tableName: 'appointment_payment_policy_acceptances',
    timestamps: false
});

module.exports = AppointmentPaymentPolicyAcceptance;
