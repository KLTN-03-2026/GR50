const { Appointment, User, Doctor } = require('./models');
const fs = require('fs');

const logFile = 'backend/debug_review_data.txt';
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

async function checkData() {
    try {
        fs.writeFileSync(logFile, 'Checking data for review...\n');

        // 1. Find a doctor
        const doctor = await Doctor.findOne();
        if (!doctor) {
            log('No doctor found.');
            return;
        }
        log(`Doctor found: ID ${doctor.id}, UserID ${doctor.user_id}`);

        // 2. Find a patient (who is not the doctor)
        const patient = await User.findOne({ where: { role: 'patient' } });
        if (!patient) {
            log('No patient found.');
            return;
        }
        log(`Patient found: ID ${patient.id}, Name ${patient.full_name}`);

        // 3. Check for appointments
        const appointments = await Appointment.findAll({
            where: {
                doctor_id: doctor.user_id, // Appointment uses user_id for doctor_id usually? Let's check model.
                patient_id: patient.id
            }
        });
        log(`Found ${appointments.length} appointments.`);
        appointments.forEach(a => log(`- Appt ID ${a.id}, Status: ${a.status}`));

    } catch (error) {
        log('Error: ' + error.message);
    } finally {
        process.exit();
    }
}

checkData();
