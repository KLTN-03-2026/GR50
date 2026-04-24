const { ThanhToan, DatLich: Appointment, BenhNhan, NguoiDung, LichKham: DoctorSchedule, BacSi } = require('../models');

exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const bn = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
    if (!bn) return res.json([]);

    const payments = await ThanhToan.findAll({
      where: { Id_BenhNhan: bn.Id_BenhNhan },
      order: [['NgayTao', 'DESC']],
      include: [
        {
          model: Appointment,
          include: [
            {
              model: BenhNhan,
              include: [{ model: NguoiDung }]
            },
            {
              model: DoctorSchedule,
              include: [{ model: BacSi, include: [{ model: NguoiDung }] }]
            }
          ]
        }
      ]
    });

    res.json(payments.map(p => {
      let doctor_name = 'Bác Sĩ';
      if (p.Appointment && p.Appointment.DoctorSchedule && p.Appointment.DoctorSchedule.BacSi && p.Appointment.DoctorSchedule.BacSi.NguoiDung) {
        doctor_name = p.Appointment.DoctorSchedule.BacSi.NguoiDung.Ho + ' ' + p.Appointment.DoctorSchedule.BacSi.NguoiDung.Ten;
      }
      return {
        payment_id: p.Id_ThanhToan,
        status: p.TrangThai === 'PAID' || p.TrangThai === 'ThanhCong' ? 'completed' : 'pending',
        amount: parseFloat(p.SoTien),
        payment_method: p.PhuongThuc,
        transaction_id: p.MaGiaoDich,
        created_at: p.NgayTao,
        payment_date: p.NgayCapNhat,
        doctor_name: doctor_name
      };
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await ThanhToan.findByPk(id, {
      include: [
        {
          model: Appointment,
          include: [
            {
              model: BenhNhan,
              include: [{ model: NguoiDung }]
            },
            {
              model: DoctorSchedule,
              include: [{ model: BacSi, include: [{ model: NguoiDung }] }]
            }
          ]
        }
      ]
    });

    if (!payment) return res.status(404).json({ detail: 'Payment not found' });

    let patient_name = 'Bệnh Nhân';
    let doctor_name = 'Bác Sĩ';

    if (payment.Appointment) {
      if (payment.Appointment.BenhNhan?.NguoiDung) {
        patient_name = payment.Appointment.BenhNhan.NguoiDung.Ho + ' ' + payment.Appointment.BenhNhan.NguoiDung.Ten;
      }
      if (payment.Appointment.DoctorSchedule?.BacSi?.NguoiDung) {
        doctor_name = payment.Appointment.DoctorSchedule.BacSi.NguoiDung.Ho + ' ' + payment.Appointment.DoctorSchedule.BacSi.NguoiDung.Ten;
      }
    }

    res.json({
      payment_id: payment.Id_ThanhToan,
      status: payment.TrangThai === 'PAID' || payment.TrangThai === 'ThanhCong' ? 'completed' : 'pending',
      amount: parseFloat(payment.SoTien),
      payment_method: payment.PhuongThuc,
      transaction_id: payment.MaGiaoDich,
      created_at: payment.NgayTao,
      payment_date: payment.NgayTao,
      doctor_name: doctor_name,
      patient_name: patient_name
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;

    const payment = await ThanhToan.findByPk(id);
    if (!payment) return res.status(404).json({ detail: 'Payment not found' });

    payment.TrangThai = 'PAID';
    payment.PhuongThuc = payment_method === 'mock_bank' ? 'VNPay' : (payment_method === 'mock_wallet' ? 'Momo' : 'TienMat');
    payment.MaGiaoDich = `TXN-${Date.now()}`;
    await payment.save();

    // Do NOT update Appointment to DaXacNhan/Confirm upon payment anymore
    // Because payment only occurs when Appointment is already COMPLETED.
    if (payment.Id_HoaDon) {
      const { HoaDon } = require('../models');
      await HoaDon.update({ TrangThai: 'PAID' }, { where: { Id_HoaDon: payment.Id_HoaDon } });
    }

    res.json({ status: 'completed', transaction_id: payment.MaGiaoDich });
  } catch (error) {
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const datLich = await Appointment.findByPk(appointmentId);
    if (!datLich) {
      return res.status(404).json({ detail: 'Appointment not found' });
    }

    if (datLich.TrangThai !== 'COMPLETED' && datLich.TrangThai !== 'DaKham') {
      return res.status(400).json({ detail: 'Bạn chỉ có thể thanh toán sau khi bác sĩ đã khám xong (Trạng thái: Hoàn thành).' });
    }

    let payment = await ThanhToan.findOne({
      where: {
        Id_DatLich: appointmentId,
        TrangThai: 'UNPAID'
      }
    });

    // If we only have old 'ChoThanhToan'
    if (!payment) {
      payment = await ThanhToan.findOne({
        where: {
          Id_DatLich: appointmentId,
          TrangThai: 'ChoThanhToan'
        }
      });
    }

    if (!payment) {
      return res.status(404).json({ detail: 'Không tìm thấy thông tin thanh toán (hóa đơn chưa được lập).' });
    }

    res.json({
      payment_id: payment.Id_ThanhToan,
      status: 'pending'
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
