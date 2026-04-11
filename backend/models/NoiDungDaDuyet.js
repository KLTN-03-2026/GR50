const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NoiDungDaDuyet = sequelize.define('NoiDungDaDuyet', {
    Id_NoiDungDaDuyet: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    NoiDung: { type: DataTypes.TEXT },
    TuKhoa: { type: DataTypes.STRING(100) },
    DanhMuc: { type: DataTypes.STRING(100) },
    PhanHoi: { type: DataTypes.TEXT },
    NguoiDuyet: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    Id_NguonChoDuyet: { type: DataTypes.INTEGER, references: { model: 'noidungchoduyet', key: 'Id_NoiDungChoDuyet' } }
}, { tableName: 'noidungdaduyet', timestamps: true, updatedAt: 'NgayDuyet', createdAt: false });

module.exports = NoiDungDaDuyet;