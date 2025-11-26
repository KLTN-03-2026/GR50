const { Doctor, User, Specialty } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const { specialty_id } = req.query;
    const whereClause = { status: 'approved' };
    if (specialty_id) {
      whereClause.specialty_id = specialty_id;
    }

    const doctors = await Doctor.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['full_name', 'email', 'phone', 'address', 'role']
        },
        {
          model: Specialty,
          attributes: ['name']
        }
      ]
    });

    const result = doctors.map(doc => {
      const d = doc.toJSON();
      return {
        ...d,
        full_name: d.User.full_name,
        email: d.User.email,
        specialty_name: d.Specialty ? d.Specialty.name : null
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const doctor = await Doctor.findOne({
      where: { user_id: userId },
      include: [
        { model: User, attributes: ['full_name', 'email', 'phone', 'address'] },
        { model: Specialty, attributes: ['name'] }
      ]
    });

    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { specialty_id, bio, experience_years, consultation_fee } = req.body;

    const doctor = await Doctor.findOne({ where: { user_id: userId } });
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor profile not found' });
    }

    if (specialty_id) doctor.specialty_id = specialty_id;
    if (bio !== undefined) doctor.bio = bio;
    if (experience_years !== undefined) doctor.experience_years = experience_years;
    if (consultation_fee !== undefined) doctor.consultation_fee = consultation_fee;
    
    await doctor.save();

    res.json({ message: 'Profile updated successfully', doctor });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { available_slots } = req.body;

    const doctor = await Doctor.findOne({ where: { user_id: userId } });
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor profile not found' });
    }

    doctor.available_slots = available_slots;
    await doctor.save();

    res.json({ message: 'Schedule updated successfully', doctor });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getDepartmentHeads = async (req, res) => {
  try {
    const heads = await User.findAll({
      where: { role: 'department_head' },
      attributes: ['id', 'full_name', 'email', 'phone', 'address']
    });
    res.json(heads);
  } catch (error) {
    console.error('Get department heads error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
