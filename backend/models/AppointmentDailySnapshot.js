const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppointmentDailySnapshot = sequelize.define('AppointmentDailySnapshot', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    facility_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'PhongKham', key: 'Id_PhongKham' } },
    doctor_id: { type: DataTypes.INTEGER, references: { model: 'bacsi', key: 'Id_BacSi' } },
    total_bookings: { type: DataTypes.INTEGER, defaultValue: 0 },
    confirmed_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    completed_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    cancelled_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    no_show_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    expired_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    avg_wait_time_minutes: { type: DataTypes.FLOAT, defaultValue: 0 },
    online_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    offline_count: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
    tableName: 'appointment_daily_snapshots',
    timestamps: true
});

module.exports = AppointmentDailySnapshot;
