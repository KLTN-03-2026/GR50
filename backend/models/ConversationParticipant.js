const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConversationParticipant = sequelize.define('ConversationParticipant', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  conversation_id: { 
    type: DataTypes.BIGINT, 
    allowNull: false,
    references: { model: 'conversations', key: 'id' }
  },
  user_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'nguoidung', key: 'Id_NguoiDung' }
  },
  role_in_conversation: {
    type: DataTypes.ENUM('patient', 'doctor', 'staff', 'admin', 'system'),
    allowNull: false
  },
  joined_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  left_at: { type: DataTypes.DATE, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  last_read_message_id: { type: DataTypes.BIGINT, allowNull: true },
  last_read_at: { type: DataTypes.DATE, allowNull: true }
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
