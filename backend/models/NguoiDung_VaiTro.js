const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NguoiDung_VaiTro = sequelize.define('NguoiDung_VaiTro', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_NguoiDung: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    Id_VaiTro: { type: DataTypes.INTEGER, references: { model: 'vaitro', key: 'Id_VaiTro' } }
}, { tableName: 'nguoidung_vaitro', timestamps: false });

module.exports = NguoiDung_VaiTro;