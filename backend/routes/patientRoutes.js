const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');

const { isPatient, isMedicalStaff } = require('../middleware/roleMiddleware');

router.get('/available', authMiddleware, isMedicalStaff, patientController.getAllPatients);
router.get('/dashboard-stats', authMiddleware, isPatient, patientController.getDashboardStats);
router.get('/profile', authMiddleware, isPatient, patientController.getProfile);
router.put('/profile', authMiddleware, isPatient, patientController.updateProfile);

module.exports = router;
