const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TinNhanKham = sequelize.define('TinNhanKham', {
    Id_TinNhan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_KhamOnline: { type: DataTypes.INTEGER, references: { model: 'khamonline', key: 'Id_KhamOnline' } },
    Id_NguoiGui: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    LoaiTinNhan: { type: DataTypes.ENUM('Text', 'File', 'Image') },
    NoiDung: { type: DataTypes.TEXT },
    TapDinhKem: { type: DataTypes.TEXT },
    DaDoc: { type: DataTypes.TINYINT }
}, { tableName: 'tinnhankham', timestamps: true, createdAt: 'ThoiGianGui', updatedAt: false });

module.exports = TinNhanKham;