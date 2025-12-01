const { Doctor, User, Specialty, Review, Appointment } = require('../models');
const fs = require('fs');

function logError(msg) {
  fs.appendFileSync('backend/controller_err.log', new Date().toISOString() + ': ' + msg + '\n');
}

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
          attributes: ['full_name', 'email', 'phone', 'address', 'role', 'avatar']
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
        consultation_fee: d.fee, // Map fee to consultation_fee for frontend
        full_name: d.User.full_name,
        email: d.User.email,
        avatar: d.User.avatar,
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
    let doctor = await Doctor.findOne({
      where: { user_id: userId },
      include: [
        { model: User, attributes: ['full_name', 'email', 'phone', 'address', 'avatar'] },
        { model: Specialty, attributes: ['name'] }
      ]
    });

    if (!doctor) {
      // Check if user exists and is a doctor
      const user = await User.findOne({ where: { id: userId, role: 'doctor' } });
      if (user) {
        // Auto-create doctor profile
        doctor = await Doctor.create({
          user_id: user.id,
          status: 'pending',
          experience_years: 0,
          fee: 0, // Use fee
          bio: ''
        });

        // Refetch with includes
        doctor = await Doctor.findOne({
          where: { user_id: userId },
          include: [
            { model: User, attributes: ['full_name', 'email', 'phone', 'address', 'avatar'] },
            { model: Specialty, attributes: ['name'] }
          ]
        });
      } else {
        return res.status(404).json({ detail: 'Doctor profile not found' });
      }
    }

    const reviews = await Review.findAll({
      where: { doctor_id: userId },
      include: [{ model: User, as: 'Patient', attributes: ['full_name', 'avatar'] }],
      order: [['createdAt', 'DESC']]
    });

    const doctorData = doctor.toJSON();
    doctorData.consultation_fee = doctorData.fee; // Map fee to consultation_fee
    doctorData.reviews = reviews;
    doctorData.average_rating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;
    doctorData.review_count = reviews.length;
    doctorData.full_name = doctor.User.full_name; // Ensure full_name is at top level for convenience
    doctorData.avatar = doctor.User.avatar;

    res.json(doctorData);
  } catch (error) {
    console.error('Get doctor profile error:', error);
    logError('Get doctor profile error: ' + error.message + '\n' + error.stack);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.addReview = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const patientId = req.user.id;
    const { rating, comment } = req.body;

    // Check if doctor exists
    const doctor = await Doctor.findOne({ where: { user_id: doctorId } });
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor not found' });
    }

    // Check if patient has a completed appointment with this doctor
    const appointment = await Appointment.findOne({
      where: {
        doctor_id: doctorId,
        patient_id: patientId,
        status: 'completed'
      }
    });

    if (!appointment) {
      return res.status(403).json({ detail: 'Bạn chỉ có thể đánh giá bác sĩ sau khi đã hoàn thành buổi khám.' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      where: { doctor_id: doctorId, patient_id: patientId }
    });

    if (existingReview) {
      return res.status(400).json({ detail: 'Bạn đã đánh giá bác sĩ này rồi.' });
    }

    const review = await Review.create({
      doctor_id: doctorId,
      patient_id: patientId,
      appointment_id: appointment.id,
      rating,
      comment
    });

    const fullReview = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'Patient', attributes: ['full_name', 'avatar'] }]
    });

    res.status(201).json(fullReview);
  } catch (error) {
    console.error('Add review error:', error);
    logError('Add review error: ' + error.message + '\n' + error.stack);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const patientId = req.user.id;
    const { rating, comment } = req.body;

    const review = await Review.findOne({
      where: { doctor_id: doctorId, patient_id: patientId }
    });

    if (!review) {
      return res.status(404).json({ detail: 'Review not found' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    const fullReview = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'Patient', attributes: ['full_name', 'avatar'] }]
    });

    res.json(fullReview);
  } catch (error) {
    console.error('Update review error:', error);
    logError('Update review error: ' + error.message + '\n' + error.stack);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getReviewByPatient = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const patientId = req.user.id;

    const review = await Review.findOne({
      where: { doctor_id: doctorId, patient_id: patientId },
      include: [{ model: User, as: 'Patient', attributes: ['full_name', 'avatar'] }]
    });

    res.json(review); // Returns null if not found, which is fine
  } catch (error) {
    console.error('Get review by patient error:', error);
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
    if (consultation_fee !== undefined) doctor.fee = consultation_fee; // Map consultation_fee to fee

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
