const { DatLich, KhamOnline, TinNhanKham, NguoiDung } = require('../models');

exports.getMessagesByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Find or create KhamOnline wrapper around DatLich
    let ko = await KhamOnline.findOne({ where: { Id_DatLich: appointmentId } });
    if (!ko) {
      ko = await KhamOnline.create({ Id_DatLich: appointmentId, LoaiTuVan: 'Chat', TrangThai: 'DangKham' });
    }

    const messages = await TinNhanKham.findAll({
      where: { Id_KhamOnline: ko.Id_KhamOnline },
      order: [['ThoiGianGui', 'ASC']],
      include: [{ model: NguoiDung }]
    });

    res.json(messages.map(m => ({
      id: m.Id_TinNhan,
      content: m.NoiDung,
      createdAt: m.ThoiGianGui,
      sender: { id: m.Id_NguoiGui, full_name: `${m.NguoiDung.Ho} ${m.NguoiDung.Ten}`, avatar: m.NguoiDung.AnhDaiDien },
      sender_id: m.Id_NguoiGui,
      is_mine: m.Id_NguoiGui === req.user.id
    })));
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ detail: 'Internal error' });
  }
};

exports.sendMessageByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { content } = req.body;
    let fileUrl = null;

    if (req.file) {
      fileUrl = `/ uploads / chat / ${req.file.filename}`;
    }

    let ko = await KhamOnline.findOne({ where: { Id_DatLich: appointmentId } });
    if (!ko) {
      ko = await KhamOnline.create({ Id_DatLich: appointmentId, LoaiTuVan: 'Chat', TrangThai: 'DangKham' });
    }

    const msg = await TinNhanKham.create({
      Id_KhamOnline: ko.Id_KhamOnline,
      Id_NguoiGui: req.user.id,
      LoaiTinNhan: req.file ? 'Image' : 'Text',
      NoiDung: content || '',
      TapDinhKem: fileUrl
    });

    const sender = await NguoiDung.findByPk(req.user.id);

    res.json({
      id: msg.Id_TinNhan,
      content: msg.NoiDung,
      createdAt: msg.ThoiGianGui,
      file_url: fileUrl,
      is_mine: true,
      sender_id: req.user.id,
      sender: { full_name: `${sender.Ho} ${sender.Ten}` }
    });
  } catch (error) {
    res.status(500).json({ detail: 'Error' });
  }
};
