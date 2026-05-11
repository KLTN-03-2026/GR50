const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');

const { isDoctor, isAdmin, isMedicalStaff } = require('../middleware/roleMiddleware');

router.get('/', doctorController.getAll);
router.get('/available', doctorController.getAll);
router.get('/staff-members', authMiddleware, isMedicalStaff, doctorController.getStaffMembers);
router.get('/my-service-settings', authMiddleware, isDoctor, doctorController.getServiceSettings);
router.put('/my-service-settings', authMiddleware, isDoctor, doctorController.updateServiceSettings);
router.put('/profile', authMiddleware, isDoctor, doctorController.updateProfile);
router.get('/my-schedules', authMiddleware, isDoctor, doctorController.getSchedules);
router.post('/online-slots', authMiddleware, isDoctor, doctorController.createOnlineSlot);
router.put('/online-slots/bulk', authMiddleware, isDoctor, doctorController.bulkUpdateOnlineSlots);
router.delete('/online-slots/:id', authMiddleware, isDoctor, doctorController.deleteOnlineSlot);
router.put('/schedule', authMiddleware, isDoctor, doctorController.getSchedules); // Legacy compatibility if needed, though getSchedules is GET
router.get('/profile/me', authMiddleware, isDoctor, doctorController.getMyProfile);
router.get('/ai-diagnoses', authMiddleware, isDoctor, doctorController.getAIDiagnoses);
router.get('/:id', doctorController.getProfile);
router.post('/:id/reviews', authMiddleware, doctorController.addReview);
router.put('/:id/reviews', authMiddleware, doctorController.updateReview);
router.get('/:id/review', authMiddleware, doctorController.getReviewByPatient);

router.put('/operational-status', authMiddleware, doctorController.updateOperationalStatus);

module.exports = router;
