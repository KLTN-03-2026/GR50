const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StaffProfile = sequelize.define('StaffProfile', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, references: { model: 'nguoidung', key: 'Id_NguoiDung' } },
    employee_code: { type: DataTypes.STRING(50), unique: true },
    position_title: { type: DataTypes.STRING(100) },
    note: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('active', 'inactive', 'pending'), defaultValue: 'pending' }
}, { 
    tableName: 'staff_profiles', 
    timestamps: true, 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
});

module.exports = StaffProfile;
