const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

const { isPatient, isDoctor, isMedicalStaff } = require('../middleware/roleMiddleware');

router.get('/slots', appointmentController.getAvailableSlots);
router.post('/guest', appointmentController.createGuestAppointment);
router.post('/guest/verify', appointmentController.verifyGuestBooking);
router.post('/', authMiddleware, isPatient, appointmentController.create);
router.get('/my', authMiddleware, appointmentController.getMyAppointments); // Handles role internally
router.put('/my/:id/cancel', authMiddleware, isPatient, appointmentController.cancelAppointment);
router.post('/:id/accept-policy', authMiddleware, isPatient, appointmentController.acceptPaymentPolicy);
router.put('/:id/status', authMiddleware, isMedicalStaff, appointmentController.updateStatus);
router.put('/:id/mark-no-show', authMiddleware, isMedicalStaff, appointmentController.markNoShow);
router.put('/:id/complete', authMiddleware, isDoctor, appointmentController.completeExam);
router.delete('/:id/hide', authMiddleware, isDoctor, appointmentController.hideAppointment);
router.put('/:id/diagnosis', authMiddleware, isDoctor, appointmentController.updateDiagnosis);

module.exports = router;
