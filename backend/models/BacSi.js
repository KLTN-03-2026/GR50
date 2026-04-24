const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BacSi = sequelize.define('BacSi', {
    Id_BacSi: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_NguoiDung: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    Id_ChuyenKhoa: { type: DataTypes.INTEGER, references: { model: 'chuyenkhoa', key: 'Id_ChuyenKhoa' } },
    SoChungChiHanhNghe: { type: DataTypes.STRING(100) },

    SoNamKinhNghiem: { type: DataTypes.INTEGER },
    PhiTuVan: { type: DataTypes.DECIMAL(12, 2) },
    ThoiLuongKham: { type: DataTypes.INTEGER, defaultValue: 30 }, // duration in minutes
    SoLuongKhachMacDinh: { type: DataTypes.INTEGER, defaultValue: 10 }, // max patients per session
    GioiThieu: { type: DataTypes.TEXT },
    HocHamHocVi: { type: DataTypes.STRING(150) },
    NoiLamViec: { type: DataTypes.STRING(255) },
    LichLamViec: { type: DataTypes.TEXT }, // JSON data for recurring schedule
    TrangThai: { type: DataTypes.ENUM('HoatDong', 'NgungHoatDong') }
}, { tableName: 'bacsi', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = BacSi;