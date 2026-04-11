const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VaiTro = sequelize.define('VaiTro', {
    Id_VaiTro: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    MaVaiTro: { type: DataTypes.STRING(30), allowNull: false },
    TenVaiTro: { type: DataTypes.STRING(100), allowNull: false },
    MoTa: { type: DataTypes.STRING(255) }
}, { tableName: 'vaitro', timestamps: true, createdAt: 'NgayTao', updatedAt: false });

module.exports = VaiTro;