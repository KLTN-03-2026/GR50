const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChiDinhCanLamSang = sequelize.define('ChiDinhCanLamSang', {
    Id_ChiDinh: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_DatLich: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'datlich', key: 'Id_DatLich' } },
    Id_HoSoBenhAn: { type: DataTypes.INTEGER, references: { model: 'hosobenhan', key: 'Id_HoSo' } },
    Id_BacSi: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'bacsi', key: 'Id_BacSi' } },
    Id_DichVu: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'bang_gia_dich_vu', key: 'Id_DichVu' } },
    GhiChu: { type: DataTypes.TEXT },
    TrangThai: { 
        type: DataTypes.ENUM('ORDERED', 'COMPLETED', 'CANCELLED'), 
        defaultValue: 'ORDERED' 
    }
}, { 
    tableName: 'chi_dinh_can_lam_sang', 
    timestamps: true, 
    createdAt: 'NgayTao', 
    updatedAt: false 
});

module.exports = ChiDinhCanLamSang;
