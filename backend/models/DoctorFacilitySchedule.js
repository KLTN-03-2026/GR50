const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DoctorFacilitySchedule = sequelize.define('DoctorFacilitySchedule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    doctorId: { type: DataTypes.INTEGER, references: { model: 'bacsi', key: 'Id_BacSi' } },
    facilityId: { type: DataTypes.INTEGER, references: { model: 'PhongKham', key: 'Id_PhongKham' } },
    specialtyId: { type: DataTypes.INTEGER, references: { model: 'chuyenkhoa', key: 'Id_ChuyenKhoa' } },
    roomId: { type: DataTypes.STRING }, // Room name or ID
    dayOfWeek: { type: DataTypes.INTEGER }, // 0 (Sun) to 6 (Sat)
    startTime: { type: DataTypes.TIME },
    endTime: { type: DataTypes.TIME },
    assignedByAdminId: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    status: { type: DataTypes.ENUM('ACTIVE', 'SUSPENDED', 'EXPIRED'), defaultValue: 'ACTIVE' },
    effectiveFrom: { type: DataTypes.DATEONLY },
    effectiveTo: { type: DataTypes.DATEONLY }
}, { 
    tableName: 'doctor_facility_schedules', 
    timestamps: true 
});

module.exports = DoctorFacilitySchedule;
