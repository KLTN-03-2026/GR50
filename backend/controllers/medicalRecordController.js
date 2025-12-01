const { MedicalRecord, User, Appointment } = require('../models');

exports.getPatientRecords = async (req, res) => {
    try {
        const patientId = req.user.id;
        const records = await MedicalRecord.findAll({
            where: { patient_id: patientId },
            include: [
                {
                    model: User,
                    as: 'Doctor',
                    attributes: ['full_name', 'email', 'phone']
                },
                {
                    model: Appointment,
                    as: 'Appointment',
                    attributes: ['schedule_time']
                }
            ],
            order: [['date', 'DESC']]
        });
        res.json(records);
    } catch (error) {
        console.error('Get patient records error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getDoctorRecords = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const records = await MedicalRecord.findAll({
            where: { doctor_id: doctorId },
            include: [
                {
                    model: User,
                    as: 'Patient',
                    attributes: ['full_name', 'email', 'phone', 'address', 'date_of_birth']
                },
                {
                    model: Appointment,
                    as: 'Appointment',
                    attributes: ['schedule_time']
                }
            ],
            order: [['date', 'DESC']]
        });
        res.json(records);
    } catch (error) {
        console.error('Get doctor records error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.getRecordDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const record = await MedicalRecord.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'Doctor',
                    attributes: ['full_name', 'email', 'phone']
                },
                {
                    model: User,
                    as: 'Patient',
                    attributes: ['full_name', 'email', 'phone', 'address', 'date_of_birth']
                },
                {
                    model: Appointment,
                    as: 'Appointment',
                    attributes: ['schedule_time']
                }
            ]
        });

        if (!record) {
            return res.status(404).json({ detail: 'Medical record not found' });
        }

        // Authorization check
        if (userRole === 'patient' && record.patient_id !== userId) {
            return res.status(403).json({ detail: 'Unauthorized' });
        }
        // Doctors can view records they created
        if (userRole === 'doctor' && record.doctor_id !== userId) {
            return res.status(403).json({ detail: 'Unauthorized' });
        }

        res.json(record);
    } catch (error) {
        console.error('Get record detail error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};

exports.createRecord = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { patient_id, appointment_id, diagnosis, prescription, notes } = req.body;
        let file_url = req.body.file_url;

        if (req.file) {
            // Store relative path so it can be served
            file_url = `/uploads/medical_records/${req.file.filename}`;
        }

        const record = await MedicalRecord.create({
            patient_id,
            doctor_id: doctorId,
            appointment_id: appointment_id || null,
            diagnosis,
            prescription,
            notes,
            file_url,
            date: new Date()
        });

        res.status(201).json(record);
    } catch (error) {
        console.error('Create medical record error:', error);
        res.status(500).json({ detail: 'Internal server error' });
    }
};
