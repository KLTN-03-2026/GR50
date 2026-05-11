const { DatLich, BenhNhan, NguoiDung, BacSi, LichKham, ThanhToan, HoaDon, AuthToken, VaiTro, NguoiDung_VaiTro, PhongKham, ChuyenKhoa, AppointmentStatusHistory, BusinessHourConfig, HolidayCalendar, AppointmentPaymentPolicyAcceptance, RefundTransaction, DoctorFacilitySchedule, DoctorOnlineSchedule, AIConsultationSession, AIConsultationResult } = require('../models');
const { Op } = require('sequelize');

const recordStatusHistory = async (appointmentId, oldStatus, newStatus, actorId, actorRole, reason = '') => {
  try {
    await AppointmentStatusHistory.create({
      appointment_id: appointmentId,
      old_status: oldStatus,
      new_status: newStatus,
      actor_id: actorId,
      actor_role: actorRole,
      reason: reason
    });
  } catch (error) {
    console.error('Error recording status history:', error);
  }
};

const checkBusinessHours = async (facilityId, date, time) => {
  const dayOfWeek = new Date(date).getDay();
  const timeStr = time.substring(0, 5);
  
  // Check Holiday
  const isHoliday = await HolidayCalendar.findOne({ where: { facility_id: facilityId, date, is_closed: true } });
  if (isHoliday) return { valid: false, message: `Cơ sở đóng cửa vào ngày này (${isHoliday.name || 'Ngày nghỉ'})` };

  // Check Hours
  const config = await BusinessHourConfig.findOne({ 
    where: { facility_id: facilityId, day_of_week: dayOfWeek, is_active: true } 
  });
  
  if (!config) return { valid: false, message: 'Cơ sở không làm việc vào ngày này.' };
  
  const start = config.start_time.substring(0, 5);
  const end = config.end_time.substring(0, 5);

  if (timeStr < start || timeStr > end) {
    return { valid: false, message: `Giờ khám ngoài giờ hành chính (${start} - ${end})` };
  }

  if (config.break_start && config.break_end) {
    const bStart = config.break_start.substring(0, 5);
    const bEnd = config.break_end.substring(0, 5);
    if (timeStr >= bStart && timeStr < bEnd) {
      return { valid: false, message: 'Giờ khám trùng với giờ nghỉ trưa của cơ sở.' };
    }
  }

  return { valid: true };
};
const generateOtp = require('../utils/generateOtp');
const { sendOtpToEmail, sendOtpToPhone } = require('../utils/sendOtp');
const bcrypt = require('bcryptjs');

exports.create = async (req, res) => {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ detail: 'Patient access required' });

    const { 
        doctor_id, facility_id, appointment_date, appointment_time, 
        symptoms, appointment_type, aiSessionId 
    } = req.body;

    if (!facility_id) return res.status(400).json({ detail: 'Facility ID is required for multi-facility booking' });

    const bacsi = await BacSi.findOne({ where: { Id_BacSi: doctor_id } });
    if (!bacsi) return res.status(404).json({ detail: 'Doctor not found' });

    // Business Hour Check
    const bizCheck = await checkBusinessHours(facility_id, appointment_date, appointment_time);
    if (!bizCheck.valid) return res.status(400).json({ detail: bizCheck.message });

    const benhnhan = await BenhNhan.findOne({ where: { Id_NguoiDung: req.user.id } });
    if (!benhnhan) {
      const user = await NguoiDung.findByPk(req.user.id);
      benhnhan = await BenhNhan.create({
        Id_NguoiDung: req.user.id,
        SoDienThoaiLienHe: user.SoDienThoai
      });
    }

    // Rule 3.1: Check Facility Assignment
    const { BacSi_PhongKham } = require('../models');
    const assignment = await BacSi_PhongKham.findOne({
        where: { doctor_id: bacsi.Id_BacSi, facility_id: facility_id, is_active: true }
    });
    if (!assignment) return res.status(400).json({ detail: 'Bác sĩ chưa được phân công làm việc tại cơ sở này.' });

    // Mapping appointment_type
    const dbLoaiKham = appointment_type === 'online' ? 'Online' : 'TrucTiep';

    // Rule 3.2: Max 8 online bookings per doctor
    if (dbLoaiKham === 'Online') {
        const onlineCount = await DatLich.count({
            where: {
                Id_BacSi: bacsi.Id_BacSi,
                Id_PhongKham: facility_id,
                TrangThai: { [Op.notIn]: ['CANCELLED', 'EXPIRED'] }
            },
            include: [{
                model: LichKham,
                as: 'DoctorSchedule',
                where: { NgayDate: appointment_date, LoaiKham: 'Online' }
            }]
        });

        const maxOnline = assignment.online_quota || 8;
        if (onlineCount >= maxOnline) {
            return res.status(400).json({ 
                detail: `Bác sĩ đã đạt giới hạn tối đa ${maxOnline} đơn đặt lịch online trong ngày này. Vui lòng chọn ngày khác hoặc bác sĩ khác.` 
            });
        }
    }

    // Template Verification PB 2.0
    const dayOfWeek = new Date(appointment_date).getDay();
    let templateValid = false;
    if (dbLoaiKham === 'Online') {
        const template = await DoctorOnlineSchedule.findOne({
            where: { 
                doctorId: bacsi.Id_BacSi, 
                dayOfWeek, 
                startTime: { [Op.like]: `${appointment_time}%` },
                status: 'OPEN' 
            }
        });
        if (template) templateValid = true;
    } else {
        const template = await DoctorFacilitySchedule.findOne({
            where: { 
                doctorId: bacsi.Id_BacSi, 
                facilityId: facility_id, 
                dayOfWeek, 
                startTime: { [Op.like]: `${appointment_time}%` },
                status: 'ACTIVE' 
            }
        });
        if (template) templateValid = true;
    }

    if (!templateValid) {
        return res.status(400).json({ detail: 'Khung giờ này không có trong lịch làm việc đã được phân công/mở của bác sĩ.' });
    }

    // Existing slot logic
    let lichKham = await LichKham.findOne({
      where: {
        Id_BacSi: bacsi.Id_BacSi,
        Id_PhongKham: facility_id,
        NgayDate: appointment_date,
        GioBatDau: appointment_time,
        LoaiKham: dbLoaiKham
      }
    });

    if (lichKham) {
      if (lichKham.SoLuongDaDat >= lichKham.SoLuongToiDa) {
        return res.status(400).json({ detail: 'Khung giờ này đã đủ số lượng bệnh nhân tối đa.' });
      }
      lichKham.SoLuongDaDat += 1;
      if (lichKham.SoLuongDaDat >= lichKham.SoLuongToiDa) {
        lichKham.TrangThai = 'Dong';
      }
      await lichKham.save();
    } else {
      lichKham = await LichKham.create({
        Id_BacSi: bacsi.Id_BacSi,
        Id_PhongKham: facility_id,
        NgayDate: appointment_date,
        GioBatDau: appointment_time,
        GioKetThuc: appointment_time,
        LoaiKham: dbLoaiKham,
        TrangThai: 'Mo',
        SoLuongToiDa: bacsi.SoLuongKhachMacDinh || 10,
        SoLuongDaDat: 1
      });
    }

    const { getNextSequence } = require('../utils/sequenceHelper');
    const seq = await getNextSequence(facility_id, 'BOOKING');

    const appointment = await DatLich.create({
      Id_BenhNhan: benhnhan.Id_BenhNhan,
      Id_LichKham: lichKham.Id_LichKham,
      Id_PhongKham: facility_id,
      Id_BacSi: bacsi.Id_BacSi,
      TrangThai: 'PENDING_PAYMENT',
      TrieuChungSoBo: symptoms,
      GhiChu: '',
      GiaTien: (dbLoaiKham === 'Online' ? assignment.consultation_fee_online : assignment.consultation_fee_offline) || bacsi.PhiTuVan,
      ThoiDiemDat: new Date(),
      displayId: seq.displayId,
      MaDatLich: seq.internalId,
      enteredAt: new Date(),
      isVisible: true,
      aiSessionId: aiSessionId || null
    });

    // Calculate initial priority score
    const QueueService = require('../services/QueueService');
    await QueueService.calculatePriority(appointment.Id_DatLich);

    await recordStatusHistory(appointment.Id_DatLich, null, 'PENDING_PAYMENT', req.user.id, req.user.role, 'Đặt lịch mới (Chờ thanh toán)');

    // Create initial unpaid payment record immediately
    await ThanhToan.create({
      Id_DatLich: appointment.Id_DatLich,
      Id_BenhNhan: benhnhan.Id_BenhNhan,
      Id_PhongKham: facility_id,
      MaDonHang: `ORDER-${Date.now()}`,
      SoTien: bacsi.PhiTuVan,
      PhuongThuc: 'TienMat',
      TrangThai: 'PENDING',
      MoTa: `Thanh toán phí hẹn khám cho mã ${appointment.MaDatLich}`
    });

    // Note: We keep the old ThanhToan for legacy, but the new system uses PaymentRequest
    const { PaymentRequest } = require('../models');
    await PaymentRequest.create({
        appointmentId: appointment.Id_DatLich,
        patientId: benhnhan.Id_BenhNhan,
        facilityId: facility_id,
        amount: appointment.GiaTien,
        paymentMethod: 'BANK_QR', // Default to Bank QR
        status: 'PENDING'
    });

    res.json({
      id: appointment.Id_DatLich,
      status: 'pending'
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { facility_id } = req.query;

    let appointments = [];

    if (role === 'patient') {
      let bn = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
      if (!bn) {
          bn = await BenhNhan.create({ Id_NguoiDung: userId });
      }
      if (bn) {
        const whereClause = { Id_BenhNhan: bn.Id_BenhNhan, isVisible: true };
        if (facility_id) whereClause.Id_PhongKham = facility_id;
        
        appointments = await DatLich.findAll({
          where: whereClause,
          include: [
            { 
              model: LichKham, 
              as: 'DoctorSchedule',
              include: [
                { model: PhongKham, as: 'Clinic' },
                { model: BacSi, as: 'Doctor', include: [NguoiDung, ChuyenKhoa] }
              ] 
            },
            { model: BenhNhan, include: [NguoiDung] },
            { model: ThanhToan }
          ]
        });
      }
    } else if (role === 'doctor') {
      const bs = await BacSi.findOne({ where: { Id_NguoiDung: userId } });

      if (bs) {
        const whereClause = { isVisible: true };
        if (facility_id) whereClause.Id_PhongKham = facility_id;
        
        appointments = await DatLich.findAll({
          where: whereClause,
          include: [
            { 
              model: LichKham, 
              as: 'DoctorSchedule',
              where: { Id_BacSi: bs.Id_BacSi }, 
              include: [
                { model: PhongKham, as: 'Clinic' },
                { model: BacSi, as: 'Doctor', include: [NguoiDung, ChuyenKhoa] }
              ] 
            },
            { model: BenhNhan, include: [NguoiDung] },
            { model: ThanhToan },
            { 
              model: AIConsultationSession, 
              as: 'aiSession',
              include: [{ model: AIConsultationResult }]
            }
          ]
        });
      }
    } else {
      return res.status(403).json({ detail: 'Invalid role' });
    }

    const result = appointments.map(apt => {
      const d = apt.toJSON();
      const statusMap = {
        'ChoXacNhan': 'pending', 'DaXacNhan': 'confirmed', 'DaKham': 'completed', 'Huy': 'cancelled',
        'PENDING': 'pending', 'CONFIRMED': 'confirmed', 'CHECKED_IN': 'checked_in',
        'IN_PROGRESS': 'in_progress', 'COMPLETED': 'completed', 'CANCELLED': 'cancelled', 'NO_SHOW': 'no_show',
        'PENDING_PAYMENT': 'pending_payment'
      };
      let pStatus = 'unpaid';
      if (d.ThanhToan && (d.ThanhToan.TrangThai === 'PAID' || d.ThanhToan.TrangThai === 'ThanhCong')) {
        pStatus = 'paid';
      }

      return {
        id: d.Id_DatLich,
        code: d.MaDatLich,
        status: statusMap[d.TrangThai] || 'pending',
        payment_status: pStatus,
        doctor_name: (d.DoctorSchedule && d.DoctorSchedule.Doctor && d.DoctorSchedule.Doctor.NguoiDung) 
          ? `${d.DoctorSchedule.Doctor.NguoiDung.Ho} ${d.DoctorSchedule.Doctor.NguoiDung.Ten}` 
          : 'Bác sĩ',
        patient_name: (d.BenhNhan && d.BenhNhan.NguoiDung) 
          ? `${d.BenhNhan.NguoiDung.Ho} ${d.BenhNhan.NguoiDung.Ten}` 
          : 'Bệnh nhân',
        patient_id: d.Id_BenhNhan,
        appointment_date: d.DoctorSchedule ? d.DoctorSchedule.NgayDate : null,
        appointment_time: d.DoctorSchedule ? d.DoctorSchedule.GioBatDau : null,
        appointment_type: (d.DoctorSchedule && d.DoctorSchedule.LoaiKham === 'Online') ? 'online' : 'in-person',
        facility_name: (d.DoctorSchedule && d.DoctorSchedule.Clinic) ? d.DoctorSchedule.Clinic.TenPhongKham : 'Bệnh viện',
        specialty_name: (d.DoctorSchedule && d.DoctorSchedule.Doctor && d.DoctorSchedule.Doctor.ChuyenKhoa) ? d.DoctorSchedule.Doctor.ChuyenKhoa.TenChuyenKhoa : '',
        symptoms: d.TrieuChungSoBo,
        queue_number: d.STT_HangCho,
        ai_diagnosis: d.aiSession?.AIConsultationResult?.summary || ''
      };
    });


    res.json(result);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const dbStatusMap = {
      'pending': 'PENDING',
      'confirmed': 'CONFIRMED',
      'checked_in': 'CHECKED_IN',
      'in_progress': 'IN_PROGRESS',
      'completed': 'COMPLETED',
      'cancelled': 'CANCELLED',
      'no_show': 'NO_SHOW'
    };

    const newTrangThai = dbStatusMap[status.toLowerCase()] || status.toUpperCase();

    const appointment = await DatLich.findOne({
      where: { Id_DatLich: id },
      include: [{ model: LichKham, as: 'DoctorSchedule' }]
    });

    if (!appointment) return res.status(404).json({ detail: 'Not found' });

    if (req.user.role === 'doctor') {
      const bs = await BacSi.findOne({ where: { Id_NguoiDung: req.user.id } });
      if (!bs || (appointment.DoctorSchedule && appointment.DoctorSchedule.Id_BacSi !== bs.Id_BacSi)) {
        return res.status(403).json({ detail: 'Bạn không có quyền xử lý lịch hẹn này.' });
      }
    }

    const oldStatus = appointment.TrangThai;
    if (oldStatus === 'COMPLETED' || oldStatus === 'DaKham' || oldStatus === 'AUTO_DELETED_AFTER_BUSINESS_HOURS') {
      return res.status(400).json({ detail: 'Không thể thay đổi trạng thái của lịch đã hoàn tất hoặc đã đóng kỳ.' });
    }

    // State Machine Validation (Simplified version based on document)
    const validTransitions = {
      'PENDING': ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
      'CONFIRMED': ['CHECKED_IN', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'],
      'CHECKED_IN': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
      'DRAFT': ['PENDING', 'EXPIRED']
    };

    if (validTransitions[oldStatus] && !validTransitions[oldStatus].includes(newTrangThai)) {
        return res.status(400).json({ detail: `Không thể chuyển từ ${oldStatus} sang ${newTrangThai}` });
    }

    appointment.TrangThai = newTrangThai;
    if (newTrangThai === 'CHECKED_IN') {
        appointment.CheckedInAt = new Date();
        appointment.CheckedInBy = req.user.id;
    }
    await appointment.save();

    await recordStatusHistory(appointment.Id_DatLich, oldStatus, newTrangThai, req.user.id, req.user.role);

    res.json({ message: 'Updated', status: newTrangThai });
  } catch (error) {
    res.status(500).json({ detail: 'Error' });
  }
};

exports.completeExam = async (req, res) => {
  const sequelize = require('../config/database');
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { diagnosis, clinicalNote, services = [], prescription = null } = req.body;

    const { 
        FacilityService, ThanhToan, HoaDon, PaymentRequest, PatientArchiveRecord, HoSoBenhAn,
        ChiDinhCanLamSang, DonThuoc, ChiTietDonThuoc, HoaDonChiTiet, BangGiaDichVu, ThuocDanhMuc, DatLich, LichKham
    } = require('../models');
    const archiveCtrl = require('./patientArchiveController');

    const appointment = await DatLich.findOne({
      where: { Id_DatLich: id },
      include: [{ model: LichKham, as: 'DoctorSchedule' }],
      transaction
    });

    if (!appointment) {
        await transaction.rollback();
        return res.status(404).json({ detail: 'Không tìm thấy lịch hẹn' });
    }

    // 1. Create or update HoSoBenhAn
    let medicalRecord = await HoSoBenhAn.findOne({ where: { Id_DatLich: id }, transaction });
    if (!medicalRecord) {
        medicalRecord = await HoSoBenhAn.create({
            Id_DatLich: id,
            Id_BenhNhan: appointment.Id_BenhNhan,
            Id_BacSi: appointment.Id_BacSi,
            Id_PhongKham: appointment.Id_PhongKham,
            ChanDoan: diagnosis,
            GhiChu: clinicalNote
        }, { transaction });
    } else {
        medicalRecord.ChanDoan = diagnosis;
        medicalRecord.GhiChu = clinicalNote;
        await medicalRecord.save({ transaction });
    }

    // 2. Process clinical services
    let clinicalTotal = 0;
    const clinicalDetails = [];
    if (services.length > 0) {
        for (const s of services) {
            const servicePrice = await BangGiaDichVu.findByPk(s.serviceId, { transaction });
            if (servicePrice) {
                await ChiDinhCanLamSang.create({
                    Id_DatLich: id,
                    Id_HoSoBenhAn: medicalRecord.Id_HoSo,
                    Id_BacSi: appointment.Id_BacSi,
                    Id_DichVu: s.serviceId,
                    GhiChu: s.note,
                    TrangThai: 'ORDERED'
                }, { transaction });

                clinicalTotal += Number(servicePrice.DonGia);
                clinicalDetails.push({
                    LoaiDong: 'CAN_LAM_SANG',
                    Id_ThamChieu: s.serviceId,
                    TenMuc: servicePrice.TenDichVu,
                    DonGia: servicePrice.DonGia,
                    SoLuong: 1,
                    ThanhTien: servicePrice.DonGia
                });
            }
        }
    }

    // 3. Process prescription
    let medicineTotal = 0;
    const medicineDetails = [];
    if (prescription && prescription.items && prescription.items.length > 0) {
        const dt = await DonThuoc.create({
            Id_DatLich: id,
            Id_HoSoBenhAn: medicalRecord.Id_HoSo,
            Id_BenhNhan: appointment.Id_BenhNhan,
            Id_BacSi: appointment.Id_BacSi,
            ChanDoan: diagnosis,
            LoiDan: prescription.note,
            TrangThai: 'SIGNED',
            NgayKy: new Date()
        }, { transaction });

        for (const item of prescription.items) {
            const medPrice = await ThuocDanhMuc.findByPk(item.medicineId, { transaction });
            if (medPrice) {
                await ChiTietDonThuoc.create({
                    Id_DonThuoc: dt.Id_DonThuoc,
                    Id_Thuoc: item.medicineId,
                    SoLuong: item.quantity,
                    LieuDung: item.dosage,
                    SoNgay: item.days,
                    CachDung: item.usage
                }, { transaction });

                const lineTotal = Number(item.quantity) * Number(medPrice.DonGia);
                medicineTotal += lineTotal;
                medicineDetails.push({
                    LoaiDong: 'THUOC',
                    Id_ThamChieu: item.medicineId,
                    TenMuc: medPrice.TenThuoc,
                    DonGia: medPrice.DonGia,
                    SoLuong: item.quantity,
                    ThanhTien: lineTotal
                });
            }
        }
    }

    // 4. Calculate total
    const examTotal = Number(appointment.GiaTien);
    const totalDue = examTotal + clinicalTotal; 

    // 5. Create Invoice
    const invoice = await HoaDon.create({
        MaHoaDon: `INV-${Date.now()}`,
        Id_DatLich: id,
        Id_PhongKham: appointment.Id_PhongKham,
        patientId: appointment.Id_BenhNhan,
        Id_BacSi: appointment.Id_BacSi,
        TongTienKham: examTotal,
        TongTienCanLamSang: clinicalTotal,
        TongTienThuoc: 0, // 0 until confirmed
        GiamGia: 0,
        TongTien: totalDue,
        TrangThai: 'WAITING_PATIENT_CONFIRM',
        BenhNhanLayThuoc: 0
    }, { transaction });

    // Create Invoice Details
    const initialDetails = [
        {
            Id_HoaDon: invoice.Id_HoaDon,
            LoaiDong: 'PHI_KHAM',
            Id_ThamChieu: null,
            TenMuc: 'Phí khám bệnh',
            DonGia: examTotal,
            SoLuong: 1,
            ThanhTien: examTotal
        },
        ...clinicalDetails.map(d => ({ ...d, Id_HoaDon: invoice.Id_HoaDon }))
    ];
    await HoaDonChiTiet.bulkCreate(initialDetails, { transaction });

    // 6. Update Appointment Status
    const oldStatus = appointment.TrangThai;
    appointment.TrangThai = 'COMPLETED';
    appointment.isFullyPaid = false;
    appointment.completed_time = new Date();
    await appointment.save({ transaction });

    // Create PaymentRequest for exam+clinical
    await PaymentRequest.create({
        appointmentId: id,
        patientId: appointment.Id_BenhNhan,
        facilityId: appointment.Id_PhongKham,
        amount: totalDue,
        paymentMethod: 'COUNTER',
        description: `Thanh toán phí khám và cận lâm sàng cho lịch hẹn ${appointment.displayId}`,
        status: 'PENDING'
    }, { transaction });

    await transaction.commit();

    try {
        await recordStatusHistory(appointment.Id_DatLich, oldStatus, 'COMPLETED', req.user.id, req.user.role, 'Bác sĩ hoàn tất khám. Đã tạo hóa đơn và đơn thuốc.');
    } catch(e) {}

    // Optionally archive to patient folder here (similar to old logic)
    try {
        await archiveCtrl.updateIndexOnCompletion(appointment.Id_BenhNhan, appointment.Id_PhongKham);
    } catch (archiveErr) {}

    res.json({ message: 'Hoàn tất khám. Đã tạo hóa đơn tạm tính.', status: 'COMPLETED' });

  } catch (error) {
    await transaction.rollback();
    console.error('completeExam error:', error);
    res.status(500).json({ detail: 'Lỗi khi xử lý hoàn thành khám' });
  }
};


exports.updateDiagnosis = async (req, res) => {
  res.json({ message: 'Legacy feature disabled. Modifying AI diagnosis string no longer used.' });
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const benhnhan = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
    if (!benhnhan) return res.status(404).json({ detail: 'Bệnh nhân không tồn tại' });

    const appointment = await DatLich.findOne({
      where: { Id_DatLich: id, Id_BenhNhan: benhnhan.Id_BenhNhan }
    });

    if (!appointment) return res.status(404).json({ detail: 'Không tìm thấy lịch hẹn' });

    if (appointment.TrangThai !== 'PENDING' && appointment.TrangThai !== 'CONFIRMED' &&
      appointment.TrangThai !== 'ChoXacNhan' && appointment.TrangThai !== 'DaXacNhan') {
      return res.status(400).json({ detail: 'Không thể hủy lịch ở trạng thái hiện tại' });
    }

    const oldStatus = appointment.TrangThai;
    const now = new Date();
    const appointmentDate = new Date(`${appointment.DoctorSchedule?.NgayDate}T${appointment.DoctorSchedule?.GioBatDau}`);
    const diffHours = (appointmentDate - now) / (1000 * 60 * 60);

    let refundPercent = 100;
    let penaltyPercent = 0;

    if (diffHours < 6) {
        refundPercent = 80;
        penaltyPercent = 20;
    } else if (diffHours < 24) {
        refundPercent = 90;
        penaltyPercent = 10;
    }

    appointment.TrangThai = 'CANCELLED_BY_PATIENT';
    appointment.LyDoHuy = reason || 'Bệnh nhân tự hủy';
    await appointment.save();

    await recordStatusHistory(appointment.Id_DatLich, oldStatus, 'CANCELLED_BY_PATIENT', req.user.id, req.user.role, appointment.LyDoHuy);

    // Process Refund Record if PAID
    const payment = await ThanhToan.findOne({ where: { Id_DatLich: appointment.Id_DatLich, TrangThai: ['PAID', 'ThanhCong'] } });
    if (payment) {
        const totalAmount = Number(payment.SoTien);
        const refundAmount = (totalAmount * refundPercent) / 100;
        const penaltyAmount = totalAmount - refundAmount;

        await RefundTransaction.create({
            appointment_id: appointment.Id_DatLich,
            payment_id: payment.Id_ThanhToan,
            refund_percent: refundPercent,
            penalty_percent: penaltyPercent,
            refund_amount: refundAmount,
            penalty_amount: penaltyAmount,
            reason: `Hủy trước ${Math.floor(diffHours)} giờ. ${reason || ''}`,
            status: 'PENDING'
        });
        
        appointment.TrangThai = 'REFUNDED_PARTIAL';
        if (refundPercent === 100) appointment.TrangThai = 'REFUNDED_FULL';
        await appointment.save();
    }

    const lichKham = await LichKham.findOne({ where: { Id_LichKham: appointment.Id_LichKham } });
    if (lichKham && lichKham.SoLuongDaDat > 0) {
      lichKham.SoLuongDaDat -= 1;
      if (lichKham.TrangThai === 'Dong') {
        lichKham.TrangThai = 'Mo';
      }
      await lichKham.save();
    }

    res.json({ 
        message: 'Đã hủy lịch thành công', 
        refund_estimate: refundPercent < 100 ? `Dự kiến hoàn ${refundPercent}% số tiền đã đóng.` : 'Dự kiến hoàn 100%.' 
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.acceptPaymentPolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await DatLich.findByPk(id);
        if (!appointment) return res.status(404).json({ detail: 'Không tìm thấy lịch hẹn' });

        const benhnhan = await BenhNhan.findOne({ where: { Id_NguoiDung: req.user.id } });
        if (!benhnhan || appointment.Id_BenhNhan !== benhnhan.Id_BenhNhan) {
            return res.status(403).json({ detail: 'Bạn không có quyền thực hiện thao tác này' });
        }

        await AppointmentPaymentPolicyAcceptance.create({
            appointment_id: id,
            patient_id: benhnhan.Id_BenhNhan,
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            content_snapshot: 'Chính sách hoàn tiền 80% nếu No-Show. Hủy dưới 6h trừ 20%. Grace period 20-25p.'
        });

        res.json({ message: 'Đã chấp nhận chính sách thanh toán' });
    } catch (error) {
        res.status(500).json({ detail: 'Lỗi khi ghi nhận chấp nhận chính sách' });
    }
};

exports.markNoShow = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await DatLich.findByPk(id, { include: [ThanhToan] });
        if (!appointment) return res.status(404).json({ detail: 'Không tìm thấy lịch hẹn' });

        const oldStatus = appointment.TrangThai;
        appointment.TrangThai = 'NO_SHOW';
        await appointment.save();

        await recordStatusHistory(appointment.Id_DatLich, oldStatus, 'NO_SHOW', req.user.id, req.user.role, 'Bệnh nhân không đến khám');

        // Penalty 20%
        const payment = await ThanhToan.findOne({ where: { Id_DatLich: id, TrangThai: ['PAID', 'ThanhCong'] } });
        if (payment) {
            const totalAmount = Number(payment.SoTien);
            const refundAmount = totalAmount * 0.8;
            const penaltyAmount = totalAmount * 0.2;

            await RefundTransaction.create({
                appointment_id: id,
                payment_id: payment.Id_ThanhToan,
                refund_percent: 80,
                penalty_percent: 20,
                refund_amount: refundAmount,
                penalty_amount: penaltyAmount,
                reason: 'Bệnh nhân không đến khám (No-Show). Khấu trừ 20% phí.',
                status: 'PENDING'
            });
            
            appointment.TrangThai = 'REFUNDED_PARTIAL';
            await appointment.save();
        }

        res.json({ message: 'Đã đánh dấu No-Show và xử lý hoàn tiền 80%' });
    } catch (error) {
        res.status(500).json({ detail: 'Lỗi khi đánh dấu No-Show' });
    }
};

exports.getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, facilityId, date, appointment_type } = req.query;
        if (!doctorId || !date) return res.status(400).json({ detail: 'Missing doctorId or date' });

        const dayOfWeek = new Date(date).getDay();

        if (appointment_type === 'online') {
            const slots = await DoctorOnlineSchedule.findAll({
                where: { doctorId, dayOfWeek, status: 'OPEN' },
                order: [['startTime', 'ASC']]
            });
            return res.json(slots.map(s => ({
                id: s.id,
                type: 'online',
                time: s.startTime.substring(0, 5)
            })));
        } else {
            const whereClause = { doctorId, dayOfWeek, status: 'ACTIVE' };
            if (facilityId) whereClause.facilityId = facilityId;

            const slots = await DoctorFacilitySchedule.findAll({
                where: whereClause,
                include: [{ model: PhongKham, as: 'facility' }],
                order: [['startTime', 'ASC']]
            });

            return res.json(slots.map(s => ({
                id: s.id,
                type: 'offline',
                facility_id: s.facilityId,
                facility_name: s.facility?.TenPhongKham,
                time: s.startTime.substring(0, 5),
                room: s.roomId
            })));
        }
    } catch (error) {
        console.error('GetAvailableSlots Error:', error);
        res.status(500).json({ detail: 'Error fetching slots' });
    }
};

exports.createGuestAppointment = async (req, res) => {
  try {
    const { 
      full_name, phone, email, date_of_birth, gender,
      doctor_id, facility_id, appointment_date, appointment_time, symptoms, appointment_type 
    } = req.body;

    if (!full_name || !phone || !appointment_date || !appointment_time) {
      return res.status(400).json({ detail: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' });
    }

    if (date_of_birth) {
      const year = new Date(date_of_birth).getFullYear();
      if (year > 2100 || year < 1900) {
        return res.status(400).json({ detail: 'Ngày sinh không hợp lệ.' });
      }
    }

    const { Op } = require('sequelize');
    let user = await NguoiDung.findOne({ where: { [Op.or]: [{ Email: email || '' }, { SoDienThoai: phone }] } });
    
    if (!user) {
      const names = full_name.split(' ');
      const ten = names.pop();
      const ho = names.join(' ');
      
      user = await NguoiDung.create({
        Ho: ho,
        Ten: ten,
        Email: email || `guest_${Date.now()}@medischedule.com`,
        SoDienThoai: phone,
        NgaySinh: date_of_birth,
        GioiTinh: gender,
        TrangThai: 'HoatDong',
        MatKhau: await bcrypt.hash(Math.random().toString(36), 10) 
      });

      const vt = await VaiTro.findOne({ where: { MaVaiTro: 'patient' } });
      if (vt) {
        await NguoiDung_VaiTro.create({ Id_NguoiDung: user.Id_NguoiDung, Id_VaiTro: vt.Id_VaiTro });
      }

      await BenhNhan.create({
        Id_NguoiDung: user.Id_NguoiDung,
        SoDienThoaiLienHe: phone
      });
    }

    let benhnhan = await BenhNhan.findOne({ where: { Id_NguoiDung: user.Id_NguoiDung } });
    if (!benhnhan) {
      benhnhan = await BenhNhan.create({
        Id_NguoiDung: user.Id_NguoiDung,
        SoDienThoaiLienHe: phone
      });
    }
    const bacsi = await BacSi.findOne({ where: { Id_BacSi: doctor_id } });
    if (!bacsi) return res.status(404).json({ detail: 'Không tìm thấy thông tin bác sĩ.' });

    // Business Hour Check
    const bizCheck = await checkBusinessHours(facility_id, appointment_date, appointment_time);
    if (!bizCheck.valid) return res.status(400).json({ detail: bizCheck.message });

    const dbLoaiKham = appointment_type === 'online' ? 'Online' : 'TrucTiep';
    
    const dayOfWeek = new Date(appointment_date).getDay();
    let templateValid = false;
    
    if (dbLoaiKham === 'Online') {
        const template = await DoctorOnlineSchedule.findOne({
            where: { 
                doctorId: bacsi.Id_BacSi, 
                dayOfWeek, 
                startTime: { [Op.like]: `${appointment_time}%` },
                status: 'OPEN' 
            }
        });
        if (template) templateValid = true;
    } else {
        const template = await DoctorFacilitySchedule.findOne({
            where: { 
                doctorId: bacsi.Id_BacSi, 
                facilityId: facility_id, 
                dayOfWeek, 
                startTime: { [Op.like]: `${appointment_time}%` },
                status: 'ACTIVE' 
            }
        });
        if (template) templateValid = true;
    }

    if (!templateValid) {
        return res.status(400).json({ detail: 'Khung giờ này không có trong lịch làm việc đã được phân công/mở của bác sĩ.' });
    }

    let lichKham = await LichKham.findOne({
      where: {
        Id_BacSi: bacsi.Id_BacSi,
        Id_PhongKham: facility_id,
        NgayDate: appointment_date,
        GioBatDau: appointment_time,
        LoaiKham: dbLoaiKham
      }
    });

    if (lichKham) {
      if (lichKham.SoLuongDaDat >= lichKham.SoLuongToiDa) {
        return res.status(400).json({ detail: 'Khung giờ này đã đầy.' });
      }
      lichKham.SoLuongDaDat += 1;
      if (lichKham.SoLuongDaDat >= lichKham.SoLuongToiDa) {
        lichKham.TrangThai = 'Dong';
      }
      await lichKham.save();
    } else {
      lichKham = await LichKham.create({
        Id_BacSi: bacsi.Id_BacSi,
        Id_PhongKham: facility_id,
        NgayDate: appointment_date,
        GioBatDau: appointment_time,
        GioKetThuc: appointment_time,
        LoaiKham: dbLoaiKham,
        TrangThai: 'Mo',
        SoLuongToiDa: 10,
        SoLuongDaDat: 1
      });
    }

    const { getNextSequence } = require('../utils/sequenceHelper');
    const seq = await getNextSequence(facility_id, 'BOOKING');

    const appointment = await DatLich.create({
      Id_BenhNhan: benhnhan.Id_BenhNhan,
      Id_LichKham: lichKham.Id_LichKham,
      Id_PhongKham: facility_id,
      Id_BacSi: bacsi.Id_BacSi,
      TrangThai: 'PENDING_PAYMENT',
      displayId: seq.displayId,
      MaDatLich: seq.internalId,
      TrieuChungSoBo: symptoms,
      GiaTien: bacsi.PhiTuVan,
      ThoiDiemDat: new Date(),
      BookingSource: 'GUEST',
      IdentityStatus: 'VERIFIED_GUEST',
      enteredAt: new Date()
    });

    await ThanhToan.create({
      Id_DatLich: appointment.Id_DatLich,
      Id_BenhNhan: benhnhan.Id_BenhNhan,
      Id_PhongKham: facility_id,
      MaDonHang: `GUEST-ORDER-${Date.now()}`,
      SoTien: bacsi.PhiTuVan,
      PhuongThuc: 'TienMat',
      TrangThai: 'PENDING',
      MoTa: `Thanh toán phí hẹn khám (Khách) cho mã ${appointment.MaDatLich}`
    });

    appointment.IdentityStatus = 'VERIFIED_GUEST';
    await appointment.save();

    res.status(201).json({
      message: 'Đặt lịch thành công!',
      appointment_id: appointment.Id_DatLich,
      appointment: {
        id: appointment.Id_DatLich,
        code: appointment.MaDatLich,
        status: appointment.TrangThai
      }
    });

  } catch (error) {
    console.error('------------------------------------');
    res.status(500).json({ detail: 'Lỗi hệ thống khi đặt lịch nhanh.', error: error.message });
  }
};

exports.verifyGuestBooking = async (req, res) => {
  try {
    const { appointment_id, otp } = req.body;

    const appointment = await DatLich.findByPk(appointment_id, {
      include: [{ model: BenhNhan, include: [NguoiDung] }]
    });

    if (!appointment) return res.status(404).json({ detail: 'Không tìm thấy lịch hẹn.' });

    const tokenRecord = await AuthToken.findOne({
      where: { 
        Id_NguoiDung: appointment.BenhNhan.Id_NguoiDung,
        Token: String(otp),
        Type: 'GUEST_BOOKING_OTP',
        IsUsed: false
      }
    });

    if (!tokenRecord || new Date(tokenRecord.ExpiresAt) < new Date()) {
      return res.status(400).json({ detail: 'Mã xác thực không đúng hoặc đã hết hạn.' });
    }

    // Mark as verified
    appointment.IdentityStatus = 'VERIFIED_GUEST';
    await appointment.save();

    tokenRecord.IsUsed = true;
    await tokenRecord.save();

    res.json({
      message: 'Xác thực thành công. Lịch hẹn của bạn đã chính thức được ghi nhận.',
      appointment: {
        id: appointment.Id_DatLich,
        code: appointment.MaDatLich,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Verify guest booking error:', error);
    res.status(500).json({ detail: 'Lỗi xác thực.' });
  }
};

exports.hideAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const bs = await BacSi.findOne({ where: { Id_NguoiDung: userId } });
    if (!bs) return res.status(403).json({ detail: 'Chỉ bác sĩ mới có quyền xóa lịch sử hiển thị' });

    const appointment = await DatLich.findOne({
      where: { Id_DatLich: id, Id_BacSi: bs.Id_BacSi }
    });

    if (!appointment) {
      return res.status(404).json({ detail: 'Không tìm thấy lịch hẹn' });
    }

    if (appointment.TrangThai !== 'COMPLETED' && appointment.TrangThai !== 'CANCELLED' && appointment.TrangThai !== 'NO_SHOW') {
      return res.status(400).json({ detail: 'Chỉ có thể xóa hiển thị đối với những lịch đã hoàn tất hoặc đã hủy.' });
    }

    appointment.isVisible = false;
    await appointment.save();

    res.json({ success: true, message: 'Đã xóa lịch khỏi danh sách hiển thị' });
  } catch (error) {
    console.error('hideAppointment error:', error);
    res.status(500).json({ detail: 'Lỗi hệ thống' });
  }
};
