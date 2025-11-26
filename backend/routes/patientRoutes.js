const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/available', authMiddleware, patientController.getAllPatients);

module.exports = router;
