const { MedicalRecord, User, Appointment, sequelize } = require('./models');

async function debugMedicalRecords() {
    try {
        // 1. Find a patient
        const patient = await User.findOne({ where: { role: 'patient' } });
        if (!patient) {
            console.log('No patient found');
            return;
        }
        console.log(`Testing with patient: ${patient.email} (${patient.id})`);

        // 2. Try to fetch records for this patient
        console.log('Fetching records...');
        const records = await MedicalRecord.findAll({
            where: { patient_id: patient.id },
            include: [
                {
                    model: User,
                    as: 'Doctor',
                    attributes: ['full_name', 'email', 'phone']
                },
                {
                    model: Appointment,
                    as: 'Appointment',
                    attributes: ['schedule_time'] // Changed from appointment_date/time to schedule_time
                }
            ],
            // order: [['date', 'DESC']] // 'date' column might be missing?
        });
        console.log(`Found ${records.length} records.`);

        // Check if 'date' column exists in model/db
        // The model definition in MedicalRecord.js DOES NOT have a 'date' field, but controller uses it in order: [['date', 'DESC']]
        // Let's check the columns output again.

    } catch (error) {
        console.error('Error fetching records:', error);
    } finally {
        await sequelize.close();
    }
}

debugMedicalRecords();
