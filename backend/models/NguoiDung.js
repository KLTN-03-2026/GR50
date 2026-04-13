const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NguoiDung = sequelize.define('NguoiDung', {
    Id_NguoiDung: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Ho: { type: DataTypes.STRING(50) },
    Ten: { type: DataTypes.STRING(50) },
    Email: { type: DataTypes.STRING(100), unique: true },
    SoDienThoai: { type: DataTypes.STRING(20) },
    MatKhau: { type: DataTypes.STRING(255) },
    GioiTinh: { type: DataTypes.ENUM('Nam', 'Nu', 'Khac') },
    NgaySinh: { type: DataTypes.DATEONLY },
    AnhDaiDien: { type: DataTypes.TEXT },
    TrangThai: { type: DataTypes.ENUM('HoatDong', 'Khoa') },
    RefreshToken: { type: DataTypes.TEXT },
    MatKhauHienThi: { type: DataTypes.STRING(255) }, // For admin display purposes
    YeuCauDoiMatKhau: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'nguoidung', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat', deletedAt: 'NgayXoa', paranoid: true });



module.exports = NguoiDung;