const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppointmentQueue = sequelize.define('AppointmentQueue', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    queueNumber: { type: DataTypes.STRING(20) }, // e.g., Q-001
    facility_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'PhongKham', key: 'Id_PhongKham' } },
    doctor_id: { type: DataTypes.INTEGER, references: { model: 'bacsi', key: 'Id_BacSi' } },
    appointment_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'datlich', key: 'Id_DatLich' } },
    priorityLevel: { type: DataTypes.ENUM('NORMAL', 'HIGH', 'URGENT'), defaultValue: 'NORMAL' },
    priority_score: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { 
        type: DataTypes.ENUM('WAITING', 'SUGGESTED_NEXT', 'DOCTOR_ACCEPTED', 'CALLED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'NO_SHOW'), 
        defaultValue: 'WAITING' 
    },
    enteredAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    isVisible: { type: DataTypes.BOOLEAN, defaultValue: true },
    archivedAt: { type: DataTypes.DATE },
    pushed_at: { type: DataTypes.DATE },
    pushed_by: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } }
}, {
    tableName: 'appointment_queues',
    timestamps: true
});

module.exports = AppointmentQueue;
