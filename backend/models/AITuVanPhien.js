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
}, {
    tableName: 'aituvanphien',
    timestamps: true,
    createdAt: 'NgayTao',
    updatedAt: 'NgayCapNhat',
});

module.exports = AITuVanPhien;
