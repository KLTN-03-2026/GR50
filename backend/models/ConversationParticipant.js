const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConversationParticipant = sequelize.define('ConversationParticipant', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  conversationId: { 
    type: DataTypes.BIGINT, 
    allowNull: false,
    field: 'conversation_id',
    references: { model: 'conversations', key: 'id' }
  },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'user_id',
    references: { model: 'nguoidung', key: 'Id_NguoiDung' }
  },
  roleInConversation: {
    type: DataTypes.ENUM('patient', 'doctor', 'staff', 'admin', 'system'),
    allowNull: false,
    field: 'role_in_conversation'
  },
  joinedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'joined_at' },
  leftAt: { type: DataTypes.DATE, allowNull: true, field: 'left_at' },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
  lastReadMessageId: { type: DataTypes.BIGINT, allowNull: true, field: 'last_read_message_id' },
  lastReadAt: { type: DataTypes.DATE, allowNull: true, field: 'last_read_at' }
}, {
  tableName: 'conversation_participants',
  underscored: true,
  timestamps: false,
  indexes: [
    { unique: true, fields: ['conversation_id', 'user_id'] },
    { fields: ['user_id'] }
  ]
});

module.exports = ConversationParticipant;
