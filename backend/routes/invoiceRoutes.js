const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// All routes here should be protected based on requirements, but for now we define the basic route
router.put('/:id/medicine-choice', invoiceController.updateMedicineChoice);

module.exports = router;
