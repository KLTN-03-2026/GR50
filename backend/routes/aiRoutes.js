const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateChatSession } = require('../validations/aiChat.validation');

// ─── Routes cũ (giữ nguyên) ──────────────────────────────────────────────────
router.post('/chat', aiController.chat);          // public — không cần login
router.post('/analyze', aiController.analyzeSymptoms); // public
router.get('/diagnoses', authMiddleware, aiController.getDiagnoses);
router.put('/diagnoses/:id/assign', authMiddleware, aiController.assignDoctor);
router.put('/diagnoses/:id/accept', authMiddleware, aiController.acceptDiagnosis);
router.put('/diagnoses/:id/reject', authMiddleware, aiController.rejectDiagnosis);

// ─── Routes mới: AI Chat Session (PB12 / PB13) ───────────────────────────────
router.post('/chat-session', authMiddleware, validateChatSession, aiController.chatSession);
router.get('/sessions', authMiddleware, aiController.getSessions);
router.get('/sessions/:id', authMiddleware, aiController.getSessionDetail);
router.delete('/sessions/:id', authMiddleware, aiController.deleteSession);

module.exports = router;
