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
const Review = require('./Review');
const MedicalRecord = require('./MedicalRecord');
const DoctorSchedule = require('./DoctorSchedule');
const Prescription = require('./Prescription');
const Consultation = require('./Consultation');
const AISession = require('./AISession');
const AIModerationContent = require('./AIModerationContent');
const SystemSetting = require('./SystemSetting');
const AIDiagnosis = require('./AIDiagnosis');

// Define relationships

// User & Roles
User.hasOne(Doctor, { foreignKey: 'user_id' });
Doctor.belongsTo(User, { foreignKey: 'user_id' });

// ... (existing relationships)

// AI Diagnoses
// AI Diagnoses
AIDiagnosis.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(AIDiagnosis, { foreignKey: 'user_id' });
AIDiagnosis.belongsTo(Doctor, { foreignKey: 'doctor_id' });
Doctor.hasMany(AIDiagnosis, { foreignKey: 'doctor_id' });



User.hasOne(Patient, { foreignKey: 'user_id' });
Patient.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(AdminPermission, { foreignKey: 'user_id' });
AdminPermission.belongsTo(User, { foreignKey: 'user_id' });

// Doctor & Specialty
Doctor.belongsTo(Specialty, { foreignKey: 'specialty_id' });
Specialty.hasMany(Doctor, { foreignKey: 'specialty_id' });

// Doctor Schedule
Doctor.hasMany(DoctorSchedule, { foreignKey: 'doctor_id' });
DoctorSchedule.belongsTo(Doctor, { foreignKey: 'doctor_id' });

// Appointments
Appointment.belongsTo(User, { as: 'Patient', foreignKey: 'patient_id' });
Appointment.belongsTo(User, { as: 'Doctor', foreignKey: 'doctor_id' });
User.hasMany(Appointment, { as: 'PatientAppointments', foreignKey: 'patient_id' });
User.hasMany(Appointment, { as: 'DoctorAppointments', foreignKey: 'doctor_id' });

// Payments
Payment.belongsTo(Appointment, { foreignKey: 'appointment_id' });
Appointment.hasOne(Payment, { foreignKey: 'appointment_id' });

// Medical Records
MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointment_id' });
Appointment.hasOne(MedicalRecord, { foreignKey: 'appointment_id' });
MedicalRecord.belongsTo(User, { as: 'Patient', foreignKey: 'patient_id' });
MedicalRecord.belongsTo(User, { as: 'Doctor', foreignKey: 'doctor_id' });

// Prescriptions
Prescription.belongsTo(MedicalRecord, { foreignKey: 'record_id' });
MedicalRecord.hasMany(Prescription, { foreignKey: 'record_id' });

// Reviews
Review.belongsTo(Appointment, { foreignKey: 'appointment_id' });
Appointment.hasOne(Review, { foreignKey: 'appointment_id' });
Review.belongsTo(User, { as: 'Patient', foreignKey: 'patient_id' });
Review.belongsTo(User, { as: 'Doctor', foreignKey: 'doctor_id' });
User.hasMany(Review, { foreignKey: 'patient_id', as: 'PatientReviews' });
User.hasMany(Review, { foreignKey: 'doctor_id', as: 'DoctorReviews' });

// Consultations
Consultation.belongsTo(Appointment, { foreignKey: 'appointment_id' });
Appointment.hasOne(Consultation, { foreignKey: 'appointment_id' });

// Messages (Linked to Consultation)
Message.belongsTo(Consultation, { foreignKey: 'consultation_id' });
Consultation.hasMany(Message, { foreignKey: 'consultation_id' });
Message.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id' });

// Conversations
Conversation.belongsTo(User, { as: 'Patient', foreignKey: 'patient_id' });
Conversation.belongsTo(User, { as: 'Doctor', foreignKey: 'doctor_id' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });
Conversation.hasMany(Message, { foreignKey: 'conversation_id' });

// AI Sessions
AISession.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(AISession, { foreignKey: 'user_id' });

// AI Moderation
AIModerationContent.belongsTo(User, { as: 'Reviewer', foreignKey: 'reviewed_by' });
AIModerationContent.belongsTo(User, { as: 'User', foreignKey: 'user_id' });

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
  Message,
  Review,
  MedicalRecord,
  DoctorSchedule,
  Prescription,
  Consultation,
  AISession,
  AIModerationContent,
  SystemSetting,
  AIDiagnosis
};
