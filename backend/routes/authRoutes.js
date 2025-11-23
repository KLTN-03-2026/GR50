const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);
// Forgot password placeholder
router.post('/forgot-password', (req, res) => res.json({ message: "If email exists, reset link will be sent" }));

module.exports = router;
