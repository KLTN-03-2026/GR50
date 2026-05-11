const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppointmentStatusHistory = sequelize.define('AppointmentStatusHistory', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  appointment_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'datlich', key: 'Id_DatLich' }
  },
  old_status: { type: DataTypes.STRING(50) },
  new_status: { type: DataTypes.STRING(50), allowNull: false },
  reason: { type: DataTypes.TEXT },
  actor_id: { 
    type: DataTypes.INTEGER, 
    references: { model: 'nguoidung', key: 'Id_NguoiDung' }
  },
  actor_role: { type: DataTypes.STRING(20) }
}, {
  tableName: 'appointment_status_history',
  timestamps: true,
  underscored: true,
  updatedAt: false
});

module.exports = AppointmentStatusHistory;
