const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 1. AI Consultation Session
const AIConsultationSession = sequelize.define('AIConsultationSession', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    displaySessionId: { type: DataTypes.STRING(30), unique: true }, // AI-20260424-0001
    patientId: { type: DataTypes.INTEGER, allowNull: true }, // Null for Guests
    guestId: { type: DataTypes.STRING, allowNull: true },
    facilityId: { type: DataTypes.INTEGER, allowNull: true },
    source: { type: DataTypes.ENUM('WEB', 'MOBILE', 'STAFF_ASSIST'), defaultValue: 'WEB' },
    status: { 
        type: DataTypes.ENUM(
            'NEW', 'SUGGESTED', 'PATIENT_VIEWED', 'BOOKING_STARTED', 
            'APPOINTMENT_CREATED', 'WAITING_DOCTOR_REVIEW', 'DOCTOR_REVIEWED', 
            'RECONCILED_MATCHED', 'RECONCILED_PARTIAL', 'RECONCILED_MISMATCH', 'ARCHIVED'
        ),
        defaultValue: 'NEW'
    },
    language: { type: DataTypes.STRING(10), defaultValue: 'vi' }
}, { tableName: 'ai_consultation_sessions', timestamps: true });

// 2. AI Consultation Input (Symptoms & Narrative)
const AIConsultationInput = sequelize.define('AIConsultationInput', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    aiSessionId: { type: DataTypes.INTEGER, references: { model: 'ai_consultation_sessions', key: 'id' } },
    symptoms: { type: DataTypes.TEXT },
    symptomDuration: { type: DataTypes.STRING },
    severityLevel: { type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'), defaultValue: 'MEDIUM' },
    bodyArea: { type: DataTypes.STRING },
    medicalHistoryText: { type: DataTypes.TEXT },
    preferredVisitType: { type: DataTypes.ENUM('ONLINE', 'OFFLINE', 'UNSURE'), defaultValue: 'UNSURE' },
    preferredFacilityId: { type: DataTypes.INTEGER, allowNull: true }
}, { tableName: 'ai_consultation_inputs', timestamps: false });

// 3. AI Consultation Result (The Logic & Confidence)
const AIConsultationResult = sequelize.define('AIConsultationResult', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    aiSessionId: { type: DataTypes.INTEGER, references: { model: 'ai_consultation_sessions', key: 'id' } },
    summary: { type: DataTypes.TEXT }, // AI's internal understanding
    preliminarySuggestion: { type: DataTypes.TEXT }, // What's shown to patient
    priorityLevel: { type: DataTypes.ENUM('NORMAL', 'PRIORITY', 'URGENT'), defaultValue: 'NORMAL' },
    confidenceScore: { type: DataTypes.FLOAT },
    disclaimer: { type: DataTypes.TEXT },
    rawAiResponse: { type: DataTypes.JSON } // Full prompt response for debugging
}, { tableName: 'ai_consultation_results', timestamps: true });

// 4. AI Suggested Entities (Specialties, Facilities, Doctors)
const AISuggestedSpecialty = sequelize.define('AISuggestedSpecialty', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    aiSessionId: { type: DataTypes.INTEGER },
    specialtyId: { type: DataTypes.INTEGER },
    specialtyName: { type: DataTypes.STRING },
    rank: { type: DataTypes.INTEGER },
    confidenceScore: { type: DataTypes.FLOAT },
    reason: { type: DataTypes.TEXT }
}, { tableName: 'ai_suggested_specialties', timestamps: false });

const AISuggestedDoctor = sequelize.define('AISuggestedDoctor', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    aiSessionId: { type: DataTypes.INTEGER },
    doctorId: { type: DataTypes.INTEGER },
    doctorName: { type: DataTypes.STRING },
    facilityId: { type: DataTypes.INTEGER },
    rank: { type: DataTypes.INTEGER },
    reason: { type: DataTypes.TEXT }
}, { tableName: 'ai_suggested_doctors', timestamps: false });

// 5. AI Reconciliation (Doctor Validation)
const AIReconciliation = sequelize.define('AIReconciliation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    aiSessionId: { type: DataTypes.INTEGER, unique: true },
    appointmentId: { type: DataTypes.INTEGER },
    doctorId: { type: DataTypes.INTEGER }, // Doctor who reviewed
    facilityId: { type: DataTypes.INTEGER },
    reconciliationResult: { 
        type: DataTypes.ENUM('MATCH_EXACT', 'MATCH_PARTIAL', 'MISMATCH', 'INSUFFICIENT_DATA', 'DOCTOR_OVERRIDE'),
        defaultValue: 'MATCH_EXACT'
    },
    doctorSymptomsObserved: { type: DataTypes.TEXT },
    preliminaryDiagnosis: { type: DataTypes.TEXT },
    doctorFinalConclusion: { type: DataTypes.TEXT },
    doctorDiagnosisSummary: { type: DataTypes.TEXT },
    doctorSpecialtyId: { type: DataTypes.INTEGER },
    testOrders: { type: DataTypes.TEXT }, // Chỉ định cận lâm sàng
    priorityLevelActual: { type: DataTypes.ENUM('NORMAL', 'PRIORITY', 'URGENT') },
    isAiSuggestionUseful: { type: DataTypes.BOOLEAN, defaultValue: true },
    inputToMedicalRecord: { type: DataTypes.BOOLEAN, defaultValue: false },
    doctorNote: { type: DataTypes.TEXT },
    trainingCandidate: { type: DataTypes.BOOLEAN, defaultValue: true },
    trainingStatus: { 
        type: DataTypes.ENUM('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EXPORTED'),
        defaultValue: 'PENDING_REVIEW'
    }
}, { tableName: 'ai_reconciliations', timestamps: true });

module.exports = {
    AIConsultationSession,
    AIConsultationInput,
    AIConsultationResult,
    AISuggestedSpecialty,
    AISuggestedDoctor,
    AIReconciliation
};
