const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/facebook-login', authController.facebookLogin);
router.get('/me', authMiddleware, authController.getMe);
router.post('/forgot-password', (req, res) => res.json({ message: "If email exists, reset link will be sent" }));
router.post('/force-change-password', authMiddleware, authController.forceChangePassword);


module.exports = router;
