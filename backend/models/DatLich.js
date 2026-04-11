const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DatLich = sequelize.define('DatLich', {
    Id_DatLich: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MaDatLich: { type: DataTypes.STRING(30) },
    Id_BenhNhan: { type: DataTypes.INTEGER, references: { model: 'benhnhan', key: 'Id_BenhNhan' } },
    Id_LichKham: { type: DataTypes.INTEGER, references: { model: 'lichkham', key: 'Id_LichKham' } },
    TrangThai: { type: DataTypes.ENUM('ChoXacNhan', 'DaXacNhan', 'DaKham', 'Huy') },
    TrieuChungSoBo: { type: DataTypes.TEXT },
    GhiChu: { type: DataTypes.TEXT },
    LyDoHuy: { type: DataTypes.TEXT },
    DaGuiNhac: { type: DataTypes.TINYINT },
    GiaTien: { type: DataTypes.DECIMAL(12, 2) },
    ThoiDiemDat: { type: DataTypes.DATE }
}, { tableName: 'datlich', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = DatLich;