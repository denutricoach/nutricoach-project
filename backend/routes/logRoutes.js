const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const logController = require('../controllers/logController');

// @route   POST /api/logs/weight
// @desc    Log gewicht
// @access  Private
router.post('/weight', auth, logController.logWeight);

// @route   GET /api/logs/weight
// @desc    Haal gewichtslogs op
// @access  Private
router.get('/weight', auth, logController.getWeightLogs);

// @route   POST /api/logs/food
// @desc    Log voeding en ontvang AI-analyse
// @access  Private
router.post('/food', auth, logController.logFood);

// @route   GET /api/logs/food
// @desc    Haal voedingslogs op
// @access  Private
router.get('/food', auth, logController.getFoodLogs);

module.exports = router;
