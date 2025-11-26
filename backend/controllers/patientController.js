const { User, Patient } = require('../models');

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await User.findAll({
      where: { role: 'patient' },
      attributes: ['id', 'full_name', 'email', 'phone', 'address']
    });
    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
