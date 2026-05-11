const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppointmentMonthlyReport = sequelize.define('AppointmentMonthlyReport', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    month: { type: DataTypes.INTEGER, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    facility_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'PhongKham', key: 'Id_PhongKham' } },
    total_bookings: { type: DataTypes.INTEGER, defaultValue: 0 },
    completion_rate: { type: DataTypes.FLOAT, defaultValue: 0 },
    cancellation_rate: { type: DataTypes.FLOAT, defaultValue: 0 },
    no_show_rate: { type: DataTypes.FLOAT, defaultValue: 0 },
    revenue_estimate: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    peak_hours_json: { type: DataTypes.TEXT },
    top_services_json: { type: DataTypes.TEXT }
}, {
    tableName: 'appointment_monthly_reports',
    timestamps: true
});

module.exports = AppointmentMonthlyReport;
