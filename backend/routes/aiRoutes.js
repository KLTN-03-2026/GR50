const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateChatSession } = require('../validations/aiChat.validation');

// ─── Routes cũ (giữ nguyên) ──────────────────────────────────────────────────
router.post('/chat', aiController.chat);          // public — không cần login
router.post('/analyze', aiController.analyzeSymptoms); // public
const { isAdmin, isMedicalStaff, isPatient } = require('../middleware/roleMiddleware');

// ─── Global AI Diagnosis Management (Admins/Doctors) ────────────────────────
router.get('/diagnoses', authMiddleware, isAdmin, aiController.getDiagnoses);
router.put('/diagnoses/:id/assign', authMiddleware, isAdmin, aiController.assignDoctor);
router.put('/diagnoses/:id/accept', authMiddleware, isMedicalStaff, aiController.acceptDiagnosis);
router.put('/diagnoses/:id/reject', authMiddleware, isMedicalStaff, aiController.rejectDiagnosis);

// ─── Patient AI Consultation Sessions ───────────────────────────────────────
router.post('/chat-session', authMiddleware, isPatient, validateChatSession, aiController.chatSession);
router.get('/sessions', authMiddleware, isPatient, aiController.getSessions);
router.get('/sessions/:id', authMiddleware, isPatient, aiController.getSessionDetail);
router.delete('/sessions/:id', authMiddleware, isPatient, aiController.deleteSession);

module.exports = router;
