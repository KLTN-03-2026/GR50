const { ThanhToan, DatLich, BenhNhan, NguoiDung, LichKham, BacSi } = require('../models');

exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const bn = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
    if (!bn) return res.json([]);

    const payments = await ThanhToan.findAll({
      where: { Id_BenhNhan: bn.Id_BenhNhan },
      order: [['createdAt', 'DESC']]
    });

    res.json(payments.map(p => ({
      payment_id: p.Id_ThanhToan,
      status: p.TrangThai === 'ThanhCong' ? 'completed' : 'pending',
      amount: parseFloat(p.SoTien),
      payment_method: p.PhuongThuc,
      transaction_id: p.MaGiaoDich,
      created_at: p.createdAt,
      payment_date: p.createdAt
    })));
  } catch (error) {
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await ThanhToan.findByPk(id, {
      include: [
        {
          model: DatLich,
          include: [
            {
              model: BenhNhan,
              include: [{ model: NguoiDung }]
            },
            {
              model: LichKham,
              include: [{ model: BacSi, include: [{ model: NguoiDung }] }]
            }
          ]
        }
      ]
    });

    if (!payment) return res.status(404).json({ detail: 'Payment not found' });

    let patient_name = 'Bệnh Nhân';
    let doctor_name = 'Bác Sĩ';

    if (payment.DatLich) {
      if (payment.DatLich.BenhNhan?.NguoiDung) {
        patient_name = payment.DatLich.BenhNhan.NguoiDung.Ho + ' ' + payment.DatLich.BenhNhan.NguoiDung.Ten;
      }
      if (payment.DatLich.LichKham?.BacSi?.NguoiDung) {
        doctor_name = payment.DatLich.LichKham.BacSi.NguoiDung.Ho + ' ' + payment.DatLich.LichKham.BacSi.NguoiDung.Ten;
      }
    }

    res.json({
      payment_id: payment.Id_ThanhToan,
      status: payment.TrangThai === 'ThanhCong' ? 'completed' : 'pending',
      amount: parseFloat(payment.SoTien),
      payment_method: payment.PhuongThuc,
      transaction_id: payment.MaGiaoDich,
      created_at: payment.createdAt,
      payment_date: payment.createdAt,
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

    payment.TrangThai = 'ThanhCong';
    payment.PhuongThuc = payment_method === 'credit_card' ? 'VNPay' : 'Momo';
    payment.MaGiaoDich = `TXN-${Date.now()}`;
    await payment.save();

    res.json({ status: 'completed', transaction_id: payment.MaGiaoDich });
  } catch (error) {
    res.status(500).json({ detail: 'Internal server error' });
  }
};
