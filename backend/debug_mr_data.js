const { User, MedicalRecord, Appointment, Doctor } = require('./models');
const { sequelize } = require('./models');

async function debugMedicalRecords() {
    try {
        await sequelize.authenticate();
        console.log('Database connection OK.');

        // 1. Find patient1
        const patientEmail = 'patient1@test.com';
        const patient = await User.findOne({ where: { email: patientEmail } });

        if (!patient) {
            console.log(`Patient ${patientEmail} not found.`);
            return;
        }

        console.log(`Patient ${patientEmail} found. ID: ${patient.id}`);

        // 2. Check existing records
        const records = await MedicalRecord.findAll({ where: { patient_id: patient.id } });
        console.log(`Found ${records.length} medical records for patient.`);

        if (records.length === 0) {
            console.log('Creating a dummy medical record...');

            // Find a doctor
            const doctor = await User.findOne({ where: { role: 'doctor' } });
            if (!doctor) {
                console.log('No doctor found to assign record to.');
                return;
            }

            // Find or create an appointment (optional but good for completeness)
            let appointment = await Appointment.findOne({ where: { patient_id: patient.id } });
            if (!appointment) {
                console.log('Creating dummy appointment...');
                appointment = await Appointment.create({
                    patient_id: patient.id,
                    doctor_id: doctor.id,
                    schedule_time: new Date(),
                    status: 'completed',
                    type: 'offline',
                    reason: 'Debug appointment'
                });
            }

            // Create record
            await MedicalRecord.create({
                patient_id: patient.id,
                doctor_id: doctor.id,
                appointment_id: appointment.id,
                diagnosis: 'Viêm họng cấp (Debug Record)',
                prescription: 'Paracetamol 500mg x 10 viên\nUống 2 viên/ngày',
                notes: 'Bệnh nhân cần nghỉ ngơi, uống nhiều nước.',
                date: new Date()
            });

            console.log('Dummy medical record created.');
        } else {
            console.log('Records:', JSON.stringify(records, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugMedicalRecords();
