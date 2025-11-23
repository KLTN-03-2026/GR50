const { Specialty } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const specialties = await Specialty.findAll();
    res.json(specialties);
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
    const specialty = await Specialty.create({ name, description });
    res.json(specialty);
  } catch (error) {
    console.error('Create specialty error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
