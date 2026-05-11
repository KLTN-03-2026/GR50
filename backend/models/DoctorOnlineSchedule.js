const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DoctorOnlineSchedule = sequelize.define('DoctorOnlineSchedule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    doctorId: { type: DataTypes.INTEGER, references: { model: 'bacsi', key: 'Id_BacSi' } },
    dayOfWeek: { type: DataTypes.INTEGER },
    date: { type: DataTypes.DATEONLY }, // Optional if it's a recurring schedule vs specific date
    startTime: { type: DataTypes.TIME },
    endTime: { type: DataTypes.TIME },
    slotDuration: { type: DataTypes.INTEGER, defaultValue: 20 }, // minutes
    maxOnlineBookings: { type: DataTypes.INTEGER, defaultValue: 8 },
    currentBookings: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.ENUM('OPEN', 'FULL', 'LOCKED'), defaultValue: 'OPEN' },
    createdByDoctorId: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } }
}, { 
    tableName: 'doctor_online_schedules', 
    timestamps: true 
});

module.exports = DoctorOnlineSchedule;
