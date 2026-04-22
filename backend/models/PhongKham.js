const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PhongKham = sequelize.define('PhongKham', {
    Id_PhongKham: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    TenPhongKham: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    SoDienThoai: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    Email: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    DiaChi: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    UrlLogo: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    UrlBanner: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    GoogleMapUrl: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    MaCoSo: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    TrangThai: {
        type: DataTypes.ENUM('HoatDong', 'NgungHoatDong', 'BaoTri'),
        defaultValue: 'HoatDong'
    },
    KinhDo: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },
    ViDo: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },
    GioHoatDong: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'PhongKham',
    timestamps: true
});

module.exports = PhongKham;
