const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AITuVanPhien = sequelize.define('AITuVanPhien', {
    Id_AITuVanPhien: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    Id_NguoiDung: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    TieuDe: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    TrieuChungTomTat: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    GoiYChuyenKhoa: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    MucDoUuTien: {
        type: DataTypes.ENUM('Thap', 'TrungBinh', 'Cao', 'KhanCap'),
        allowNull: false,
        defaultValue: 'TrungBinh',
    },
    TrangThai: {
        type: DataTypes.ENUM('DangHoatDong', 'DaDong', 'DaAn'),
        allowNull: false,
        defaultValue: 'DangHoatDong',
    },
    ChuanDoanSoBo: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    LoiKhuyen: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    TrangThaiChuyenGiao: {
        type: DataTypes.ENUM('pending', 'assigned', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
    },
    Id_BacSi_PhuTrach: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    Id_PhongKham: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    tableName: 'aituvanphien',
    timestamps: true,
    createdAt: 'NgayTao',
    updatedAt: 'NgayCapNhat',
});

module.exports = AITuVanPhien;
