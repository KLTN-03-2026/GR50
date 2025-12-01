const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if user is admin
const adminCheck = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ detail: 'Access denied. Admin only.' });
    }
};

router.get('/stats', authMiddleware, adminCheck, adminController.getStats);
router.get('/payments', authMiddleware, adminCheck, adminController.getPayments);
router.get('/doctors', authMiddleware, adminCheck, adminController.getDoctors);
router.get('/patients', authMiddleware, adminCheck, adminController.getPatients);
router.put('/doctors/:id/approve', authMiddleware, adminCheck, adminController.approveDoctor);
router.delete('/delete-user/:id', authMiddleware, adminCheck, adminController.deleteUser);
router.get('/admins', authMiddleware, adminCheck, adminController.getAdmins);
router.post('/create-admin', authMiddleware, adminCheck, adminController.createAdmin);
router.delete('/delete-admin/:id', authMiddleware, adminCheck, adminController.deleteAdmin);
router.put('/update-permissions', authMiddleware, adminCheck, adminController.updatePermissions);

module.exports = router;
