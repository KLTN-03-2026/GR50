const express = require('express');
const router = express.Router();
const specialtyController = require('../controllers/specialtyController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', specialtyController.getAll);
router.get('/:id', specialtyController.getById);
router.post('/', authMiddleware, specialtyController.create);

module.exports = router;
