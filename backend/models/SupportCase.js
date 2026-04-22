const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupportCase = sequelize.define('SupportCase', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  patient_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'benhnhan', key: 'Id_BenhNhan' }
  },
  staff_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: { model: 'nguoidung', key: 'Id_NguoiDung' }
  },
  case_type: {
    type: DataTypes.ENUM('booking', 'payment', 'video_support', 'checkin', 'general_support'),
    allowNull: false
  },
  related_appointment_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: { model: 'datlich', key: 'Id_DatLich' }
  },
  facility_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'PhongKham', key: 'Id_PhongKham' }
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
    allowNull: false,
    defaultValue: 'open'
  },
  note: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'support_cases',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['patient_id'] },
    { fields: ['staff_id'] },
    { fields: ['status'] }
  ]
});

module.exports = SupportCase;
