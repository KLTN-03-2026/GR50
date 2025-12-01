const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const conversationController = require('../controllers/conversationController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/upload-image', authMiddleware, conversationController.uploadImage);
router.get('/:appointmentId', authMiddleware, chatController.getMessagesByAppointment);
router.post('/send', authMiddleware, chatController.sendMessageByAppointment);

module.exports = router;
