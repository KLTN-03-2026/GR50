const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ThanhToan = sequelize.define('ThanhToan', {
    Id_ThanhToan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_DatLich: { type: DataTypes.INTEGER, references: { model: 'datlich', key: 'Id_DatLich' } },
    Id_BenhNhan: { type: DataTypes.INTEGER, references: { model: 'benhnhan', key: 'Id_BenhNhan' } },
    Id_PhongKham: { type: DataTypes.INTEGER, references: { model: 'PhongKham', key: 'Id_PhongKham' } },
    Id_HoaDon: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'hoadon', key: 'Id_HoaDon' } },
    MaDonHang: { type: DataTypes.STRING(100) },
    MaGiaoDich: { type: DataTypes.STRING(100) },
    SoTien: { type: DataTypes.DECIMAL(12, 2) },
    PhuongThuc: { type: DataTypes.ENUM('VNPay', 'Momo', 'TienMat') },
    TrangThai: { type: DataTypes.ENUM('ChoThanhToan', 'ThanhCong', 'ThatBai', 'UNPAID', 'PAYMENT_PENDING', 'PAID', 'FAILED', 'REFUNDED') },
    MoTa: { type: DataTypes.TEXT }
}, { tableName: 'thanhtoan', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = ThanhToan;