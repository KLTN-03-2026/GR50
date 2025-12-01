const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const upload = require('../middleware/upload');

router.put('/update', authMiddleware, userController.updateProfile);
router.post('/change-password', authMiddleware, userController.changePassword);
router.post('/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
