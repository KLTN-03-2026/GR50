const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Staff_Facility = sequelize.define('Staff_Facility', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    staff_id: { type: DataTypes.INTEGER, references: { model: 'StaffProfile', key: 'id' } },
    facility_id: { type: DataTypes.INTEGER, references: { model: 'PhongKham', key: 'Id_PhongKham' } },
    can_reception: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_booking_assist: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_manage_appointments: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_payment: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_support_chat: { type: DataTypes.BOOLEAN, defaultValue: false },
    can_video_support: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { 
    tableName: 'staff_facilities', 
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Staff_Facility;
