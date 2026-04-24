const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LichKham = sequelize.define('LichKham', {
    Id_LichKham: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_BacSi: { type: DataTypes.INTEGER, references: { model: 'bacsi', key: 'Id_BacSi' } },
    Id_PhongKham: { type: DataTypes.INTEGER, references: { model: 'PhongKham', key: 'Id_PhongKham' } },
    NgayDate: { type: DataTypes.DATEONLY },
    GioBatDau: { type: DataTypes.TIME },
    GioKetThuc: { type: DataTypes.TIME },
    LoaiKham: { type: DataTypes.ENUM('TrucTiep', 'Online') },
    SoLuongToiDa: { type: DataTypes.INTEGER },
    SoLuongDaDat: { type: DataTypes.INTEGER, defaultValue: 0 },
    TrangThai: { type: DataTypes.ENUM('Mo', 'Dong', 'Huy') }
}, { tableName: 'lichkham', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = LichKham;