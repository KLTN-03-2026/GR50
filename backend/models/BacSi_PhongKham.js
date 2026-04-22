const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BacSi_PhongKham = sequelize.define('BacSi_PhongKham', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    doctor_id: { type: DataTypes.INTEGER, references: { model: 'bacsi', key: 'Id_BacSi' } },
    facility_id: { type: DataTypes.INTEGER, references: { model: 'PhongKham', key: 'Id_PhongKham' } },
    is_primary: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    supports_online: { type: DataTypes.BOOLEAN, defaultValue: true },
    supports_offline: { type: DataTypes.BOOLEAN, defaultValue: true },
    consultation_fee_online: { type: DataTypes.DECIMAL(12, 2) },
    consultation_fee_offline: { type: DataTypes.DECIMAL(12, 2) }
}, { 
    tableName: 'bacsi_phongkham', 
    timestamps: true, 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
});

module.exports = BacSi_PhongKham;
