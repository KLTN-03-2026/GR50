const { ChuyenKhoa } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const specialties = await ChuyenKhoa.findAll();
    res.json(specialties.map(s => ({
      id: s.Id_ChuyenKhoa,
      name: s.TenChuyenKhoa,
      description: s.MoTa,
      image: s.image
    })));
  } catch (error) {
    console.error('Get specialties error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.create = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: 'Admin access required' });
    }
    const { name, description } = req.body;
    const specialty = await ChuyenKhoa.create({ TenChuyenKhoa: name, MoTa: description });
    res.json({
      id: specialty.Id_ChuyenKhoa,
      name: specialty.TenChuyenKhoa,
      description: specialty.MoTa,
      image: specialty.image
    });
  } catch (error) {
    console.error('Create specialty error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const s = await ChuyenKhoa.findByPk(id);
    if (!s) {
      return res.status(404).json({ detail: 'Specialty not found' });
    }
    res.json({
      id: s.Id_ChuyenKhoa,
      name: s.TenChuyenKhoa,
      description: s.MoTa,
      image: s.image
    });
  } catch (error) {
    console.error('Get specialty error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.update = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: 'Admin access required' });
    }
    const { id } = req.params;
    const { name, description } = req.body;
    const s = await ChuyenKhoa.findByPk(id);
    if (!s) return res.status(404).json({ detail: 'Specialty not found' });

    await s.update({ TenChuyenKhoa: name, MoTa: description });

    res.json({
      id: s.Id_ChuyenKhoa,
      name: s.TenChuyenKhoa,
      description: s.MoTa,
      image: s.image
    });
  } catch (error) {
    console.error('Update specialty error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ detail: 'Admin access required' });
    }
    const { id } = req.params;
    const s = await ChuyenKhoa.findByPk(id);
    if (!s) return res.status(404).json({ detail: 'Specialty not found' });

    await s.destroy();
    res.json({ success: true, detail: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete specialty error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
