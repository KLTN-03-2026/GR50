const express = require('express');
const router = express.Router();
const departmentHeadController = require('../controllers/departmentHeadController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if user is department head
const departmentHeadCheck = (req, res, next) => {
    if (req.user && (req.user.role === 'department_head' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ detail: 'Access denied. Department Head only.' });
    }
};

router.get('/stats', authMiddleware, departmentHeadCheck, departmentHeadController.getStats);
router.get('/patients', authMiddleware, departmentHeadCheck, departmentHeadController.getPatients);
router.get('/doctors', authMiddleware, departmentHeadCheck, departmentHeadController.getDoctors);
router.post('/create-user', authMiddleware, departmentHeadCheck, departmentHeadController.createUser);
router.put('/approve-doctor/:id', authMiddleware, departmentHeadCheck, departmentHeadController.approveDoctor);
router.delete('/remove-doctor/:id', authMiddleware, departmentHeadCheck, departmentHeadController.removeDoctor);
router.delete('/remove-patient/:id', authMiddleware, departmentHeadCheck, departmentHeadController.removePatient);



module.exports = router;
