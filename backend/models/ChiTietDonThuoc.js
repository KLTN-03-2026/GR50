const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChiTietDonThuoc = sequelize.define('ChiTietDonThuoc', {
    Id_ChiTietDonThuoc: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_DonThuoc: { type: DataTypes.INTEGER, references: { model: 'donthuoc', key: 'Id_DonThuoc' } },
    TenThuoc: { type: DataTypes.STRING(255) },
    DonVi: { type: DataTypes.STRING(50) },
    SoLuong: { type: DataTypes.INTEGER },
    LieuDung: { type: DataTypes.STRING(255) },
    CachDung: { type: DataTypes.TEXT }
}, { tableName: 'chitietdonthuoc', timestamps: false });

module.exports = ChiTietDonThuoc;