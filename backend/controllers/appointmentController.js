const { DatLich, BenhNhan, NguoiDung, BacSi, LichKham, ThanhToan, HoaDon } = require('../models');

exports.create = async (req, res) => {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ detail: 'Patient access required' });

    const { doctor_id, facility_id, appointment_date, appointment_time, symptoms, appointment_type } = req.body;

    if (!facility_id) return res.status(400).json({ detail: 'Facility ID is required for multi-facility booking' });

    const bacsi = await BacSi.findOne({ where: { Id_NguoiDung: doctor_id } });
    if (!bacsi) return res.status(404).json({ detail: 'Doctor not found' });

    const benhnhan = await BenhNhan.findOne({ where: { Id_NguoiDung: req.user.id } });

    // Map frontend appointment_type to database LoaiKham
    const dbLoaiKham = appointment_type === 'online' ? 'Online' : 'TrucTiep';

    // Check if slot already exists for this exact time, type AND facility
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
      // Check maximum capacity limit
      if (lichKham.SoLuongDaDat >= lichKham.SoLuongToiDa) {
        return res.status(400).json({ detail: 'Khung giờ này đã đủ số lượng bệnh nhân tối đa.' });
      }
      lichKham.SoLuongDaDat += 1;
      if (lichKham.SoLuongDaDat >= lichKham.SoLuongToiDa) {
        lichKham.TrangThai = 'DaDay';
      }
      await lichKham.save();
    } else {
      // Create new dynamic slot if it doesn't exist
      lichKham = await LichKham.create({
        Id_BacSi: bacsi.Id_BacSi,
        Id_PhongKham: facility_id,
        NgayDate: appointment_date,
        GioBatDau: appointment_time,
        GioKetThuc: appointment_time,
        LoaiKham: dbLoaiKham,
        TrangThai: 'KhaDung',
        SoLuongToiDa: bacsi.SoLuongKhachMacDinh || 10,
        SoLuongDaDat: 1
      });
    }

    const appointment = await DatLich.create({
      MaDatLich: `DL${Date.now()}`,
      Id_BenhNhan: benhnhan.Id_BenhNhan,
      Id_LichKham: lichKham.Id_LichKham,
      Id_PhongKham: facility_id,
      TrangThai: 'PENDING',
      TrieuChungSoBo: symptoms,
      GhiChu: '',
      GiaTien: bacsi.PhiTuVan,
      ThoiDiemDat: new Date()
    });

    // Create initial unpaid payment record immediately
    await ThanhToan.create({
      Id_DatLich: appointment.Id_DatLich,
      Id_BenhNhan: benhnhan.Id_BenhNhan,
      Id_PhongKham: facility_id,
      MaDonHang: `ORDER-${Date.now()}`,
      SoTien: bacsi.PhiTuVan,
      PhuongThuc: 'TienMat',
      TrangThai: 'UNPAID',
      MoTa: `Thanh toán phí hẹn khám cho mã ${appointment.MaDatLich}`
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
      const bn = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
      if (bn) {
        const whereClause = { Id_BenhNhan: bn.Id_BenhNhan };
        if (facility_id) whereClause.Id_PhongKham = facility_id;
        
        appointments = await DatLich.findAll({
          where: whereClause,
          include: [
            { model: LichKham, include: [{ model: BacSi, include: [NguoiDung] }] },
            { model: BenhNhan, include: [NguoiDung] },
            { model: ThanhToan }
          ]
        });
      }
    } else if (role === 'doctor') {
      const bs = await BacSi.findOne({ where: { Id_NguoiDung: userId } });

      if (bs) {
        const whereClause = {};
        if (facility_id) whereClause.Id_PhongKham = facility_id;
        
        appointments = await DatLich.findAll({
          where: whereClause,
          include: [
            { model: LichKham, where: { Id_BacSi: bs.Id_BacSi }, include: [{ model: BacSi, include: [NguoiDung] }] },
            { model: BenhNhan, include: [NguoiDung] },
            { model: ThanhToan }
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
        'IN_PROGRESS': 'in_progress', 'COMPLETED': 'completed', 'CANCELLED': 'cancelled', 'NO_SHOW': 'no_show'
      };
      let pStatus = 'unpaid';
      if (d.ThanhToan && (d.ThanhToan.TrangThai === 'PAID' || d.ThanhToan.TrangThai === 'ThanhCong')) {
        pStatus = 'paid';
      }

      return {
        id: d.Id_DatLich,
        status: statusMap[d.TrangThai] || 'pending',
        payment_status: pStatus,
        doctor_name: `${d.LichKham.BacSi.NguoiDung.Ho} ${d.LichKham.BacSi.NguoiDung.Ten}`,
        patient_name: `${d.BenhNhan.NguoiDung.Ho} ${d.BenhNhan.NguoiDung.Ten}`,
        appointment_date: d.LichKham.NgayDate,
        appointment_time: d.LichKham.GioBatDau,
        appointment_type: d.LichKham.LoaiKham === 'Online' ? 'online' : 'in-person',
        symptoms: d.TrieuChungSoBo
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
      include: [{ model: LichKham }]
    });

    if (!appointment) return res.status(404).json({ detail: 'Not found' });

    if (req.user.role === 'doctor') {
      const bs = await BacSi.findOne({ where: { Id_NguoiDung: req.user.id } });
      if (!bs || appointment.LichKham.Id_BacSi !== bs.Id_BacSi) {
        return res.status(403).json({ detail: 'Bạn không có quyền xử lý lịch hẹn này.' });
      }
    }

    if (appointment.TrangThai === 'COMPLETED' || appointment.TrangThai === 'DaKham') {
      return res.status(400).json({ detail: 'Cannot change status of a completed appointment backwards.' });
    }

    appointment.TrangThai = newTrangThai;
    await appointment.save();

    res.json({ message: 'Updated', status: newTrangThai });
  } catch (error) {
    res.status(500).json({ detail: 'Error' });
  }
};

exports.completeExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { phiKham, phiDichVu = 0, phiThuoc = 0, giamGia = 0, ghiChu = '' } = req.body;

    const appointment = await DatLich.findOne({
      where: { Id_DatLich: id },
      include: [{ model: LichKham }]
    });

    if (!appointment) return res.status(404).json({ detail: 'Appointment not found' });

    if (req.user.role === 'doctor') {
      const bs = await BacSi.findOne({ where: { Id_NguoiDung: req.user.id } });
      if (!bs || appointment.LichKham.Id_BacSi !== bs.Id_BacSi) {
        return res.status(403).json({ detail: 'Bạn không có quyền hoàn tất khám cho lịch hẹn này.' });
      }
    }

    if (appointment.TrangThai === 'COMPLETED' || appointment.TrangThai === 'DaKham') {
      return res.status(400).json({ detail: 'Bệnh nhân này đã hoàn tất khám.' });
    }

    appointment.TrangThai = 'COMPLETED';
    appointment.GhiChu = ghiChu || appointment.GhiChu;
    await appointment.save();

    const totalAmount = Number(phiKham) + Number(phiDichVu) + Number(phiThuoc) - Number(giamGia);

    const invoice = await HoaDon.create({
      Id_DatLich: appointment.Id_DatLich,
      PhiKham: phiKham,
      PhiDichVu: phiDichVu,
      PhiThuoc: phiThuoc,
      GiamGia: giamGia,
      TongTien: totalAmount,
      TrangThai: 'ISSUED',
      GhiChu: ghiChu
    });

    let payment = await ThanhToan.findOne({ where: { Id_DatLich: appointment.Id_DatLich } });
    if (payment) {
      payment.Id_HoaDon = invoice.Id_HoaDon;
      payment.SoTien = totalAmount;
      payment.TrangThai = 'UNPAID';
      await payment.save();
    } else {
      payment = await ThanhToan.create({
        Id_DatLich: appointment.Id_DatLich,
        Id_BenhNhan: appointment.Id_BenhNhan,
        Id_HoaDon: invoice.Id_HoaDon,
        MaDonHang: `ORDER-${Date.now()}`,
        SoTien: totalAmount,
        PhuongThuc: 'TienMat',
        TrangThai: 'UNPAID',
        MoTa: `Thanh toán phí hoàn thành khám theo hóa đơn ${invoice.Id_HoaDon}`
      });
    }

    res.json({ message: 'Exam completed and invoice generated successfully', invoice_id: invoice.Id_HoaDon });
  } catch (error) {
    console.error('Complete exam error:', error);
    res.status(500).json({ detail: 'Internal server error while completing exam' });
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

    appointment.TrangThai = 'CANCELLED';
    appointment.LyDoHuy = reason || 'Bệnh nhân tự hủy';
    await appointment.save();

    const lichKham = await LichKham.findOne({ where: { Id_LichKham: appointment.Id_LichKham } });
    if (lichKham && lichKham.SoLuongDaDat > 0) {
      lichKham.SoLuongDaDat -= 1;
      if (lichKham.TrangThai === 'DaDay') {
        lichKham.TrangThai = 'KhaDung';
      }
      await lichKham.save();
    }

    res.json({ message: 'Đã hủy lịch thành công' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, facilityId, date } = req.query;
        if (!doctorId || !date) return res.status(400).json({ detail: 'Missing doctorId or date' });

        const whereClause = {
            Id_BacSi: doctorId,
            NgayDate: date,
            TrangThai: 'KhaDung'
        };

        if (facilityId) {
            whereClause.Id_PhongKham = facilityId;
        }

        const slots = await LichKham.findAll({
            where: whereClause,
            order: [['GioBatDau', 'ASC']]
        });

        res.json(slots.map(s => ({
            id: s.Id_LichKham,
            facility_id: s.Id_PhongKham,
            time: s.GioBatDau.substring(0, 5) // HH:mm
        })));
    } catch (error) {
        console.error('GetAvailableSlots Error:', error);
        res.status(500).json({ detail: 'Error fetching slots' });
    }
};
