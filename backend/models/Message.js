const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  consultation_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'consultations',
      key: 'id'
    }
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'conversations',
      key: 'id'
    }
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'messages'
});

module.exports = Message;
