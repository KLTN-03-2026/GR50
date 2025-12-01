const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, appointmentController.create);
router.get('/my', authMiddleware, appointmentController.getMyAppointments);
router.put('/:id/status', authMiddleware, appointmentController.updateStatus);
router.put('/:id/diagnosis', authMiddleware, appointmentController.updateDiagnosis);

module.exports = router;
