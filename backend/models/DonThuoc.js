const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DonThuoc = sequelize.define('DonThuoc', {
    Id_DonThuoc: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_DatLich: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'datlich', key: 'Id_DatLich' } },
    Id_HoSoBenhAn: { type: DataTypes.INTEGER, references: { model: 'hosobenhan', key: 'Id_HoSo' } },
    Id_BenhNhan: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'benhnhan', key: 'Id_BenhNhan' } },
    Id_BacSi: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'bacsi', key: 'Id_BacSi' } },
    ChanDoan: { type: DataTypes.STRING(255) },
    LoiDan: { type: DataTypes.TEXT },
    BenhNhanLayThuoc: { type: DataTypes.TINYINT, defaultValue: 0 },
    TrangThai: { 
        type: DataTypes.ENUM('DRAFT', 'SIGNED', 'PATIENT_DECLINED_MEDICINE', 'DISPENSED'), 
        defaultValue: 'DRAFT' 
    },
    NgayKy: { type: DataTypes.DATE }
}, { tableName: 'don_thuoc', timestamps: true, createdAt: 'NgayTao', updatedAt: false });

module.exports = DonThuoc;