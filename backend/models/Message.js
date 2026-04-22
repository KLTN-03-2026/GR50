const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  conversation_id: { 
    type: DataTypes.BIGINT, 
    allowNull: false,
    references: { model: 'conversations', key: 'id' }
  },
  sender_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'nguoidung', key: 'Id_NguoiDung' }
  },
  sender_role: {
    type: DataTypes.ENUM('patient', 'doctor', 'staff', 'admin', 'system'),
    allowNull: false
  },
  message_type: {
    type: DataTypes.ENUM('text', 'image', 'file', 'system', 'call_event'),
    allowNull: false,
    defaultValue: 'text'
  },
  content: { type: DataTypes.TEXT, allowNull: true },
  reply_to_message_id: { type: DataTypes.BIGINT, allowNull: true },
  is_edited: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  edited_at: { type: DataTypes.DATE, allowNull: true },
  is_deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'messages',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['conversation_id'] },
    { fields: ['sender_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Message;
