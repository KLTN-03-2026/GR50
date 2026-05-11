const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BangGiaDichVu = sequelize.define('BangGiaDichVu', {
    Id_DichVu: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MaDichVu: { type: DataTypes.STRING(50), unique: true },
    TenDichVu: { type: DataTypes.STRING(255), allowNull: false },
    NhomDichVu: { 
        type: DataTypes.ENUM('KHAM_BENH', 'XET_NGHIEM', 'X_QUANG', 'SIEU_AM', 'THU_THUAT', 'KHAC'),
        allowNull: false 
    },
    DonGia: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    DonViTinh: { type: DataTypes.STRING(50) },
    TrangThai: { type: DataTypes.TINYINT, defaultValue: 1 }
}, { 
    tableName: 'bang_gia_dich_vu', 
    timestamps: true, 
    createdAt: 'NgayTao', 
    updatedAt: 'NgayCapNhat' 
});

module.exports = BangGiaDichVu;
