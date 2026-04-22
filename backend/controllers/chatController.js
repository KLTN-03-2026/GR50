const { DatLich, KhamOnline, TinNhanKham, NguoiDung } = require('../models');
const { Op } = require('sequelize');

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
      fileUrl = `/uploads/chat/${req.file.filename}`;
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
      TapDinhKem: fileUrl,
      DaDoc: 0
    });

    const sender = await NguoiDung.findByPk(req.user.id);

    const messageData = {
      id: msg.Id_TinNhan,
      content: msg.NoiDung,
      createdAt: msg.ThoiGianGui,
      file_url: fileUrl,
      is_mine: false,
      sender_id: req.user.id,
      sender: { full_name: `${sender.Ho} ${sender.Ten}`, id: req.user.id, avatar: sender.AnhDaiDien },
      sender_name: `${sender.Ho} ${sender.Ten}`,
      Id_KhamOnline: ko.Id_KhamOnline
    };

    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_appointment_${appointmentId}`).emit('receive_message', messageData);
    }

    res.json({ ...messageData, is_mine: true });
  } catch (error) {
    console.error('SendMessage error:', error);
    res.status(500).json({ detail: 'Error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const ko = await KhamOnline.findOne({ where: { Id_DatLich: appointmentId } });
    if (!ko) return res.json({ message: 'OK' });

    await TinNhanKham.update(
      { DaDoc: 1 },
      {
        where: {
          Id_KhamOnline: ko.Id_KhamOnline,
          DaDoc: 0,
          Id_NguoiGui: { [Op.ne]: userId }
        }
      }
    );
    res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error('MarkAsRead error:', err);
    res.status(500).json({ detail: 'Error' });
  }
};
