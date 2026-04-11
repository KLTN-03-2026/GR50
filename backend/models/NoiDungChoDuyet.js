const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NoiDungChoDuyet = sequelize.define('NoiDungChoDuyet', {
    Id_NoiDungChoDuyet: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    CauHoiNguoiDung: { type: DataTypes.TEXT },
    PhanHoiAI: { type: DataTypes.TEXT },
    TuKhoaPhatHien: { type: DataTypes.STRING(255) },
    TrangThai: { type: DataTypes.ENUM('ChoDuyet', 'DaDuyet', 'TuChoi') },
    Id_QuanTriVien: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } }
}, { tableName: 'noidungchoduyet', timestamps: true, updatedAt: 'NgayDuyet', createdAt: false });

module.exports = NoiDungChoDuyet;