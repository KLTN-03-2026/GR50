const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const { isAdmin, isSuperAdmin } = require('../middleware/roleMiddleware');

router.get('/stats', authMiddleware, isAdmin, adminController.getStats);
router.get('/detailed-stats', authMiddleware, isAdmin, adminController.getDetailedStats);
router.get('/appointments/all', authMiddleware, isAdmin, adminController.getAllAppointments);
router.get('/payments', authMiddleware, isAdmin, adminController.getPayments);


router.get('/reports', authMiddleware, isAdmin, adminController.getReports);
router.get('/doctors', authMiddleware, isAdmin, adminController.getDoctors);
router.get('/staffs', authMiddleware, isAdmin, adminController.getStaffs);
router.get('/patients', authMiddleware, isAdmin, adminController.getPatients);
router.put('/doctors/:id/approve', authMiddleware, isAdmin, adminController.approveDoctor);
router.delete('/delete-user/:id', authMiddleware, isAdmin, adminController.deleteUser);
router.get('/admins', authMiddleware, isAdmin, adminController.getAdmins);
router.post('/create-user', authMiddleware, isAdmin, adminController.createUser);
router.post('/create-admin', authMiddleware, isSuperAdmin, adminController.createAdmin);
router.delete('/delete-admin/:id', authMiddleware, isSuperAdmin, adminController.deleteAdmin);
router.get('/ai-diagnoses', authMiddleware, isAdmin, adminController.getAIDiagnoses);
router.put('/update-permissions', authMiddleware, isSuperAdmin, adminController.updatePermissions);

module.exports = router;
