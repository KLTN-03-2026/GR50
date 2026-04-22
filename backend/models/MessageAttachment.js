const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessageAttachment = sequelize.define('MessageAttachment', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  message_id: { 
    type: DataTypes.BIGINT, 
    allowNull: false,
    references: { model: 'messages', key: 'id' }
  },
  file_name: { type: DataTypes.STRING(255), allowNull: false },
  file_url: { type: DataTypes.STRING(500), allowNull: false },
  file_type: { type: DataTypes.STRING(100), allowNull: true },
  file_size: { type: DataTypes.BIGINT, allowNull: true }
}, {
  tableName: 'message_attachments',
  underscored: true,
  timestamps: true
});

module.exports = MessageAttachment;
