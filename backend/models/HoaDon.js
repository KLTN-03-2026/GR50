const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HoaDon = sequelize.define('HoaDon', {
    Id_HoaDon: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MaHoaDon: { type: DataTypes.STRING(50), unique: true },
    Id_DatLich: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'datlich', key: 'Id_DatLich' } },
    Id_PhongKham: { type: DataTypes.INTEGER, references: { model: 'PhongKham', key: 'Id_PhongKham' } },
    patientId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'benhnhan', key: 'Id_BenhNhan' } },
    Id_BacSi: { type: DataTypes.INTEGER, references: { model: 'bacsi', key: 'Id_BacSi' } },
    paymentId: { type: DataTypes.INTEGER, references: { model: 'payment_requests', key: 'id' } },
    TongTienKham: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    TongTienCanLamSang: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    TongTienThuoc: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    GiamGia: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    LyDoGiamGia: { type: DataTypes.STRING(255) },
    TongTien: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    TrangThai: { 
        type: DataTypes.ENUM('DRAFT', 'WAITING_PATIENT_CONFIRM', 'WAITING_PAYMENT', 'PAID', 'CANCELLED'), 
        defaultValue: 'DRAFT' 
    },
    BenhNhanLayThuoc: { type: DataTypes.TINYINT, defaultValue: 0 },
    GhiChu: { type: DataTypes.TEXT }
}, { tableName: 'hoadon', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = HoaDon;
