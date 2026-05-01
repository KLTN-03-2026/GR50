const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChuyenKhoa = sequelize.define('ChuyenKhoa', {
    Id_ChuyenKhoa: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TenChuyenKhoa: { type: DataTypes.STRING(100) },
    MoTa: { type: DataTypes.TEXT },
    image: { type: DataTypes.STRING(255) },
    TrangThai: { type: DataTypes.ENUM('HoatDong', 'NgungHoatDong') }
}, { tableName: 'ChuyenKhoa', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = ChuyenKhoa;