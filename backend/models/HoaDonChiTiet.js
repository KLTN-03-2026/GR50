const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HoaDonChiTiet = sequelize.define('HoaDonChiTiet', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_HoaDon: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'hoadon', key: 'Id_HoaDon' } },
    LoaiDong: { 
        type: DataTypes.ENUM('PHI_KHAM', 'CAN_LAM_SANG', 'THUOC', 'GIAM_GIA'), 
        allowNull: false 
    },
    Id_ThamChieu: { type: DataTypes.INTEGER },
    TenMuc: { type: DataTypes.STRING(255), allowNull: false },
    DonGia: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    SoLuong: { type: DataTypes.DECIMAL(10, 2), defaultValue: 1 },
    ThanhTien: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    GhiChu: { type: DataTypes.TEXT }
}, { 
    tableName: 'hoa_don_chi_tiet', 
    timestamps: false 
});

module.exports = HoaDonChiTiet;
