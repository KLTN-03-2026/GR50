const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CallSession = sequelize.define('CallSession', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  conversationId: { 
    type: DataTypes.BIGINT, 
    allowNull: false,
    field: 'conversation_id',
    references: { model: 'conversations', key: 'id' }
  },
  appointmentId: { 
    type: DataTypes.INTEGER, 
    allowNull: true,
    field: 'appointment_id',
    references: { model: 'datlich', key: 'Id_DatLich' }
  },
  facilityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'facility_id',
    references: { model: 'phongkham', key: 'Id_PhongKham' }
  },
  callType: {
    type: DataTypes.ENUM('audio', 'video'),
    allowNull: false,
    field: 'call_type'
  },
  provider: {
    type: DataTypes.ENUM('webrtc', 'jitsi', 'agora', 'twilio'),
    allowNull: false,
    defaultValue: 'webrtc'
  },
  roomCode: { type: DataTypes.STRING(255), allowNull: false, field: 'room_code' },
  startedBy: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'started_by',
    references: { model: 'nguoidung', key: 'Id_NguoiDung' }
  },
  status: {
    type: DataTypes.ENUM('waiting', 'ongoing', 'ended', 'cancelled', 'missed'),
    allowNull: false,
    defaultValue: 'waiting'
  },
  scheduledAt: { type: DataTypes.DATE, allowNull: true, field: 'scheduled_at' },
  startedAt: { type: DataTypes.DATE, allowNull: true, field: 'started_at' },
  endedAt: { type: DataTypes.DATE, allowNull: true, field: 'ended_at' },
  durationSeconds: { type: DataTypes.INTEGER, allowNull: true, field: 'duration_seconds' }
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
