const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ThuocDanhMuc = sequelize.define('ThuocDanhMuc', {
    Id_Thuoc: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MaThuoc: { type: DataTypes.STRING(50), unique: true },
    TenThuoc: { type: DataTypes.STRING(255), allowNull: false },
    HoatChat: { type: DataTypes.STRING(255) },
    HamLuong: { type: DataTypes.STRING(100) },
    DangBaoChe: { type: DataTypes.STRING(100) },
    DonViTinh: { type: DataTypes.STRING(50) },
    DonGia: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    CanKeDon: { type: DataTypes.TINYINT, defaultValue: 1 },
    TonKho: { type: DataTypes.INTEGER, defaultValue: 0 },
    TrangThai: { type: DataTypes.TINYINT, defaultValue: 1 }
}, { 
    tableName: 'thuoc_danh_muc', 
    timestamps: true, 
    createdAt: 'NgayTao', 
    updatedAt: 'NgayCapNhat' 
});

module.exports = ThuocDanhMuc;
