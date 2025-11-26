const { Appointment, User, Doctor, Payment } = require('../models');
const { Op } = require('sequelize');

exports.create = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ detail: 'Patient access required' });
    }

    const { doctor_id, appointment_date, appointment_time, symptoms } = req.body;

    const doctor = await Doctor.findOne({ where: { user_id: doctor_id } });
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      patient_id: req.user.id,
      doctor_id,
      appointment_date,
      appointment_time,
      symptoms,
      status: 'pending'
    });

    // Auto create payment
    await Payment.create({
      appointment_id: appointment.id,
      patient_id: req.user.id,
      amount: doctor.consultation_fee,
      status: 'pending'
    });
    
    const result = await Appointment.findByPk(appointment.id, {
      include: [
        { model: User, as: 'Doctor', attributes: ['full_name'] },
        { model: User, as: 'Patient', attributes: ['full_name'] }
      ]
    });

    const aptDict = result.toJSON();
    aptDict.doctor_name = result.Doctor.full_name;
    aptDict.patient_name = result.Patient.full_name;

    res.json(aptDict);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    let whereClause = {};

    if (role === 'patient') {
      whereClause.patient_id = userId;
    } else if (role === 'doctor') {
      whereClause.doctor_id = userId;
    } else {
      return res.status(403).json({ detail: 'Invalid role' });
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'Doctor', attributes: ['full_name'] },
        { model: User, as: 'Patient', attributes: ['full_name'] }
      ],
      order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']]
    });

    const result = appointments.map(apt => {
      const d = apt.toJSON();
      d.doctor_name = apt.Doctor.full_name;
      d.patient_name = apt.Patient.full_name;
      return d;
    });

    res.json(result);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ detail: 'Doctor access required' });
    }

    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ detail: 'Appointment not found' });
    }

    if (appointment.doctor_id !== req.user.id) {
      return res.status(403).json({ detail: 'Not your appointment' });
    }

    appointment.status = status;
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
