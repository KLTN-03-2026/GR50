const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DonThuoc = sequelize.define('DonThuoc', {
    Id_DonThuoc: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_HoSo: { type: DataTypes.INTEGER, references: { model: 'hosobenhan', key: 'Id_HoSo' } },
    GhiChu: { type: DataTypes.TEXT }
}, { tableName: 'donthuoc', timestamps: true, createdAt: 'NgayKe', updatedAt: false });

module.exports = DonThuoc;