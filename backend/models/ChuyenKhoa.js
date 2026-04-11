const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChuyenKhoa = sequelize.define('ChuyenKhoa', {
    Id_ChuyenKhoa: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TenChuyenKhoa: { type: DataTypes.STRING(100) },
    MoTa: { type: DataTypes.TEXT },
    TrangThai: { type: DataTypes.ENUM('HoatDong', 'NgungHoatDong') }
}, { tableName: 'chuyenkhoa', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat', deletedAt: 'NgayXoa', paranoid: true });

module.exports = ChuyenKhoa;