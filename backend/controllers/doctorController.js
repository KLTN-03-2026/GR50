const { BacSi, NguoiDung, ChuyenKhoa, VaiTro, PhongKham, DanhGia, DatLich, BenhNhan, AITuVanPhien, LichKham } = require('../models');


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
        { model: ChuyenKhoa },
        { model: PhongKham, as: 'facilities' }
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
        specialty_id: d.Id_ChuyenKhoa,
        specialty_name: d.ChuyenKhoa ? d.ChuyenKhoa.TenChuyenKhoa : null,
        facilities: d.facilities ? d.facilities.map(pk => ({
            id: pk.Id_PhongKham,
            name: pk.TenPhongKham,
            address: pk.DiaChi,
            is_primary: pk.BacSi_PhongKham ? pk.BacSi_PhongKham.is_primary : false,
            consultation_fee: pk.BacSi_PhongKham ? pk.BacSi_PhongKham.consultation_fee_offline : d.PhiTuVan
        })) : []
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
    const doctorId = req.params.id;
    const userId = req.user ? req.user.id : null;
    let doctor = await BacSi.findOne({
      where: { Id_BacSi: doctorId },
      include: [
        { model: NguoiDung },
        { model: ChuyenKhoa },
        { model: PhongKham, as: 'facilities' },
        { model: DanhGia, as: 'reviews', include: [{ model: BenhNhan, include: [NguoiDung] }] }
      ]
    });


    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor profile not found' });
    }

    const d = doctor.toJSON();
    const reviews = d.reviews || [];
    const average_rating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.SoSao, 0) / reviews.length
      : 5.0;

    let canReview = false;
    if (userId) {
      const patient = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
      if (patient) {
        const appointment = await DatLich.findOne({
          where: { 
            Id_BenhNhan: patient.Id_BenhNhan, 
            TrangThai: { [Op.in]: ['COMPLETED', 'DaKham'] } 
          },
          include: [{ model: LichKham, as: 'DoctorSchedule', where: { Id_BacSi: doctorId } }],
          order: [['NgayTao', 'DESC']]
        });
        
        if (appointment) {
          const existingReview = await DanhGia.findOne({ where: { Id_DatLich: appointment.Id_DatLich } });
          if (!existingReview) canReview = true;
        }
      }
    }


    const result = {
      ...d,
      id: d.Id_BacSi,
      user_id: d.Id_NguoiDung,
      consultation_fee: d.PhiTuVan,
      experience_years: d.SoNamKinhNghiem,
      bio: d.GioiThieu,
      full_name: `${d.NguoiDung.Ho} ${d.NguoiDung.Ten}`,
      email: d.NguoiDung.Email,
      phone: d.NguoiDung.SoDienThoai,
      avatar: d.NguoiDung.AnhDaiDien,
      specialty_id: d.Id_ChuyenKhoa,
      specialty_name: d.ChuyenKhoa ? d.ChuyenKhoa.TenChuyenKhoa : null,
      degree: d.HocHamHocVi,
      training: d.NoiDaoTao,
      workplace: d.NoiLamViec,
      languages: d.NgonNgu,
      services: d.DichVuCungCap,
      certificate_number: d.SoChungChiHanhNghe,
      approval_status: d.TrangThaiHoSo,
      certificates: d.AnhBangCap ? (typeof d.AnhBangCap === 'string' ? JSON.parse(d.AnhBangCap) : d.AnhBangCap) : [],
      facilities: d.facilities ? d.facilities.map(pk => ({
          id: pk.Id_PhongKham,
          name: pk.TenPhongKham,
          address: pk.DiaChi,
          is_primary: pk.BacSi_PhongKham ? pk.BacSi_PhongKham.is_primary : false,
          supports_online: pk.BacSi_PhongKham ? pk.BacSi_PhongKham.supports_online : true,
          supports_offline: pk.BacSi_PhongKham ? pk.BacSi_PhongKham.supports_offline : true,
          fee_online: pk.BacSi_PhongKham ? pk.BacSi_PhongKham.consultation_fee_online : d.PhiTuVan,
          fee_offline: pk.BacSi_PhongKham ? pk.BacSi_PhongKham.consultation_fee_offline : d.PhiTuVan
      })) : [],
      reviews: reviews.map(r => ({
        id: r.Id_DanhGia,
        rating: r.SoSao,
        comment: r.BinhLuan,
        createdAt: r.NgayTao,
        Patient: {
          full_name: r.BenhNhan ? `${r.BenhNhan.NguoiDung.Ho} ${r.BenhNhan.NguoiDung.Ten}` : 'Bệnh nhân',
          avatar: r.BenhNhan ? r.BenhNhan.NguoiDung.AnhDaiDien : null
        }
      })),
      average_rating: parseFloat(average_rating.toFixed(1)),
      review_count: reviews.length,
      can_review: canReview,
      available_slots: d.LichLamViec || '[]'
    };



    res.json(result);
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id; // NguoiDung ID
    let doctor = await BacSi.findOne({
      where: { Id_NguoiDung: userId },
      include: [
        { model: NguoiDung },
        { model: ChuyenKhoa },
        { model: PhongKham, as: 'facilities' },
        { model: DanhGia, as: 'reviews', include: [{ model: BenhNhan, include: [NguoiDung] }] }
      ]
    });


    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor profile not found' });
    }

    const d = doctor.toJSON();
    const reviews = d.reviews || [];
    const average_rating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.SoSao, 0) / reviews.length
      : 5.0;

    const result = {
      ...d,
      id: d.Id_BacSi,
      user_id: d.Id_NguoiDung,
      consultation_fee: d.PhiTuVan,
      experience_years: d.SoNamKinhNghiem,
      bio: d.GioiThieu,
      full_name: `${d.NguoiDung.Ho} ${d.NguoiDung.Ten}`,
      email: d.NguoiDung.Email,
      phone: d.NguoiDung.SoDienThoai,
      avatar: d.NguoiDung.AnhDaiDien,
      specialty_id: d.Id_ChuyenKhoa,
      specialty_name: d.ChuyenKhoa ? d.ChuyenKhoa.TenChuyenKhoa : null,
      degree: d.HocHamHocVi,
      training: d.NoiDaoTao,
      workplace: d.NoiLamViec,
      languages: d.NgonNgu,
      services: d.DichVuCungCap,
      certificate_number: d.SoChungChiHanhNghe,
      approval_status: d.TrangThaiHoSo,
      certificates: d.AnhBangCap ? (typeof d.AnhBangCap === 'string' ? JSON.parse(d.AnhBangCap) : d.AnhBangCap) : [],
      facilities: d.facilities ? d.facilities.map(pk => ({
          id: pk.Id_PhongKham,
          name: pk.TenPhongKham,
          address: pk.DiaChi,
          is_primary: pk.BacSi_PhongKham ? pk.BacSi_PhongKham.is_primary : false,
          supports_online: pk.BacSi_PhongKham ? pk.BacSi_PhongKham.supports_online : true,
          supports_offline: pk.BacSi_PhongKham ? pk.BacSi_PhongKham.supports_offline : true,
          fee_online: pk.BacSi_PhongKham ? pk.BacSi_PhongKham.consultation_fee_online : d.PhiTuVan,
          fee_offline: pk.BacSi_PhongKham ? pk.BacSi_PhongKham.consultation_fee_offline : d.PhiTuVan
      })) : [],
      reviews: reviews.map(r => ({
        id: r.Id_DanhGia,
        rating: r.SoSao,
        comment: r.BinhLuan,
        createdAt: r.NgayTao,
        Patient: {
          full_name: r.BenhNhan ? `${r.BenhNhan.NguoiDung.Ho} ${r.BenhNhan.NguoiDung.Ten}` : 'Bệnh nhân',
          avatar: r.BenhNhan ? r.BenhNhan.NguoiDung.AnhDaiDien : null
        }
      })),
      average_rating: parseFloat(average_rating.toFixed(1)),
      review_count: reviews.length,
      available_slots: d.LichLamViec || '[]'
    };


    res.json(result);
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.addReview = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const patient = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
    if (!patient) return res.status(403).json({ detail: 'Only patients can leave reviews' });

    // Check if patient has a COMPLETED appointment with this doctor
    const appointment = await DatLich.findOne({
      where: {
        Id_BenhNhan: patient.Id_BenhNhan,
        TrangThai: 'COMPLETED'
      },
      include: [{
        model: LichKham,
        as: 'DoctorSchedule',
        where: { Id_BacSi: doctorId }
      }]
    });

    if (!appointment) {
      return res.status(403).json({ detail: 'Bạn phải hoàn thành khám với bác sĩ này trước khi đánh giá.' });
    }

    // Check if review already exists for this appointment
    const existingReview = await DanhGia.findOne({
      where: { Id_DatLich: appointment.Id_DatLich }
    });

    if (existingReview) {
      return res.status(400).json({ detail: 'Bạn đã đánh giá cho buổi khám này rồi.' });
    }

    const review = await DanhGia.create({
      Id_BacSi: doctorId,
      Id_BenhNhan: patient.Id_BenhNhan,
      Id_DatLich: appointment.Id_DatLich,
      SoSao: rating,
      BinhLuan: comment
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params; // doctorId actually, but we need review context
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const patient = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
    const review = await DanhGia.findOne({
      where: { Id_BacSi: id, Id_BenhNhan: patient.Id_BenhNhan }
    });

    if (!review) return res.status(404).json({ detail: 'Review not found' });

    review.SoSao = rating || review.SoSao;
    review.BinhLuan = comment || review.BinhLuan;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ detail: 'Internal error' });
  }
};

exports.getReviewByPatient = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const userId = req.user.id;
    const patient = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
    const review = await DanhGia.findOne({
      where: { Id_BacSi: doctorId, Id_BenhNhan: patient.Id_BenhNhan }
    });
    res.json(review);
  } catch (e) {
    res.status(500).json({ detail: 'Internal error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      specialty_id, bio, experience_years, consultation_fee, 
      degree, training, workplace, languages, services,
      certificate_number, certificates 
    } = req.body;

    const doctor = await BacSi.findOne({ where: { Id_NguoiDung: userId } });
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor profile not found' });
    }

    if (specialty_id) doctor.Id_ChuyenKhoa = specialty_id;
    if (bio !== undefined) doctor.GioiThieu = bio;
    if (experience_years !== undefined) doctor.SoNamKinhNghiem = experience_years;
    if (consultation_fee !== undefined) doctor.PhiTuVan = consultation_fee;
    if (degree !== undefined) doctor.HocHamHocVi = degree;
    if (training !== undefined) doctor.NoiDaoTao = training;
    if (workplace !== undefined) doctor.NoiLamViec = workplace;
    if (languages !== undefined) doctor.NgonNgu = languages;
    if (services !== undefined) doctor.DichVuCungCap = services;
    if (certificate_number !== undefined) doctor.SoChungChiHanhNghe = certificate_number;
    if (certificates !== undefined) doctor.AnhBangCap = JSON.stringify(certificates);

    await doctor.save();
    res.json({ message: 'Profile updated successfully', doctor });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { available_slots } = req.body;

    const doctor = await BacSi.findOne({ where: { Id_NguoiDung: userId } });
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor profile not found' });
    }

    doctor.LichLamViec = JSON.stringify(available_slots);
    await doctor.save();

    res.json({ message: 'Lịch làm việc đã được cập nhật thành công', available_slots });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getStaffMembers = async (req, res) => {
  try {
    const staff = await NguoiDung.findAll({
      include: [{ model: VaiTro, where: { MaVaiTro: 'staff' } }]
    });
    res.json(staff.map(s => ({
      id: s.Id_NguoiDung,
      full_name: `${s.Ho} ${s.Ten}`,
      email: s.Email,
      phone: s.SoDienThoai
    })));
  } catch (error) {
    console.error('Get staff members error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getServiceSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const doctor = await BacSi.findOne({ where: { Id_NguoiDung: userId } });
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor profile not found' });
    }

    res.json({
      consultation_fee: doctor.PhiTuVan,
      appointment_duration: doctor.ThoiLuongKham,
      max_patients_per_session: doctor.SoLuongKhachMacDinh
    });
  } catch (error) {
    console.error('Get service settings error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.updateServiceSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { consultation_fee, appointment_duration, max_patients_per_session } = req.body;

    const doctor = await BacSi.findOne({ where: { Id_NguoiDung: userId } });
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor profile not found' });
    }

    if (consultation_fee !== undefined) doctor.PhiTuVan = consultation_fee;
    if (appointment_duration !== undefined) doctor.ThoiLuongKham = appointment_duration;
    if (max_patients_per_session !== undefined) doctor.SoLuongKhachMacDinh = max_patients_per_session;

    await doctor.save();
    res.json({ message: 'Service settings updated successfully', settings: { consultation_fee: doctor.PhiTuVan, appointment_duration: doctor.ThoiLuongKham, max_patients_per_session: doctor.SoLuongKhachMacDinh } });
  } catch (error) {
    console.error('Update service settings error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getAIDiagnoses = async (req, res) => {
  try {
    const userId = req.user.id;
    const doctor = await BacSi.findOne({ where: { Id_NguoiDung: userId } });
    if (!doctor) return res.status(403).json({ detail: 'Doctor profile required' });

    const diagnoses = await AITuVanPhien.findAll({
      where: { Id_BacSi_PhuTrach: doctor.Id_BacSi },
      include: [
        { model: NguoiDung, as: 'nguoiDung', attributes: ['Id_NguoiDung', 'Ho', 'Ten', 'Email'] }
      ],
      order: [['NgayCapNhat', 'DESC']]
    });

    const result = diagnoses.map(d => ({
      id: d.Id_AITuVanPhien,
      createdAt: d.NgayTao,
      updatedAt: d.NgayCapNhat,
      symptoms: d.TrieuChungTomTat || d.TieuDe || 'Chưa có thông tin',
      diagnosis: d.ChuanDoanSoBo || 'Chưa có chẩn đoán',
      advice: d.LoiKhuyen,
      specialty: d.GoiYChuyenKhoa,
      priority: d.MucDoUuTien,
      status: d.TrangThaiChuyenGiao,
      User: d.nguoiDung ? {
        full_name: `${d.nguoiDung.Ho} ${d.nguoiDung.Ten}`,
        email: d.nguoiDung.Email
      } : null
    }));

    res.json(result);
  } catch (error) {
    console.error('getAIDiagnoses error:', error);
    res.status(500).json({ detail: 'Lỗi khi lấy danh sách chẩn đoán AI' });
  }
};
exports.addReview = async (req, res) => {
  try {
    const { id: doctorId } = req.params;
    const { rating, comment, appointment_id } = req.body;
    const userId = req.user.id;

    const patient = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
    if (!patient) return res.status(403).json({ detail: 'Chỉ bệnh nhân mới có thể đánh giá' });

    // Verify appointment exists and is completed
    const appointment = await DatLich.findOne({
      where: {
        Id_DatLich: appointment_id,
        Id_BenhNhan: patient.Id_BenhNhan,
        TrangThai: { [Op.in]: ['COMPLETED', 'DaKham'] }
      },
      include: [{
        model: LichKham,
        as: 'DoctorSchedule',
        where: { Id_BacSi: doctorId }
      }]
    });

    if (!appointment) {
      return res.status(400).json({ detail: 'Bạn chỉ có thể đánh giá sau khi đã hoàn thành buổi khám với bác sĩ này.' });
    }

    // Check if already reviewed
    const existingReview = await DanhGia.findOne({
      where: { Id_DatLich: appointment_id }
    });
    if (existingReview) {
      return res.status(400).json({ detail: 'Bạn đã đánh giá cho buổi khám này rồi.' });
    }

    const review = await DanhGia.create({
      Id_BacSi: doctorId,
      Id_BenhNhan: patient.Id_BenhNhan,
      Id_DatLich: appointment_id,
      SoSao: rating,
      BinhLuan: comment
    });

    res.status(201).json({ message: 'Cảm ơn bạn đã để lại đánh giá!', review });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ detail: 'Lỗi khi lưu đánh giá' });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id: doctorId } = req.params;
    const { rating, comment, review_id } = req.body;
    const userId = req.user.id;

    const patient = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
    const review = await DanhGia.findByPk(review_id);

    if (!review || review.Id_BenhNhan !== patient.Id_BenhNhan) {
      return res.status(404).json({ detail: 'Không tìm thấy đánh giá của bạn' });
    }

    await review.update({ SoSao: rating, BinhLuan: comment });
    res.json({ message: 'Cập nhật đánh giá thành công', review });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ detail: 'Lỗi khi cập nhật đánh giá' });
  }
};

exports.getReviewByPatient = async (req, res) => {
  try {
    const { id: doctorId } = req.params;
    const userId = req.user.id;

    const patient = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
    if (!patient) return res.json(null);

    const review = await DanhGia.findOne({
      where: { Id_BacSi: doctorId, Id_BenhNhan: patient.Id_BenhNhan },
      order: [['NgayTao', 'DESC']]
    });

    res.json(review);
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ detail: 'Lỗi khi lấy thông tin đánh giá' });
  }
};
