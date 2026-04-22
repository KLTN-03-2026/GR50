const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:appointmentId', authMiddleware, chatController.getMessagesByAppointment);
router.post('/send', authMiddleware, chatController.sendMessageByAppointment);
router.put('/read/:appointmentId', authMiddleware, chatController.markAsRead);

module.exports = router;
