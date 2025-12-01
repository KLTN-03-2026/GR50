const { Appointment, User, Doctor, Review } = require('./models');
const fs = require('fs');

const logFile = 'backend/debug_review_run.txt';
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

async function debugReview() {
    try {
        fs.writeFileSync(logFile, 'Starting review debug...\n');

        // 1. Find doctor and patient
        const doctor = await Doctor.findOne();
        const patient = await User.findOne({ where: { role: 'patient' } });

        if (!doctor || !patient) {
            log('Missing doctor or patient.');
            return;
        }

        const doctorId = doctor.user_id;
        const patientId = patient.id;

        log(`Doctor UserID: ${doctorId}, Patient ID: ${patientId}`);

        // 2. Find or create a completed appointment
        let appointment = await Appointment.findOne({
            where: {
                doctor_id: doctorId,
                patient_id: patientId,
                status: 'completed'
            }
        });

        if (!appointment) {
            log('No completed appointment found. Creating one...');
            appointment = await Appointment.create({
                doctor_id: doctorId,
                patient_id: patientId,
                status: 'completed',
                schedule_time: new Date(),
                type: 'online'
            });
            log(`Created completed appointment ID: ${appointment.id}`);
        } else {
            log(`Found completed appointment ID: ${appointment.id}`);
        }

        // 3. Simulate addReview logic
        log('Simulating addReview...');

        // Check if review exists
        const existingReview = await Review.findOne({
            where: { doctor_id: doctorId, patient_id: patientId }
        });

        if (existingReview) {
            log('Review already exists. Deleting it to test creation...');
            await existingReview.destroy();
        }

        // Create review
        const review = await Review.create({
            doctor_id: doctorId,
            patient_id: patientId,
            appointment_id: appointment.id,
            rating: 5,
            comment: 'Test review from debug script'
        });
        log(`Review created successfully: ID ${review.id}`);

        // Fetch full review
        const fullReview = await Review.findByPk(review.id, {
            include: [{ model: User, as: 'Patient', attributes: ['full_name', 'avatar'] }]
        });
        log('Full review fetched: ' + JSON.stringify(fullReview.toJSON()));

    } catch (error) {
        log('ERROR in debugReview: ' + error.message);
        log(error.stack);
    } finally {
        process.exit();
    }
}

debugReview();
