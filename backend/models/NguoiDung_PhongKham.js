const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NguoiDung_PhongKham = sequelize.define('NguoiDung_PhongKham', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    staff_id: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    facility_id: { type: DataTypes.INTEGER, references: { model: 'PhongKham', key: 'Id_PhongKham' } },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    is_manager: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { 
    tableName: 'nguoidung_phongkham', 
    timestamps: true, 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
});

module.exports = NguoiDung_PhongKham;
