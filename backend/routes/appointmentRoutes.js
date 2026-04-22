const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

const { isPatient, isDoctor, isMedicalStaff } = require('../middleware/roleMiddleware');

router.get('/slots', appointmentController.getAvailableSlots);
router.post('/', authMiddleware, isPatient, appointmentController.create);
router.get('/my', authMiddleware, appointmentController.getMyAppointments); // Handles role internally
router.put('/my/:id/cancel', authMiddleware, isPatient, appointmentController.cancelAppointment);
router.put('/:id/status', authMiddleware, isMedicalStaff, appointmentController.updateStatus);
router.put('/:id/complete', authMiddleware, isDoctor, appointmentController.completeExam);
router.put('/:id/diagnosis', authMiddleware, isDoctor, appointmentController.updateDiagnosis);

module.exports = router;
