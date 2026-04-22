const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PasswordReset = sequelize.define('PasswordReset', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    contact: { type: DataTypes.STRING(100), allowNull: false },
    otp_code: { type: DataTypes.STRING(10), allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    is_used: { type: DataTypes.BOOLEAN, defaultValue: false },
    attempt_count: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
    tableName: 'password_resets',
    timestamps: true,
    createdAt: 'NgayTao',
    updatedAt: 'NgayCapNhat'
});

module.exports = PasswordReset;
