const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChiTietDonThuoc = sequelize.define('ChiTietDonThuoc', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_DonThuoc: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'don_thuoc', key: 'Id_DonThuoc' } },
    Id_Thuoc: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'thuoc_danh_muc', key: 'Id_Thuoc' } },
    SoLuong: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    LieuDung: { type: DataTypes.STRING(255) },
    SoNgay: { type: DataTypes.INTEGER },
    CachDung: { type: DataTypes.STRING(255) },
    GhiChu: { type: DataTypes.TEXT }
}, { tableName: 'don_thuoc_chi_tiet', timestamps: false });

module.exports = ChiTietDonThuoc;