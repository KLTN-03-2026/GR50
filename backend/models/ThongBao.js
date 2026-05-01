const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ThongBao = sequelize.define('ThongBao', {
    Id_ThongBao: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Id_NguoiDung: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    NoiDung: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    Loai: {
        type: DataTypes.STRING(50),
        defaultValue: 'HE_THONG'
    },
    DaDoc: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    Id_DatLich: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'datlich', key: 'Id_DatLich' }
    },
    ScheduledAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    SentAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Status: {
        type: DataTypes.ENUM('PENDING', 'SENT', 'FAILED'),
        defaultValue: 'PENDING'
    }
}, {
    tableName: 'ThongBao',
    timestamps: true,
    // createdAt: 'NgayTao',
    // updatedAt: 'NgayCapNhat'
});

module.exports = ThongBao;
