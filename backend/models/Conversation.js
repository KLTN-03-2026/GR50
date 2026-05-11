const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  conversationType: {
    type: DataTypes.ENUM('appointment_chat', 'support_chat', 'internal_chat'),
    allowNull: false,
    field: 'conversation_type'
  },
  appointmentId: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    field: 'appointment_id',
    references: { model: 'datlich', key: 'Id_DatLich' }
  },
  supportCaseId: { type: DataTypes.BIGINT, allowNull: true, field: 'support_case_id' },
  createdBy: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'created_by',
    references: { model: 'nguoidung', key: 'Id_NguoiDung' }
  },
  facilityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'facility_id',
    references: { model: 'phongkham', key: 'Id_PhongKham' }
  },
  status: {
    type: DataTypes.ENUM('open', 'closed', 'archived'),
    allowNull: false,
    defaultValue: 'open'
  },
  title: { type: DataTypes.STRING(255), allowNull: true },
  lastMessageAt: { type: DataTypes.DATE, allowNull: true, field: 'last_message_at' },
  closedAt: { type: DataTypes.DATE, allowNull: true, field: 'closed_at' }
}, {
  tableName: 'conversations',
  underscored: true,
  timestamps: true
});

module.exports = Conversation;
