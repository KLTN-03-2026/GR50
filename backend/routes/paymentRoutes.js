const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/my', authMiddleware, paymentController.getMyPayments);
router.get('/:id', authMiddleware, paymentController.getPaymentById);
router.post('/create', authMiddleware, paymentController.createPayment);
router.post('/:id/process', authMiddleware, paymentController.processPayment);

module.exports = router;
