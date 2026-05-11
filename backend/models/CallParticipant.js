const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CallParticipant = sequelize.define('CallParticipant', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  callSessionId: { 
    type: DataTypes.BIGINT, 
    allowNull: false,
    field: 'call_session_id',
    references: { model: 'call_sessions', key: 'id' }
  },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'user_id',
    references: { model: 'nguoidung', key: 'Id_NguoiDung' }
  },
  joinedAt: { type: DataTypes.DATE, allowNull: true, field: 'joined_at' },
  leftAt: { type: DataTypes.DATE, allowNull: true, field: 'left_at' },
  joinStatus: {
    type: DataTypes.ENUM('invited', 'joined', 'declined', 'missed'),
    allowNull: false,
    defaultValue: 'invited',
    field: 'join_status'
  },
  deviceInfo: { type: DataTypes.STRING(255), allowNull: true, field: 'device_info' }
}, {
  tableName: 'call_participants',
  underscored: true,
  timestamps: false,
  indexes: [
    { unique: true, fields: ['call_session_id', 'user_id'] }
  ]
});

module.exports = CallParticipant;
