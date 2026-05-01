const sequelize = require('../config/database');

const VaiTro = require('./VaiTro.js');
const NguoiDung = require('./NguoiDung.js');
const NguoiDung_VaiTro = require('./NguoiDung_VaiTro.js');
const BenhNhan = require('./BenhNhan.js');
const ChuyenKhoa = require('./ChuyenKhoa.js');
const BacSi = require('./BacSi.js');
const LichKham = require('./LichKham.js');
const DatLich = require('./DatLich.js');
const HoSoBenhAn = require('./HoSoBenhAn.js');
const DonThuoc = require('./DonThuoc.js');
const ChiTietDonThuoc = require('./ChiTietDonThuoc.js');
const HoaDon = require('./HoaDon.js');
const ThanhToan = require('./ThanhToan.js');
const TinNhanKham = require('./TinNhanKham.js');
const ThongBao = require('./ThongBao.js');
const PhongKham = require('./PhongKham.js');
const AITuVanPhien = require('./AITuVanPhien.js');
const AITuVanTinNhan = require('./AITuVanTinNhan.js');
const AuthToken = require('./AuthToken.js');
const DanhGia = require('./DanhGia.js');
const Conversation = require('./Conversation.js');
const ConversationParticipant = require('./ConversationParticipant.js');
const Message = require('./Message.js');
const MessageAttachment = require('./MessageAttachment.js');
const CallSession = require('./CallSession.js');
const CallParticipant = require('./CallParticipant.js');
const SupportCase = require('./SupportCase.js');
const BacSi_PhongKham = require('./BacSi_PhongKham.js');
const NguoiDung_PhongKham = require('./NguoiDung_PhongKham.js');
const StaffProfile = require('./StaffProfile.js');
const Staff_Facility = require('./Staff_Facility.js');
const AccessLog = require('./AccessLog.js');
const AdminProfile = require('./AdminProfile.js');



// Define associations
VaiTro.belongsToMany(NguoiDung, { through: NguoiDung_VaiTro, foreignKey: 'Id_VaiTro', otherKey: 'Id_NguoiDung' });
NguoiDung.belongsToMany(VaiTro, { through: NguoiDung_VaiTro, foreignKey: 'Id_NguoiDung', otherKey: 'Id_VaiTro' });

NguoiDung.hasMany(ThongBao, { foreignKey: 'Id_NguoiDung' });
ThongBao.belongsTo(NguoiDung, { foreignKey: 'Id_NguoiDung' });

NguoiDung.hasMany(AuthToken, { foreignKey: 'Id_NguoiDung' });
AuthToken.belongsTo(NguoiDung, { foreignKey: 'Id_NguoiDung' });

BenhNhan.belongsTo(NguoiDung, { foreignKey: 'Id_NguoiDung' });
NguoiDung.hasOne(BenhNhan, { foreignKey: 'Id_NguoiDung' });

BacSi.belongsTo(NguoiDung, { foreignKey: 'Id_NguoiDung' });
NguoiDung.hasOne(BacSi, { foreignKey: 'Id_NguoiDung' });

NguoiDung.belongsTo(ChuyenKhoa, { foreignKey: 'Id_ChuyenKhoa_QuanLy', as: 'khoaQuanLy' });
ChuyenKhoa.hasMany(NguoiDung, { foreignKey: 'Id_ChuyenKhoa_QuanLy', as: 'quanLyKhoa' });

BacSi.belongsTo(ChuyenKhoa, { foreignKey: 'Id_ChuyenKhoa' });
ChuyenKhoa.hasMany(BacSi, { foreignKey: 'Id_ChuyenKhoa' });

BacSi.belongsToMany(PhongKham, { through: BacSi_PhongKham, foreignKey: 'doctor_id', otherKey: 'facility_id', as: 'facilities' });
PhongKham.belongsToMany(BacSi, { through: BacSi_PhongKham, foreignKey: 'facility_id', otherKey: 'doctor_id', as: 'doctors' });

NguoiDung.belongsToMany(PhongKham, { through: NguoiDung_PhongKham, foreignKey: 'staff_id', otherKey: 'facility_id', as: 'facilities' });
PhongKham.belongsToMany(NguoiDung, { through: NguoiDung_PhongKham, foreignKey: 'facility_id', otherKey: 'staff_id', as: 'staffs' });

// Staff associations
NguoiDung.hasOne(StaffProfile, { foreignKey: 'user_id' });
StaffProfile.belongsTo(NguoiDung, { foreignKey: 'user_id' });
StaffProfile.belongsToMany(PhongKham, { through: Staff_Facility, foreignKey: 'staff_id', otherKey: 'facility_id', as: 'facilities' });
PhongKham.belongsToMany(StaffProfile, { through: Staff_Facility, foreignKey: 'facility_id', otherKey: 'staff_id', as: 'staffMembers' });

LichKham.belongsTo(PhongKham, { foreignKey: 'Id_PhongKham', as: 'Clinic' });
PhongKham.hasMany(LichKham, { foreignKey: 'Id_PhongKham', as: 'DoctorSchedule' });

LichKham.belongsTo(BacSi, { foreignKey: 'Id_BacSi', as: 'Doctor' });
BacSi.hasMany(LichKham, { foreignKey: 'Id_BacSi', as: 'DoctorSchedule' });

DatLich.belongsTo(BenhNhan, { foreignKey: 'Id_BenhNhan' });
BenhNhan.hasMany(DatLich, { foreignKey: 'Id_BenhNhan', as: 'appointments' });
DatLich.belongsTo(LichKham, { foreignKey: 'Id_LichKham', as: 'DoctorSchedule' });
LichKham.hasMany(DatLich, { foreignKey: 'Id_LichKham', as: 'appointments' });

DatLich.belongsTo(PhongKham, { foreignKey: 'Id_PhongKham', as: 'Clinic' });
PhongKham.hasMany(DatLich, { foreignKey: 'Id_PhongKham', as: 'appointments' });

DatLich.belongsTo(BacSi, { foreignKey: 'Id_BacSi' });
BacSi.hasMany(DatLich, { foreignKey: 'Id_BacSi' });

HoSoBenhAn.belongsTo(DatLich, { foreignKey: 'Id_DatLich' });
DatLich.hasOne(HoSoBenhAn, { foreignKey: 'Id_DatLich' });
HoSoBenhAn.belongsTo(BenhNhan, { foreignKey: 'Id_BenhNhan' });
HoSoBenhAn.belongsTo(BacSi, { foreignKey: 'Id_BacSi' });
HoSoBenhAn.belongsTo(PhongKham, { foreignKey: 'Id_PhongKham', as: 'Clinic' });
PhongKham.hasMany(HoSoBenhAn, { foreignKey: 'Id_PhongKham' });

DonThuoc.belongsTo(HoSoBenhAn, { foreignKey: 'Id_HoSo' });
HoSoBenhAn.hasMany(DonThuoc, { foreignKey: 'Id_HoSo' });

ChiTietDonThuoc.belongsTo(DonThuoc, { foreignKey: 'Id_DonThuoc' });
DonThuoc.hasMany(ChiTietDonThuoc, { foreignKey: 'Id_DonThuoc' });

HoaDon.belongsTo(DatLich, { foreignKey: 'Id_DatLich' });
DatLich.hasOne(HoaDon, { foreignKey: 'Id_DatLich' });
HoaDon.belongsTo(PhongKham, { foreignKey: 'Id_PhongKham', as: 'Clinic' });
PhongKham.hasMany(HoaDon, { foreignKey: 'Id_PhongKham' });

ThanhToan.belongsTo(HoaDon, { foreignKey: 'Id_HoaDon' });
HoaDon.hasMany(ThanhToan, { foreignKey: 'Id_HoaDon' });

ThanhToan.belongsTo(DatLich, { foreignKey: 'Id_DatLich', as: 'Appointment' });
DatLich.hasOne(ThanhToan, { foreignKey: 'Id_DatLich' });
ThanhToan.belongsTo(BenhNhan, { foreignKey: 'Id_BenhNhan' });
ThanhToan.belongsTo(PhongKham, { foreignKey: 'Id_PhongKham', as: 'Clinic' });
PhongKham.hasMany(ThanhToan, { foreignKey: 'Id_PhongKham' });

// Follow-up associations
DatLich.belongsTo(HoSoBenhAn, { foreignKey: 'TriggeringMedicalRecordId', as: 'TriggeringRecord' });
HoSoBenhAn.hasMany(DatLich, { foreignKey: 'TriggeringMedicalRecordId', as: 'FollowUpAppointments' });

// Reminder associations
ThongBao.belongsTo(DatLich, { foreignKey: 'Id_DatLich', as: 'Appointment' });
DatLich.hasMany(ThongBao, { foreignKey: 'Id_DatLich', as: 'Reminders' });

// Updated TinNhanKham to link directly to DatLich
TinNhanKham.belongsTo(DatLich, { foreignKey: 'Id_DatLich' });
DatLich.hasMany(TinNhanKham, { foreignKey: 'Id_DatLich' });
TinNhanKham.belongsTo(NguoiDung, { foreignKey: 'Id_NguoiGui' });

// AI Chat Session associations
NguoiDung.hasMany(AITuVanPhien, { foreignKey: 'Id_NguoiDung', as: 'aiSessions' });
AITuVanPhien.belongsTo(NguoiDung, { foreignKey: 'Id_NguoiDung', as: 'nguoiDung' });
AITuVanPhien.hasMany(AITuVanTinNhan, { foreignKey: 'Id_AITuVanPhien', as: 'messages', onDelete: 'CASCADE' });
AITuVanTinNhan.belongsTo(AITuVanPhien, { foreignKey: 'Id_AITuVanPhien', as: 'session' });

AITuVanPhien.belongsTo(BacSi, { foreignKey: 'Id_BacSi_PhuTrach', as: 'phuTrach' });
BacSi.hasMany(AITuVanPhien, { foreignKey: 'Id_BacSi_PhuTrach', as: 'dsTuVanAI' });

// Review associations
DanhGia.belongsTo(BacSi, { foreignKey: 'Id_BacSi' });
BacSi.hasMany(DanhGia, { foreignKey: 'Id_BacSi', as: 'reviews' });
DanhGia.belongsTo(BenhNhan, { foreignKey: 'Id_BenhNhan' });
BenhNhan.hasMany(DanhGia, { foreignKey: 'Id_BenhNhan' });
DanhGia.belongsTo(DatLich, { foreignKey: 'Id_DatLich' });
DatLich.hasOne(DanhGia, { foreignKey: 'Id_DatLich' });

// Chat associations
Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversation_id', as: 'participants' });
ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

ConversationParticipant.belongsTo(NguoiDung, { foreignKey: 'user_id', as: 'user' });
NguoiDung.hasMany(ConversationParticipant, { foreignKey: 'user_id' });

Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

Message.belongsTo(NguoiDung, { foreignKey: 'sender_id', as: 'sender' });
NguoiDung.hasMany(Message, { foreignKey: 'sender_id' });

Message.hasMany(MessageAttachment, { foreignKey: 'message_id', as: 'attachments' });
MessageAttachment.belongsTo(Message, { foreignKey: 'message_id', as: 'message' });

Conversation.hasMany(CallSession, { foreignKey: 'conversation_id', as: 'call_sessions' });
CallSession.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

CallSession.hasMany(CallParticipant, { foreignKey: 'call_session_id', as: 'participants' });
CallParticipant.belongsTo(CallSession, { foreignKey: 'call_session_id', as: 'call_session' });

CallParticipant.belongsTo(NguoiDung, { foreignKey: 'user_id', as: 'user' });
NguoiDung.hasMany(CallParticipant, { foreignKey: 'user_id' });

Conversation.belongsTo(DatLich, { foreignKey: 'appointment_id', as: 'Appointment' });
DatLich.hasMany(Conversation, { foreignKey: 'appointment_id', as: 'conversations' });

SupportCase.belongsTo(BenhNhan, { foreignKey: 'patient_id', as: 'patient' });
BenhNhan.hasMany(SupportCase, { foreignKey: 'patient_id' });

SupportCase.belongsTo(NguoiDung, { foreignKey: 'staff_id', as: 'staff' });
NguoiDung.hasMany(SupportCase, { foreignKey: 'staff_id' });

Conversation.belongsTo(SupportCase, { foreignKey: 'support_case_id', as: 'support_case' });
SupportCase.hasOne(Conversation, { foreignKey: 'support_case_id' });

SupportCase.belongsTo(PhongKham, { foreignKey: 'facility_id', as: 'facility' });
PhongKham.hasMany(SupportCase, { foreignKey: 'facility_id' });

Conversation.belongsTo(PhongKham, { foreignKey: 'facility_id', as: 'facility' });
PhongKham.hasMany(Conversation, { foreignKey: 'facility_id' });

CallSession.belongsTo(PhongKham, { foreignKey: 'facility_id', as: 'facility' });
PhongKham.hasMany(CallSession, { foreignKey: 'facility_id' });

AITuVanPhien.belongsTo(PhongKham, { foreignKey: 'Id_PhongKham', as: 'phongKham' });
PhongKham.hasMany(AITuVanPhien, { foreignKey: 'Id_PhongKham' });

AccessLog.belongsTo(NguoiDung, { foreignKey: 'Id_NguoiThucHien', as: 'executor' });
AccessLog.belongsTo(BenhNhan, { foreignKey: 'Id_BenhNhan', as: 'patient' });
NguoiDung.hasMany(AccessLog, { foreignKey: 'Id_NguoiThucHien' });
BenhNhan.hasMany(AccessLog, { foreignKey: 'Id_BenhNhan' });

// Admin associations
NguoiDung.hasOne(AdminProfile, { foreignKey: 'user_id', as: 'adminProfile' });
AdminProfile.belongsTo(NguoiDung, { foreignKey: 'user_id', as: 'user' });
AdminProfile.belongsTo(PhongKham, { foreignKey: 'facility_id', as: 'assignedFacility' });
PhongKham.hasMany(AdminProfile, { foreignKey: 'facility_id' });



module.exports = {
  sequelize,
  VaiTro,
  NguoiDung,
  NguoiDung_VaiTro,
  BenhNhan,
  ChuyenKhoa,
  BacSi,
  LichKham,
  DoctorSchedule: LichKham,
  DatLich,
  Appointment: DatLich,
  HoSoBenhAn,
  DonThuoc,
  ChiTietDonThuoc,
  HoaDon,
  ThanhToan,
  TinNhanKham,
  ThongBao,
  PhongKham,
  AITuVanPhien,
  AITuVanTinNhan,
  AuthToken,
  DanhGia,
  Conversation,
  ConversationParticipant,
  Message,
  MessageAttachment,
  CallSession,
  CallParticipant,
  SupportCase,
  BacSi_PhongKham,
  NguoiDung_PhongKham,
  StaffProfile,
  Staff_Facility,
  AccessLog,
  AdminProfile
};



