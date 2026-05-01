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
    NoiDaoTao: { type: DataTypes.STRING(255) },
    NoiLamViec: { type: DataTypes.STRING(255) },
    NgonNgu: { type: DataTypes.STRING(255), defaultValue: 'Tiếng Việt' },
    DichVuCungCap: { type: DataTypes.TEXT },
    
    // Verification & Status
    TrangThaiHoSo: { 
        type: DataTypes.ENUM('ChoDuyet', 'DaDuyet', 'TuChoi'), 
        defaultValue: 'ChoDuyet' 
    },
    AnhBangCap: { type: DataTypes.TEXT }, // JSON array of certificate image URLs
    
    LichLamViec: { type: DataTypes.TEXT }, // JSON data for recurring schedule
    TrangThai: { type: DataTypes.ENUM('HoatDong', 'NgungHoatDong'), defaultValue: 'HoatDong' }
}, { tableName: 'bacsi', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = BacSi;