const { 
    DoctorMedicalRecordRetention, 
    PatientArchiveRecord, 
    db 
} = require('../models');
const { Op } = require('sequelize');

/**
 * Job: Auto-archive doctor medical records after the 7-day retention period.
 * Runs daily at 00:30.
 */
const archiveDoctorMedicalRecordsAfter7DaysJob = async () => {
    console.log('Starting 7-day medical record retention job...');
    
    try {
        const now = new Date();
        
        // Find records whose retention period has expired
        const expired = await DoctorMedicalRecordRetention.findAll({
            where: {
                retentionUntil: { [Op.lte]: now },
                archivedToPatientStorage: false
            }
        });

        console.log(`Found ${expired.length} records to archive.`);

        for (const retention of expired) {
            // 1. Fetch the actual medical record data (using raw query or model)
            // For now, we assume we need to snapshot the state of the medical record
            // We'll need the MedicalRecord model (assumed to exist as 'HoSoBenhAn' or similar)
            const [medicalRecord] = await db.query(
                `SELECT * FROM hoso_benhan WHERE Id_HoSo = :id`, 
                { replacements: { id: retention.medicalRecordId }, type: db.QueryTypes.SELECT }
            );

            if (medicalRecord) {
                // 2. Create Archive Record
                await PatientArchiveRecord.create({
                    patientId: retention.patientId,
                    facilityId: retention.facilityId,
                    recordType: 'MEDICAL_RECORD',
                    sourceId: retention.medicalRecordId,
                    appointmentId: retention.appointmentId,
                    snapshotData: medicalRecord,
                    archivedBy: 'SYSTEM'
                });

                // 3. Mark as archived and lock original (policy-wise)
                retention.archivedToPatientStorage = true;
                retention.archivedAt = new Date();
                await retention.save();
                
                console.log(`Archived Medical Record ${retention.medicalRecordId} for Patient ${retention.patientId}`);
            }
        }
        
        console.log('Medical record archiving job completed.');
    } catch (error) {
        console.error('Error in medical record archiving job:', error);
    }
};

module.exports = { archiveDoctorMedicalRecordsAfter7DaysJob };
