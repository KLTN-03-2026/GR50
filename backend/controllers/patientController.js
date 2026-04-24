const { NguoiDung, VaiTro } = require('../models');

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
    const upcomingCount = await DatLich.count({ 
      where: { 
        Id_BenhNhan: benhnhan.Id_BenhNhan, 
        TrangThai: ['ChoXacNhan', 'DaXacNhan', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'WAITING', 'IN_CONSULTATION'] 
      } 
    });
    const completedCount = await DatLich.count({ 
      where: { 
        Id_BenhNhan: benhnhan.Id_BenhNhan, 
        TrangThai: ['DaKham', 'COMPLETED'] 
      } 
    });


    // AI Session Stats
    let aiSessionsCount = 0;
    try {
      const aiSessions = await aiChatService.getSessions(req.user);
      aiSessionsCount = aiSessions ? aiSessions.length : 0;
    } catch (e) {
      console.log('Error fetching AI sessions for stats:', e);
    }

    res.json({
      upcomingAppointments: upcomingCount,
      completedAppointments: completedCount,
      aiSessions: aiSessionsCount
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ detail: 'Internal server error' });
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
