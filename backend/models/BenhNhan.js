const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BenhNhan = sequelize.define('BenhNhan', {
    Id_BenhNhan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_NguoiDung: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    MaBenhNhan: { type: DataTypes.STRING(30) },
    NhomMau: { type: DataTypes.STRING(5) },
    TienSuBenh: { type: DataTypes.TEXT },
    NguoiLienHe: { type: DataTypes.STRING(100) },
    SoDienThoaiLienHe: { type: DataTypes.STRING(20) }
}, { tableName: 'benhnhan', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = BenhNhan;