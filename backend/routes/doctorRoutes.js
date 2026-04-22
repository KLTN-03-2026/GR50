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
router.put('/schedule', authMiddleware, isDoctor, doctorController.updateSchedule);
router.get('/profile/me', authMiddleware, isDoctor, doctorController.getMyProfile);
router.get('/ai-diagnoses', authMiddleware, isDoctor, doctorController.getAIDiagnoses);
router.get('/:id', doctorController.getProfile);
router.post('/:id/reviews', authMiddleware, doctorController.addReview);
router.put('/:id/reviews', authMiddleware, doctorController.updateReview);
router.get('/:id/review', authMiddleware, doctorController.getReviewByPatient);

module.exports = router;
