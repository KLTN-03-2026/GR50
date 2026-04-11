const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, notificationController.getMyNotifications);
router.post('/mark-read/:id', authMiddleware, notificationController.markAsRead);
router.post('/mock', authMiddleware, notificationController.createMockNotification);

module.exports = router;
