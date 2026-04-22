const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DanhGia = sequelize.define('DanhGia', {
    Id_DanhGia: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_BacSi: { type: DataTypes.INTEGER, references: { model: 'bacsi', key: 'Id_BacSi' } },
    Id_BenhNhan: { type: DataTypes.INTEGER, references: { model: 'benhnhan', key: 'Id_BenhNhan' } },
    Id_DatLich: { type: DataTypes.INTEGER, references: { model: 'datlich', key: 'Id_DatLich' } },
    SoSao: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    BinhLuan: { type: DataTypes.TEXT },
    NgayTao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'danhgia', timestamps: false });

module.exports = DanhGia;
