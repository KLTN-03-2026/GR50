const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const authMiddleware = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/medical_records';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const { isPatient, isDoctor, isStaff, isMedicalStaff } = require('../middleware/roleMiddleware');

router.get('/patient', authMiddleware, isPatient, medicalRecordController.getPatientRecords);
router.get('/doctor', authMiddleware, isDoctor, medicalRecordController.getDoctorRecords);
router.get('/:id', authMiddleware, medicalRecordController.getRecordDetail);
router.post('/', authMiddleware, isDoctor, upload.single('file'), medicalRecordController.createRecord);

router.post('/:id/follow-up', authMiddleware, isDoctor, medicalRecordController.createFollowUpAppointment);

module.exports = router;
