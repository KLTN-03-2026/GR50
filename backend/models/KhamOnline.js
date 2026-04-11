const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KhamOnline = sequelize.define('KhamOnline', {
    Id_KhamOnline: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_DatLich: { type: DataTypes.INTEGER, references: { model: 'datlich', key: 'Id_DatLich' } },
    LoaiTuVan: { type: DataTypes.ENUM('Video', 'Chat') },
    TrangThai: { type: DataTypes.ENUM('ChoKham', 'DangKham', 'HoanThanh') },
    LinkPhongHop: { type: DataTypes.TEXT },
    LinkGhiAm: { type: DataTypes.TEXT },
    ThoiGianBatDau: { type: DataTypes.DATE },
    ThoiGianKetThuc: { type: DataTypes.DATE }
}, { tableName: 'khamonline', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = KhamOnline;