const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', clinicController.getAll);
router.get('/:id', clinicController.getById);

// Protected routes
router.post('/', authMiddleware, clinicController.create);
router.put('/:id', authMiddleware, clinicController.update);
router.delete('/:id', authMiddleware, clinicController.delete);

module.exports = router;
