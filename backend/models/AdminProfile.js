const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminProfile = sequelize.define('AdminProfile', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: { model: 'nguoidung', key: 'Id_NguoiDung' } 
    },
    admin_type: { 
        type: DataTypes.ENUM('SUPER_ADMIN', 'FACILITY_ADMIN'), 
        defaultValue: 'FACILITY_ADMIN' 
    },
    facility_id: { 
        type: DataTypes.INTEGER, 
        allowNull: true, // Null for SUPER_ADMIN
        references: { model: 'phongkham', key: 'Id_PhongKham' } 
    },
    // Granular Permissions
    can_manage_doctors: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_manage_staff: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_manage_patients: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_view_stats: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_manage_payments: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_manage_specialties: { type: DataTypes.BOOLEAN, defaultValue: false }, // Usually only for Super Admin
    can_manage_admins: { type: DataTypes.BOOLEAN, defaultValue: false }      // Usually only for Super Admin
}, { 
    tableName: 'admin_profiles', 
    timestamps: true 
});

module.exports = AdminProfile;
