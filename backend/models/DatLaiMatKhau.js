const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DatLaiMatKhau = sequelize.define('DatLaiMatKhau', {
    Id_DatLai: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_NguoiDung: { type: DataTypes.INTEGER, allowNull: false },
    Token: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    NgayHetHan: { type: DataTypes.DATE, allowNull: false },
    DaSuDung: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
    tableName: 'datlaimatkhau',
    timestamps: true,
    createdAt: 'NgayTao',
    updatedAt: 'NgayCapNhat',
    deletedAt: false
});

module.exports = DatLaiMatKhau;
