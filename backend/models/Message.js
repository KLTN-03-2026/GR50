const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  conversationId: { 
    type: DataTypes.BIGINT, 
    allowNull: false,
    field: 'conversation_id',
    references: { model: 'conversations', key: 'id' }
  },
  senderId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'sender_id',
    references: { model: 'nguoidung', key: 'Id_NguoiDung' }
  },
  senderRole: {
    type: DataTypes.ENUM('patient', 'doctor', 'staff', 'admin', 'system'),
    allowNull: false,
    field: 'sender_role'
  },
  messageType: {
    type: DataTypes.ENUM('text', 'image', 'file', 'system', 'call_event'),
    allowNull: false,
    defaultValue: 'text',
    field: 'message_type'
  },
  content: { type: DataTypes.TEXT, allowNull: true },
  replyToMessageId: { type: DataTypes.BIGINT, allowNull: true, field: 'reply_to_message_id' },
  isEdited: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_edited' },
  editedAt: { type: DataTypes.DATE, allowNull: true, field: 'edited_at' },
  isDeleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_deleted' },
  deletedAt: { type: DataTypes.DATE, allowNull: true, field: 'deleted_at' }
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
