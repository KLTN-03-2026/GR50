const { BacSi, NguoiDung, ChuyenKhoa, VaiTro } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { specialty_id } = req.query;
    const whereClause = { TrangThai: 'HoatDong' };
    if (specialty_id) {
      whereClause.Id_ChuyenKhoa = specialty_id;
    }

    const doctors = await BacSi.findAll({
      where: whereClause,
      include: [
        { model: NguoiDung },
        { model: ChuyenKhoa }
      ]
    });

    const result = doctors.map(doc => {
      const d = doc.toJSON();
      return {
        id: d.Id_BacSi,
        user_id: d.Id_NguoiDung,
        experience_years: d.SoNamKinhNghiem,
        consultation_fee: d.PhiTuVan,
        fee: d.PhiTuVan,
        bio: d.GioiThieu,
        status: d.TrangThai === 'HoatDong' ? 'approved' : 'pending',
        full_name: `${d.NguoiDung.Ho} ${d.NguoiDung.Ten}`,
        email: d.NguoiDung.Email,
        avatar: d.NguoiDung.AnhDaiDien,
        specialty_name: d.ChuyenKhoa ? d.ChuyenKhoa.TenChuyenKhoa : null
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id; // NguoiDung ID
    let doctor = await BacSi.findOne({
      where: { Id_NguoiDung: userId },
      include: [
        { model: NguoiDung },
        { model: ChuyenKhoa }
      ]
    });

    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor profile not found' });
    }

    const d = doctor.toJSON();
    const result = {
      ...d,
      id: d.Id_BacSi,
      user_id: d.Id_NguoiDung,
      consultation_fee: d.PhiTuVan,
      experience_years: d.SoNamKinhNghiem,
      bio: d.GioiThieu,
      full_name: `${d.NguoiDung.Ho} ${d.NguoiDung.Ten}`,
      email: d.NguoiDung.Email,
      avatar: d.NguoiDung.AnhDaiDien,
      specialty_name: d.ChuyenKhoa ? d.ChuyenKhoa.TenChuyenKhoa : null,
      reviews: [],
      average_rating: 5.0,
      review_count: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.addReview = async (req, res) => { res.status(201).json({}); };
exports.updateReview = async (req, res) => { res.json({}); };
exports.getReviewByPatient = async (req, res) => { res.json(null); };

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { specialty_id, bio, experience_years, consultation_fee } = req.body;

    const doctor = await BacSi.findOne({ where: { Id_NguoiDung: userId } });
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor profile not found' });
    }

    if (specialty_id) doctor.Id_ChuyenKhoa = specialty_id;
    if (bio !== undefined) doctor.GioiThieu = bio;
    if (experience_years !== undefined) doctor.SoNamKinhNghiem = experience_years;
    if (consultation_fee !== undefined) doctor.PhiTuVan = consultation_fee;

    await doctor.save();
    res.json({ message: 'Profile updated successfully', doctor });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.updateSchedule = async (req, res) => { res.json({ message: 'Disabled feature in new schema' }); };

exports.getDepartmentHeads = async (req, res) => {
  try {
    const heads = await NguoiDung.findAll({
      include: [{ model: VaiTro, where: { MaVaiTro: 'department_head' } }]
    });
    res.json(heads.map(h => ({
      id: h.Id_NguoiDung,
      full_name: `${h.Ho} ${h.Ten}`,
      email: h.Email,
      phone: h.SoDienThoai
    })));
  } catch (error) {
    console.error('Get department heads error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
