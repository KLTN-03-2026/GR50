const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authMiddleware = require('../middleware/authMiddleware');
const { isStaff } = require('../middleware/roleMiddleware');

// All staff routes require authentication and staff role
router.use(authMiddleware);
router.use(isStaff);

// STAFF-01: Dashboard
router.get('/dashboard-stats', staffController.getDashboardStats);

// STAFF-02: Patient Reception
router.get('/patients/search', staffController.searchPatients);
router.post('/patients', staffController.createPatientAccount);
router.get('/patients/:id', staffController.getPatientById);

// STAFF-03 & STAFF-04: Appointment Management & Coordination
router.get('/appointments', staffController.getAppointments);
router.post('/appointments', staffController.createAppointment);
router.post('/appointments/:id/check-in', staffController.checkInAppointment);
router.patch('/appointments/:id/status', staffController.updateAppointmentStatus);

router.get('/doctors-coord', staffController.getDoctorsForCoordination);

// STAFF-06: Online Support
router.get('/video-meeting/:id', staffController.getVideoMeetingStatus);

// STAFF-08: AI Triage Queue
router.get('/triage-queue', staffController.getTriageQueue);
router.post('/triage/assign-doctor', staffController.assignDoctorToTriage);

// STAFF-09: Payment Support
router.get('/invoices', staffController.getInvoices);
router.put('/invoices/:id/pay', staffController.payInvoice);

// STAFF-10: Update Patient Info
router.put('/patients/:id', staffController.updatePatientInfo);

// STAFF-11: Live Support & Video Monitor
router.get('/online-consultations', staffController.getOnlineConsultations);
router.get('/support-conversations', staffController.getSupportConversations);

module.exports = router;
