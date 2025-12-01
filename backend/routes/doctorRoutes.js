const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', doctorController.getAll);
router.get('/available', doctorController.getAll);
router.get('/department-heads', authMiddleware, doctorController.getDepartmentHeads);
router.put('/profile', authMiddleware, doctorController.updateProfile);
router.put('/schedule', authMiddleware, doctorController.updateSchedule);
router.get('/:id', doctorController.getProfile);
router.post('/:id/reviews', authMiddleware, doctorController.addReview);
router.put('/:id/reviews', authMiddleware, doctorController.updateReview);
router.get('/:id/review', authMiddleware, doctorController.getReviewByPatient);

module.exports = router;
