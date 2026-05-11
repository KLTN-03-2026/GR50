const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin, isMedicalStaff } = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, queueController.getQueue);
router.post('/:id/push-next', authMiddleware, isMedicalStaff, queueController.pushNext);

module.exports = router;
