const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const authMiddleware = require('../middleware/authMiddleware');

// Get user's conversations
router.get('/', authMiddleware, conversationController.getMyConversations);

// Create or get conversation for an appointment
router.post('/appointments/:appointmentId/conversation', authMiddleware, conversationController.getOrCreateAppointmentConversation);

// Create support conversation
router.post('/support/conversation', authMiddleware, conversationController.createSupportConversation);

// Get conversation details
router.get('/:id', authMiddleware, conversationController.getConversationDetails);

// Message routes
router.get('/:id/messages', authMiddleware, conversationController.getMessages);
router.post('/:id/messages', authMiddleware, conversationController.sendMessage);
router.patch('/:id/read', authMiddleware, conversationController.markAsRead);

// Call routes
router.post('/:id/calls', authMiddleware, conversationController.startCall);

module.exports = router;
