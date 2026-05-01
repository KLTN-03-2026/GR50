const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccessLog = sequelize.define('AccessLog', {
    Id_Log: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_NguoiThucHien: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    Id_BenhNhan: { type: DataTypes.INTEGER, references: { model: 'benhnhan', key: 'Id_BenhNhan' } },
    HanhDong: { type: DataTypes.STRING(100) }, // e.g., 'VIEW_MEDICAL_HISTORY', 'VIEW_EMERGENCY_CONTACT'
    LyDo: { type: DataTypes.TEXT },
    DoiTuongDuLieu: { type: DataTypes.STRING(100) }, // e.g., 'MedicalHistory', 'EmergencyContact'
    IpAddress: { type: DataTypes.STRING(45) },
    UserAgent: { type: DataTypes.TEXT }
}, { tableName: 'access_logs', timestamps: true, createdAt: 'NgayThucHien', updatedAt: false });

module.exports = AccessLog;
