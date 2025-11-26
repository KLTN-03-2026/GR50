const sequelize = require('../config/database');
const User = require('./User');
const Specialty = require('./Specialty');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const AdminPermission = require('./AdminPermission');
const Payment = require('./Payment');
const Conversation = require('./Conversation');
const Message = require('./Message');

// Define relationships
Conversation.belongsTo(User, { as: 'Patient', foreignKey: 'patient_id' });
Conversation.belongsTo(User, { as: 'Doctor', foreignKey: 'doctor_id' });
Conversation.hasMany(Message, { foreignKey: 'conversation_id' });

Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });
Message.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id' });

module.exports = {
  sequelize,
  User,
  Specialty,
  Doctor,
  Patient,
  Appointment,
  AdminPermission,
  Payment,
  Conversation,
  Message
};
