const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ThanhToan = sequelize.define('ThanhToan', {
    Id_ThanhToan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_DatLich: { type: DataTypes.INTEGER, references: { model: 'datlich', key: 'Id_DatLich' } },
    Id_BenhNhan: { type: DataTypes.INTEGER, references: { model: 'benhnhan', key: 'Id_BenhNhan' } },
    MaDonHang: { type: DataTypes.STRING(100) },
    MaGiaoDich: { type: DataTypes.STRING(100) },
    SoTien: { type: DataTypes.DECIMAL(12, 2) },
    PhuongThuc: { type: DataTypes.ENUM('VNPay', 'Momo', 'TienMat') },
    TrangThai: { type: DataTypes.ENUM('ChoThanhToan', 'ThanhCong', 'ThatBai') },
    MoTa: { type: DataTypes.TEXT }
}, { tableName: 'thanhtoan', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = ThanhToan;