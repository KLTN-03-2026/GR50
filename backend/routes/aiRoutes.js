const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/chat', authMiddleware, aiController.chat);
router.post('/analyze', authMiddleware, aiController.analyzeSymptoms);
router.get('/diagnoses', authMiddleware, aiController.getDiagnoses);
router.put('/diagnoses/:id/assign', authMiddleware, aiController.assignDoctor);
router.put('/diagnoses/:id/accept', authMiddleware, aiController.acceptDiagnosis);
router.put('/diagnoses/:id/reject', authMiddleware, aiController.rejectDiagnosis);

module.exports = router;
