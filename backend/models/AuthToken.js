const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuthToken = sequelize.define('AuthToken', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_NguoiDung: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    Type: { type: DataTypes.ENUM('PASSWORD_RESET_OTP', 'PASSWORD_RESET_TOKEN', 'EMAIL_VERIFICATION', 'GUEST_BOOKING_OTP'), allowNull: false },
    Token: { type: DataTypes.STRING(255), allowNull: false },
    Contact: { type: DataTypes.STRING(100) }, // Email or Phone used
    ExpiresAt: { type: DataTypes.DATE, allowNull: false },
    IsUsed: { type: DataTypes.BOOLEAN, defaultValue: false },
    AttemptCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    ReferenceId: { type: DataTypes.INTEGER } // ID of the related entity (e.g., DatLich ID)
}, { tableName: 'authtokens', timestamps: true });

module.exports = AuthToken;
