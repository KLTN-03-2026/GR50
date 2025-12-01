const { Appointment, User, Doctor, Payment } = require('../models');
const { Op } = require('sequelize');

exports.create = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ detail: 'Patient access required' });
    }

    const { doctor_id, appointment_date, appointment_time, symptoms, ai_diagnosis, appointment_type } = req.body;

    const doctor = await Doctor.findOne({ where: { user_id: doctor_id } });
    if (!doctor) {
      return res.status(404).json({ detail: 'Doctor not found' });
    }

    // Combine date and time into schedule_time
    const schedule_time = new Date(`${appointment_date}T${appointment_time}`);

    const appointment = await Appointment.create({
      patient_id: req.user.id,
      doctor_id,
      schedule_time,
      type: appointment_type,
      symptoms,
      ai_diagnosis,
      status: 'pending'
    });

    // Auto create payment
    const payment = await Payment.create({
      appointment_id: appointment.id,
      patient_id: req.user.id,
      amount: doctor.fee,
      status: 'pending'
    });

    const result = await Appointment.findByPk(appointment.id, {
      include: [
        { model: User, as: 'Doctor', attributes: ['full_name'] },
        { model: User, as: 'Patient', attributes: ['full_name'] }
      ]
    });

    const aptDict = result.toJSON();
    aptDict.payment_id = payment.payment_id;
    aptDict.doctor_name = result.Doctor.full_name;
    aptDict.patient_name = result.Patient.full_name;

    res.json(aptDict);
  } catch (error) {
    console.error('Create appointment error:', error);
    console.error('Request body:', req.body);
    console.error('User:', req.user);
    if (error.name === 'SequelizeValidationError') {
      console.error('Validation errors:', error.errors);
    }
    res.status(500).json({ detail: 'Internal server error: ' + error.message });
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
      order: [['schedule_time', 'DESC']]
    });

    const result = appointments.map(apt => {
      const d = apt.toJSON();
      d.doctor_name = apt.Doctor.full_name;
      d.patient_name = apt.Patient.full_name;

      // Map schedule_time back to date and time
      if (d.schedule_time) {
        const dateObj = new Date(d.schedule_time);
        d.appointment_date = dateObj.toISOString().split('T')[0];
        d.appointment_time = dateObj.toTimeString().split(' ')[0].substring(0, 5);
      }

      // Map type back to appointment_type
      d.appointment_type = d.type;

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

exports.updateDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const { ai_diagnosis, final_diagnosis } = req.body;
    const role = req.user.role;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ detail: 'Appointment not found' });
    }

    // Patient can update AI diagnosis (if not already set or updating it)
    // Doctor can update Final diagnosis

    if (role === 'patient') {
      if (appointment.patient_id !== req.user.id) {
        return res.status(403).json({ detail: 'Not your appointment' });
      }
      if (ai_diagnosis) appointment.ai_diagnosis = ai_diagnosis;
    } else if (role === 'doctor') {
      if (appointment.doctor_id !== req.user.id) {
        return res.status(403).json({ detail: 'Not your appointment' });
      }
      if (final_diagnosis) appointment.final_diagnosis = final_diagnosis;
      // Doctor can also override AI diagnosis if needed, but usually they set final
    } else {
      return res.status(403).json({ detail: 'Permission denied' });
    }

    await appointment.save();
    res.json(appointment);
  } catch (error) {
    console.error('Update diagnosis error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
