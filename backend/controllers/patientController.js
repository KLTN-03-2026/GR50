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
