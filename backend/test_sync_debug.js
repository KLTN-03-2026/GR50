const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const fs = require('fs');

// Import models manually to test them one by one
const User = require('./models/User');
const Specialty = require('./models/Specialty');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const AdminPermission = require('./models/AdminPermission');
const Payment = require('./models/Payment');
const Message = require('./models/Message');
const Review = require('./models/Review');
const MedicalRecord = require('./models/MedicalRecord');
const DoctorSchedule = require('./models/DoctorSchedule');
const Prescription = require('./models/Prescription');
const Consultation = require('./models/Consultation');
const AISession = require('./models/AISession');
const AIModerationContent = require('./models/AIModerationContent');

const models = {
    User, Specialty, Doctor, Patient, Appointment, AdminPermission, Payment, Message, Review, MedicalRecord, DoctorSchedule, Prescription, Consultation, AISession, AIModerationContent
};

async function testSync() {
    for (const modelName in models) {
        try {
            console.log(`Syncing ${modelName}...`);
            await models[modelName].sync({ alter: true });
            console.log(`Synced ${modelName} successfully.`);
        } catch (error) {
            console.error(`Error syncing ${modelName}:`, error.message);
            fs.writeFileSync('backend/sync_debug_error.txt', `Error syncing ${modelName}: ${error.message}`);
            return;
        }
    }
    console.log('All models synced successfully.');
}

testSync();
