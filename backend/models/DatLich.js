const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DatLich = sequelize.define('DatLich', {
    Id_DatLich: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MaDatLich: { type: DataTypes.STRING(30) },
    Id_BenhNhan: { type: DataTypes.INTEGER, references: { model: 'benhnhan', key: 'Id_BenhNhan' } },
    Id_LichKham: { type: DataTypes.INTEGER, references: { model: 'lichkham', key: 'Id_LichKham' } },
    Id_PhongKham: { type: DataTypes.INTEGER, references: { model: 'PhongKham', key: 'Id_PhongKham' } },
    Id_BacSi: { type: DataTypes.INTEGER, references: { model: 'bacsi', key: 'Id_BacSi' } },
    TrangThai: { type: DataTypes.ENUM('ChoXacNhan', 'DaXacNhan', 'DaKham', 'Huy', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW') },
    TrieuChungSoBo: { type: DataTypes.TEXT },
    GhiChu: { type: DataTypes.TEXT },
    LyDoHuy: { type: DataTypes.TEXT },
    DaGuiNhac: { type: DataTypes.TINYINT },
    GiaTien: { type: DataTypes.DECIMAL(12, 2) },
    ThoiDiemDat: { type: DataTypes.DATE },
    LinkPhongHop: { type: DataTypes.TEXT },
    LinkGhiAm: { type: DataTypes.TEXT },
    RoomStatus: { type: DataTypes.ENUM('WAITING', 'ACTIVE', 'FINISHED'), defaultValue: 'WAITING' },
    BookingSource: { type: DataTypes.ENUM('AUTHENTICATED', 'GUEST'), defaultValue: 'AUTHENTICATED' },
    IdentityStatus: { type: DataTypes.ENUM('VERIFIED_ACCOUNT', 'VERIFIED_GUEST', 'UNVERIFIED_GUEST'), defaultValue: 'VERIFIED_ACCOUNT' },
    STT_HangCho: { type: DataTypes.INTEGER },
    CheckedInAt: { type: DataTypes.DATE },
    CheckedInBy: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } }
}, { tableName: 'datlich', timestamps: true, createdAt: 'NgayTao', updatedAt: 'NgayCapNhat' });

module.exports = DatLich;