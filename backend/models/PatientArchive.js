const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 1. High-level summary for fast listing and searching
const PatientArchiveIndex = sequelize.define('PatientArchiveIndex', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false },
    displayPatientId: { type: DataTypes.STRING(50) }, // e.g., PAT-001
    facilityId: { type: DataTypes.INTEGER, allowNull: false },
    fullName: { type: DataTypes.STRING(255) },
    phone: { type: DataTypes.STRING(20) },
    identityNumber: { type: DataTypes.STRING(50) },
    totalAppointments: { type: DataTypes.INTEGER, defaultValue: 0 },
    completedAppointments: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalTransactions: { type: DataTypes.INTEGER, defaultValue: 0 },
    latestVisitAt: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('ACTIVE', 'ARCHIVED', 'INACTIVE'), defaultValue: 'ACTIVE' }
}, { 
    tableName: 'patient_archive_index',
    timestamps: true,
    indexes: [{ unique: true, fields: ['patientId', 'facilityId'] }]
});

// 2. Individual records/snapshots for each event (Visit, Payment, Invoice, etc.)
const PatientArchiveRecord = sequelize.define('PatientArchiveRecord', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false },
    facilityId: { type: DataTypes.INTEGER, allowNull: false },
    recordType: { 
        type: DataTypes.ENUM('APPOINTMENT', 'PAYMENT', 'INVOICE', 'MEDICAL_RECORD', 'CANCELLATION', 'REFUND', 'AI'),
        allowNull: false 
    },
    sourceId: { type: DataTypes.INTEGER, allowNull: false }, // Original ID from source table
    appointmentId: { type: DataTypes.INTEGER },
    snapshotData: { type: DataTypes.JSON, allowNull: false },
    archivedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    archivedBy: { type: DataTypes.STRING, defaultValue: 'SYSTEM' },
    visibleToAdmin: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { 
    tableName: 'patient_archive_records',
    timestamps: false 
});

// 3. Tracking the 7-day editable window for doctors
const DoctorMedicalRecordRetention = sequelize.define('DoctorMedicalRecordRetention', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    medicalRecordId: { type: DataTypes.INTEGER, allowNull: false },
    patientId: { type: DataTypes.INTEGER, allowNull: false },
    doctorId: { type: DataTypes.INTEGER, allowNull: false },
    appointmentId: { type: DataTypes.INTEGER },
    facilityId: { type: DataTypes.INTEGER, allowNull: false },
    doctorCompletedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    retentionUntil: { type: DataTypes.DATE, allowNull: false }, // CurrentTime + 7 days
    archivedToPatientStorage: { type: DataTypes.BOOLEAN, defaultValue: false },
    archivedAt: { type: DataTypes.DATE }
}, { 
    tableName: 'doctor_medical_record_retention',
    timestamps: true 
});

module.exports = { PatientArchiveIndex, PatientArchiveRecord, DoctorMedicalRecordRetention };
