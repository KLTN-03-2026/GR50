const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppointmentPriorityScore = sequelize.define('AppointmentPriorityScore', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    appointment_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'datlich', key: 'Id_DatLich' } },
    triage_score: { type: DataTypes.INTEGER, defaultValue: 0 },
    service_score: { type: DataTypes.INTEGER, defaultValue: 0 },
    special_object_score: { type: DataTypes.INTEGER, defaultValue: 0 },
    wait_time_score: { type: DataTypes.INTEGER, defaultValue: 0 },
    verification_score: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_score: { type: DataTypes.INTEGER, defaultValue: 0 },
    priority_level: { type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'), defaultValue: 'MEDIUM' },
    reason: { type: DataTypes.TEXT }
}, {
    tableName: 'appointment_priority_scores',
    timestamps: true
});

module.exports = AppointmentPriorityScore;
