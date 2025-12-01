const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if user is admin
const adminCheck = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ detail: 'Access denied. Admin only.' });
    }
};

router.get('/', authMiddleware, adminCheck, systemController.getSettings);
router.put('/', authMiddleware, adminCheck, systemController.updateSettings);
router.get('/public', systemController.getPublicSettings);

module.exports = router;
