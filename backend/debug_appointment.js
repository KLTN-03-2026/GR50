const { User, Doctor, Appointment, Payment, sequelize } = require('./models');
const axios = require('axios');

async function testBooking() {
    try {
        // 1. Find a patient and a doctor
        const patient = await User.findOne({ where: { role: 'patient' } });
        const doctorUser = await User.findOne({ where: { role: 'doctor' } });

        if (!patient || !doctorUser) {
            console.log('Patient or Doctor not found');
            return;
        }

        console.log(`Patient: ${patient.email} (${patient.id})`);
        console.log(`Doctor User: ${doctorUser.email} (${doctorUser.id})`);

        // 2. Login as patient to get token
        // We can't easily get token without password, but we can mock req.user if we call controller directly, 
        // OR we can generate a token if we have the secret.
        // Let's just try to run the logic that is inside the controller to see if it throws.

        const doctor = await Doctor.findOne({ where: { user_id: doctorUser.id } });
        if (!doctor) {
            console.log('Doctor profile not found');
            return;
        }
        console.log(`Doctor Fee: ${doctor.fee}`);

        const appointment_date = '2025-12-01';
        const appointment_time = '10:00';
        const schedule_time = new Date(`${appointment_date}T${appointment_time}`);

        console.log('Creating appointment...');
        const appointment = await Appointment.create({
            patient_id: patient.id,
            doctor_id: doctorUser.id,
            schedule_time,
            type: 'in_person',
            symptoms: 'Test symptoms',
            status: 'pending'
        });
        console.log('Appointment created:', appointment.id);

        console.log('Creating payment...');
        const payment = await Payment.create({
            appointment_id: appointment.id,
            patient_id: patient.id,
            amount: doctor.fee,
            status: 'pending'
        });
        console.log('Payment created:', payment.payment_id);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

testBooking();
