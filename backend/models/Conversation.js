const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  conversation_type: {
    type: DataTypes.ENUM('appointment_chat', 'support_chat', 'internal_chat'),
    allowNull: false
  },
  appointment_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: { model: 'datlich', key: 'Id_DatLich' }
  },
  support_case_id: { type: DataTypes.BIGINT, allowNull: true },
  created_by: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'nguoidung', key: 'Id_NguoiDung' }
  },
  facility_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'phongkham', key: 'Id_PhongKham' }
  },
  status: {
    type: DataTypes.ENUM('open', 'closed', 'archived'),
    allowNull: false,
    defaultValue: 'open'
  },
  title: { type: DataTypes.STRING(255), allowNull: true },
  last_message_at: { type: DataTypes.DATE, allowNull: true },
  closed_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'conversations',
  underscored: true,
  timestamps: true
});

module.exports = Conversation;
