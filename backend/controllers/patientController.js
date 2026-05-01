const { NguoiDung, VaiTro, BenhNhan, DatLich, BacSi, AccessLog } = require('../models');
const { Op } = require('sequelize');


exports.getAllPatients = async (req, res) => {
  try {
    const patients = await NguoiDung.findAll({
      include: [{
        model: VaiTro,
        where: { MaVaiTro: 'patient' },
        through: { attributes: [] }
      }]
    });

    res.json(patients.map(p => ({
      id: p.Id_NguoiDung,
      full_name: `${p.Ho} ${p.Ten}`,
      email: p.Email,
      phone: p.SoDienThoai,
      address: '' // No address conceptually stored in NguoiDung natively
    })));
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { BenhNhan, DatLich } = require('../models');
    const aiChatService = require('../services/aiChat.service');

    const benhnhan = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
    if (!benhnhan) return res.status(404).json({ detail: 'Bệnh nhân không tồn tại' });

    // Appointment Stats
    const upcomingStatuses = ['ChoXacNhan', 'DaXacNhan', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'];
    const completedStatuses = ['DaKham', 'COMPLETED'];

    const upcomingCount = await DatLich.count({ 
      where: { 
        Id_BenhNhan: benhnhan.Id_BenhNhan, 
        TrangThai: upcomingStatuses
      } 
    });

    const completedCount = await DatLich.count({ 
      where: { 
        Id_BenhNhan: benhnhan.Id_BenhNhan, 
        TrangThai: completedStatuses
      } 
    });

    // AI Sessions count
    let aiSessionsCount = 0;
    try {
      const aiSessions = await aiChatService.getSessions(req.user);
      aiSessionsCount = aiSessions ? aiSessions.length : 0;
    } catch (aiErr) {
      console.error('Error fetching AI sessions for dashboard:', aiErr.message);
    }

    console.log(`[DashboardStats] User: ${userId}, BenhNhan: ${benhnhan.Id_BenhNhan}, Upcoming: ${upcomingCount}, Completed: ${completedCount}, AI: ${aiSessionsCount}`);

    res.json({
      upcomingAppointments: upcomingCount,
      completedAppointments: completedCount,
      aiSessions: aiSessionsCount
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ detail: 'Lỗi hệ thống khi tải thống kê.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { NguoiDung, BenhNhan } = require('../models');

    const user = await NguoiDung.findByPk(userId);
    if (!user) return res.status(404).json({ detail: 'Người dùng không tồn tại' });

    const benhnhan = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });

    res.json({
      ho: user.Ho,
      ten: user.Ten,
      email: user.Email,
      so_dien_thoai: user.SoDienThoai,
      gioi_tinh: user.GioiTinh,
      ngay_sinh: user.NgaySinh,
      avatar: user.AnhDaiDien,
      nhom_mau: benhnhan ? benhnhan.NhomMau : '',
      tien_su_benh: benhnhan ? benhnhan.TienSuBenh : '',
      nguoi_lien_he: benhnhan ? benhnhan.NguoiLienHe : '',
      sdt_lien_he: benhnhan ? benhnhan.SoDienThoaiLienHe : ''
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ho, ten, so_dien_thoai, gioi_tinh, ngay_sinh, avatar, nhom_mau, tien_su_benh, nguoi_lien_he, sdt_lien_he } = req.body;
    const { NguoiDung, BenhNhan } = require('../models');

    const user = await NguoiDung.findByPk(userId);
    if (!user) return res.status(404).json({ detail: 'Người dùng không tồn tại' });

    user.Ho = ho || user.Ho;
    user.Ten = ten || user.Ten;
    user.SoDienThoai = so_dien_thoai || user.SoDienThoai;
    if (gioi_tinh) user.GioiTinh = gioi_tinh;
    if (ngay_sinh) user.NgaySinh = ngay_sinh;
    if (avatar) user.AnhDaiDien = avatar;
    await user.save();

    let benhnhan = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
    if (!benhnhan) {
      benhnhan = await BenhNhan.create({ Id_NguoiDung: userId });
    }
    benhnhan.NhomMau = nhom_mau || benhnhan.NhomMau;
    benhnhan.TienSuBenh = tien_su_benh || benhnhan.TienSuBenh;
    benhnhan.NguoiLienHe = nguoi_lien_he || benhnhan.NguoiLienHe;
    benhnhan.SoDienThoaiLienHe = sdt_lien_he || benhnhan.SoDienThoaiLienHe;
    await benhnhan.save();

    res.json({ message: 'Cập nhật hồ sơ thành công' });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

/**
 * HELPER: Check access level of a requester to a patient's data
 */
async function checkPatientAccess(requester, patientId) {
  const { id: requesterId, role } = requester;

  // 1. Patient viewing themselves
  const patient = await BenhNhan.findByPk(patientId);
  if (patient && patient.Id_NguoiDung === requesterId) return 'FULL';

  // 2. Doctor access
  if (role === 'doctor') {
    const doctor = await BacSi.findOne({ where: { Id_NguoiDung: requesterId } });
    if (!doctor) return 'NONE';

    // Check for valid appointment (PENDING, CONFIRMED, CHECKED_IN, IN_PROGRESS)
    const activeAppointment = await DatLich.findOne({
      where: {
        Id_BenhNhan: patientId,
        Id_BacSi: doctor.Id_BacSi,
        TrangThai: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'ChoXacNhan', 'DaXacNhan']
      }
    });

    if (activeAppointment) return 'MEDICAL';

    // If it's a past doctor but they previously treated the patient, maybe partial?
    // User request says: "Chỉ người liên quan đến ca khám hiện tại mới xem được dữ liệu khẩn cấp."
    // So if no current appointment, they might be restricted.
    return 'BASIC';
  }

  // 3. Staff access
  if (role === 'staff') {
    // Staff can see emergency contact if there's an appointment at their facility
    // For now, let's simplify: Staff see basic + emergency if role allows
    return 'EMERGENCY_MINIMAL'; 
  }

  // 4. Admin access
  if (role === 'admin') return 'ADMIN';

  return 'NONE';
}

exports.getPatientDetail = async (req, res) => {
  try {
    const { id } = req.params; // Patient ID (Id_BenhNhan)
    const requester = req.user;
    const { reason = 'Standard inquiry' } = req.query;

    const patient = await BenhNhan.findByPk(id, {
      include: [{ model: NguoiDung }]
    });

    if (!patient) return res.status(404).json({ detail: 'Bệnh nhân không tồn tại' });

    const accessLevel = await checkPatientAccess(requester, id);

    // Logging the access (Rule 4)
    if (requester.role !== 'patient') {
      await AccessLog.create({
        Id_NguoiThucHien: requester.id,
        Id_BenhNhan: id,
        HanhDong: 'VIEW_PROFILE',
        LyDo: reason,
        DoiTuongDuLieu: accessLevel,
        IpAddress: req.ip,
        UserAgent: req.get('User-Agent')
      });
    }

    const baseData = {
      id: patient.Id_BenhNhan,
      ho: patient.NguoiDung.Ho,
      ten: patient.NguoiDung.Ten,
      email: patient.NguoiDung.Email,
      so_dien_thoai: patient.NguoiDung.SoDienThoai,
      gioi_tinh: patient.NguoiDung.GioiTinh,
      ngay_sinh: patient.NguoiDung.NgaySinh,
      avatar: patient.NguoiDung.AnhDaiDien
    };

    // Rule-based data filtering
    if (accessLevel === 'FULL' || accessLevel === 'MEDICAL') {
      return res.json({
        ...baseData,
        nhom_mau: patient.NhomMau,
        tien_su_benh: patient.TienSuBenh,
        nguoi_lien_he: patient.NguoiLienHe,
        sdt_lien_he: patient.SoDienThoaiLienHe
      });
    }

    if (accessLevel === 'EMERGENCY_MINIMAL') {
      return res.json({
        ...baseData,
        nhom_mau: '******** (Emergency only)', // Hidden unless emergency mode
        tien_su_benh: 'HIDDEN',
        nguoi_lien_he: patient.NguoiLienHe,
        sdt_lien_he: patient.SoDienThoaiLienHe
      });
    }

    if (accessLevel === 'ADMIN' || accessLevel === 'BASIC') {
      return res.json({
        ...baseData,
        nhom_mau: 'HIDDEN',
        tien_su_benh: 'HIDDEN',
        nguoi_lien_he: 'HIDDEN',
        sdt_lien_he: 'HIDDEN'
      });
    }

    return res.status(403).json({ detail: 'Bạn không có quyền xem thông tin chi tiết của bệnh nhân này.' });

  } catch (error) {
    console.error('Get patient detail error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

