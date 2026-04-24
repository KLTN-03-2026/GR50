const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PhongKham = sequelize.define('PhongKham', {
    Id_PhongKham: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TenPhongKham: { type: DataTypes.STRING(255), allowNull: false },
    SoDienThoai: { type: DataTypes.STRING(20) },
    DiaChi: { type: DataTypes.TEXT },
    ToaDo_Lat: { type: DataTypes.DECIMAL(10, 8) },
    ToaDo_Lng: { type: DataTypes.DECIMAL(10, 8) },
    Email: { type: DataTypes.STRING(100) },
    UrlLogo: { type: DataTypes.TEXT },
    UrlBanner: { type: DataTypes.TEXT },
    GoogleMapUrl: { type: DataTypes.TEXT },
    TrangThai: { type: DataTypes.ENUM('HoatDong', 'NgungHoatDong', 'BaoTri'), defaultValue: 'HoatDong' }
}, {
    tableName: 'PhongKham',
    timestamps: false
});

module.exports = PhongKham;
