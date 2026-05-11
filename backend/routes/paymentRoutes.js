const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Patient routes
router.get('/my', authMiddleware, paymentController.getMyPayments);
router.get('/:id', authMiddleware, paymentController.getPaymentById);
router.post('/appointments/:appointmentId/initiate', authMiddleware, paymentController.createPaymentRequest);

// Staff routes
router.post('/appointments/:appointmentId/counter', authMiddleware, roleMiddleware.isMedicalStaff, paymentController.confirmCounterPayment);

// Public Webhook routes
router.post('/webhooks/:provider', paymentController.handlePaymentWebhook);

module.exports = router;
