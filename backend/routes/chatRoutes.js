const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/upload-image', authMiddleware, conversationController.uploadImage);

module.exports = router;
