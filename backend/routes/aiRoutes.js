const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const aiIntelligenceController = require('../controllers/aiIntelligenceController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateChatSession } = require('../validations/aiChat.validation');

// ─── Public AI Chat (PB 1.0) ──────────────────────────────────────────────────
router.post('/chat', aiController.chat);          
router.post('/analyze', aiController.analyzeSymptoms); 

const { isAdmin, isMedicalStaff, isPatient } = require('../middleware/roleMiddleware');

// ─── AI Intelligence Dashboard PB 2.0 (Admins/Staff/Doctors) ────────────────────────
// This endpoint replaces the old getDiagnoses with optimized database-backed retrieval
router.get('/recent-diagnoses', authMiddleware, aiIntelligenceController.getRecentConsultations);
router.post('/sessions/:aiSessionId/reconcile', authMiddleware, isMedicalStaff, aiIntelligenceController.reconcile);
router.post('/sessions/:aiSessionId/approve', authMiddleware, isAdmin, aiIntelligenceController.approve);

// ─── Patient AI Consultation PB 2.0 ───────────────────────────
router.post('/suggest', authMiddleware, isPatient, aiIntelligenceController.submitConsultation);
router.get('/history', authMiddleware, isPatient, aiIntelligenceController.getRecentConsultations); // Shared logic

// ─── AI Chat Session (PB12 / PB13) ───────────────────────────────────────────
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware');
router.post('/chat-session', optionalAuthMiddleware, validateChatSession, aiController.chatSession);
router.get('/sessions', authMiddleware, aiController.getSessions);
router.get('/sessions/:id', authMiddleware, aiController.getSessionDetail);
router.delete('/sessions/:id', authMiddleware, aiController.deleteSession);

module.exports = router;
