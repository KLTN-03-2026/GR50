const { Payment, Appointment, User } = require('../models');

exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.findAll({
      where: { patient_id: userId },
      include: [
        {
          model: Appointment,
          include: [
            { model: User, as: 'Doctor', attributes: ['full_name'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Format data for frontend
    const formattedPayments = payments.map(p => ({
      payment_id: p.payment_id,
      status: p.status,
      doctor_name: p.Appointment?.Doctor?.full_name || 'Unknown Doctor',
      amount: parseFloat(p.amount),
      payment_method: p.payment_method,
      transaction_id: p.transaction_id,
      created_at: p.createdAt,
      payment_date: p.payment_date
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      where: {
        payment_id: id,
        patient_id: userId
      },
      include: [
        {
          model: Appointment,
          include: [
            { model: User, as: 'Doctor', attributes: ['full_name'] },
            { model: User, as: 'Patient', attributes: ['full_name'] }
          ]
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({ detail: 'Payment not found' });
    }

    res.json({
      payment_id: payment.payment_id,
      status: payment.status,
      doctor_name: payment.Appointment?.Doctor?.full_name || 'Unknown Doctor',
      patient_name: payment.Appointment?.Patient?.full_name || 'Unknown Patient',
      amount: parseFloat(payment.amount),
      payment_method: payment.payment_method,
      transaction_id: payment.transaction_id,
      created_at: payment.createdAt,
      payment_date: payment.payment_date,
      doctor_id: payment.Appointment?.doctor_id
    });

  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      where: {
        payment_id: id,
        patient_id: userId
      }
    });

    if (!payment) {
      return res.status(404).json({ detail: 'Payment not found' });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({ detail: 'Payment already completed' });
    }

    // Mock processing
    payment.status = 'completed';
    payment.payment_method = payment_method;
    payment.transaction_id = `TXN-${Date.now()}`;
    payment.payment_date = new Date();
    await payment.save();

    // Update appointment status to confirmed if it was pending
    const appointment = await Appointment.findByPk(payment.appointment_id);
    if (appointment && appointment.status === 'pending') {
      appointment.status = 'confirmed';
      await appointment.save();
    }

    res.json({ status: 'completed', transaction_id: payment.transaction_id });

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
};
