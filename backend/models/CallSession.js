const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CallSession = sequelize.define('CallSession', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  conversation_id: { 
    type: DataTypes.BIGINT, 
    allowNull: false,
    references: { model: 'conversations', key: 'id' }
  },
  appointment_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    references: { model: 'datlich', key: 'Id_DatLich' }
  },
  facility_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'phongkham', key: 'Id_PhongKham' }
  },
  call_type: {
    type: DataTypes.ENUM('audio', 'video'),
    allowNull: false
  },
  provider: {
    type: DataTypes.ENUM('webrtc', 'jitsi', 'agora', 'twilio'),
    allowNull: false,
    defaultValue: 'webrtc'
  },
  room_code: { type: DataTypes.STRING(255), allowNull: false },
  started_by: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: 'nguoidung', key: 'Id_NguoiDung' }
  },
  status: {
    type: DataTypes.ENUM('waiting', 'ongoing', 'ended', 'cancelled', 'missed'),
    allowNull: false,
    defaultValue: 'waiting'
  },
  scheduled_at: { type: DataTypes.DATE, allowNull: true },
  started_at: { type: DataTypes.DATE, allowNull: true },
  ended_at: { type: DataTypes.DATE, allowNull: true },
  duration_seconds: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'call_sessions',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['conversation_id'] },
    { fields: ['appointment_id'] },
    { fields: ['status'] }
  ]
});

module.exports = CallSession;
