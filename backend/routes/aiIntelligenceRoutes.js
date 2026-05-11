const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiIntelligenceController');
const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin, isDoctor } = require('../middleware/roleMiddleware');

// Patient Routes
router.post('/consultation', authMiddleware, aiController.submitConsultation);

// Internal Management Routes (Doctor, Staff, Admin)
router.get('/recent-diagnoses', authMiddleware, aiController.getRecentConsultations);
router.post('/sessions/:aiSessionId/reconcile', authMiddleware, isDoctor, aiController.reconcile);

module.exports = router;
