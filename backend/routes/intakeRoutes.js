const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const intakeController = require('../controllers/intakeController');

// @route   POST /api/intake
// @desc    Update de intakegegevens van de gebruiker
// @access  Private
router.post('/', auth, intakeController.updateIntake);

module.exports = router;
