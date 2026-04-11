const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HoSoBenhAn = sequelize.define('HoSoBenhAn', {
    Id_HoSo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_DatLich: { type: DataTypes.INTEGER, references: { model: 'datlich', key: 'Id_DatLich' } },
    Id_BenhNhan: { type: DataTypes.INTEGER, references: { model: 'benhnhan', key: 'Id_BenhNhan' } },
    Id_BacSi: { type: DataTypes.INTEGER, references: { model: 'bacsi', key: 'Id_BacSi' } },
    TrieuChungChuQuan: { type: DataTypes.TEXT },
    KhamLamSang: { type: DataTypes.TEXT },
    DanhGia: { type: DataTypes.TEXT },
    KeHoachDieuTri: { type: DataTypes.TEXT },
    ChanDoan: { type: DataTypes.TEXT },
    GhiChu: { type: DataTypes.TEXT }
}, { tableName: 'hosobenhan', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = HoSoBenhAn;