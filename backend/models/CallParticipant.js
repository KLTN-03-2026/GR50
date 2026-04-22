const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CallParticipant = sequelize.define('CallParticipant', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  call_session_id: { 
    type: DataTypes.BIGINT, 
    allowNull: false,
    references: { model: 'call_sessions', key: 'id' }
  },
  user_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'nguoidung', key: 'Id_NguoiDung' }
  },
  joined_at: { type: DataTypes.DATE, allowNull: true },
  left_at: { type: DataTypes.DATE, allowNull: true },
  join_status: {
    type: DataTypes.ENUM('invited', 'joined', 'declined', 'missed'),
    allowNull: false,
    defaultValue: 'invited'
  },
  device_info: { type: DataTypes.STRING(255), allowNull: true }
}, {
  tableName: 'call_participants',
  underscored: true,
  timestamps: false,
  indexes: [
    { unique: true, fields: ['call_session_id', 'user_id'] }
  ]
});

module.exports = CallParticipant;
