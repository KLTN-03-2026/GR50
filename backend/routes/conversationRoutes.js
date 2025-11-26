const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, conversationController.create);
router.get('/my', authMiddleware, conversationController.getMyConversations);
router.get('/:id/messages', authMiddleware, conversationController.getMessages);
router.post('/:id/send', authMiddleware, conversationController.sendMessage);

module.exports = router;
