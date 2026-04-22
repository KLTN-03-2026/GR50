const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HoaDon = sequelize.define('HoaDon', {
    Id_HoaDon: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_DatLich: { type: DataTypes.INTEGER, references: { model: 'datlich', key: 'Id_DatLich' } },
    Id_PhongKham: { type: DataTypes.INTEGER, references: { model: 'PhongKham', key: 'Id_PhongKham' } },
    PhiKham: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    PhiDichVu: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    PhiThuoc: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    GiamGia: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    TongTien: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    TrangThai: { type: DataTypes.ENUM('ISSUED', 'PAID', 'CANCELLED'), defaultValue: 'ISSUED' },
    GhiChu: { type: DataTypes.TEXT }
}, { tableName: 'hoadon', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = HoaDon;
