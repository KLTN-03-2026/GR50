const { DatLich, BenhNhan, NguoiDung, BacSi, LichKham } = require('../models');

exports.create = async (req, res) => {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ detail: 'Patient access required' });

    // Actually creates a new LichKham first for the doctor and books it.
    const { doctor_id, appointment_date, appointment_time, symptoms } = req.body;

    const bacsi = await BacSi.findOne({ where: { Id_NguoiDung: doctor_id } });
    if (!bacsi) return res.status(404).json({ detail: 'Doctor not found' });

    const benhnhan = await BenhNhan.findOne({ where: { Id_NguoiDung: req.user.id } });

    // Create LichKham 
    const lichKham = await LichKham.create({
      Id_BacSi: bacsi.Id_BacSi,
      NgayDate: appointment_date,
      GioBatDau: appointment_time,
      GioKetThuc: appointment_time,
      LoaiKham: 'TrucTiep',
      TrangThai: 'KhaDung'
    });

    const appointment = await DatLich.create({
      MaDatLich: `DL${Date.now()}`,
      Id_BenhNhan: benhnhan.Id_BenhNhan,
      Id_LichKham: lichKham.Id_LichKham,
      TrangThai: 'ChoXacNhan',
      TrieuChungSoBo: symptoms,
      GiaTien: bacsi.PhiTuVan,
      ThoiDiemDat: new Date()
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

    let appointments = [];

    if (role === 'patient') {
      const bn = await BenhNhan.findOne({ where: { Id_NguoiDung: userId } });
      if (bn) {
        appointments = await DatLich.findAll({
          where: { Id_BenhNhan: bn.Id_BenhNhan },
          include: [
            { model: LichKham, include: [{ model: BacSi, include: [NguoiDung] }] },
            { model: BenhNhan, include: [NguoiDung] }
          ]
        });
      }
    } else if (role === 'doctor' || role === 'department_head') {
      const bs = await BacSi.findOne({ where: { Id_NguoiDung: userId } });

      if (bs) {
        appointments = await DatLich.findAll({
          include: [
            { model: LichKham, where: { Id_BacSi: bs.Id_BacSi }, include: [{ model: BacSi, include: [NguoiDung] }] },
            { model: BenhNhan, include: [NguoiDung] }
          ]
        });
      }
    } else {
      return res.status(403).json({ detail: 'Invalid role' });
    }

    const result = appointments.map(apt => {
      const d = apt.toJSON();
      const statusMap = { 'ChoXacNhan': 'pending', 'DaXacNhan': 'confirmed', 'DaKham': 'completed', 'Huy': 'cancelled' };
      return {
        id: d.Id_DatLich,
        status: statusMap[d.TrangThai] || 'pending',
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

    const statusReverseMap = { 'pending': 'ChoXacNhan', 'confirmed': 'DaXacNhan', 'completed': 'DaKham', 'cancelled': 'Huy' };

    await DatLich.update({ TrangThai: statusReverseMap[status] }, { where: { Id_DatLich: id } });
    res.json({ message: 'Updated' });
  } catch (error) {
    res.status(500).json({ detail: 'Error' });
  }
};

exports.updateDiagnosis = async (req, res) => {
  res.json({ message: 'Legacy feature disabled. Modifying AI diagnosis string no longer used.' });
};
