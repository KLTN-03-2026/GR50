const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AITuVanTinNhan = sequelize.define('AITuVanTinNhan', {
    Id_AITuVanTinNhan: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    Id_AITuVanPhien: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    VaiTro: {
        type: DataTypes.ENUM('user', 'assistant', 'system'),
        allowNull: false,
    },
    NoiDung: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    },
    RawJson: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    tableName: 'aituvantinnhan',
    timestamps: true,
    createdAt: 'NgayTao',
    updatedAt: false,
});

module.exports = AITuVanTinNhan;
