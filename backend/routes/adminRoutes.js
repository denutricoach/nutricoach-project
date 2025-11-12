const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// @route   GET /api/admin/users
// @desc    Haal alle gebruikers op (alleen voor coach)
// @access  Private (Coach Only)
router.get('/users', auth, adminController.getUsers);

// @route   GET /api/admin/user/:id
// @desc    Haal details van een specifieke gebruiker op (alleen voor coach)
// @access  Private (Coach Only)
router.get('/user/:id', auth, adminController.getUserDetails);

// @route   GET /api/admin/foodlogs/:userId
// @desc    Haal voedingslogs van een specifieke gebruiker op (alleen voor coach)
// @access  Private (Coach Only)
router.get('/foodlogs/:userId', auth, adminController.getFoodLogs);

// @route   POST /api/admin/ask-ai
// @desc    Stel een vraag aan de AI over een gebruiker (alleen voor coach)
// @access  Private (Coach Only)
router.post('/ask-ai', auth, adminController.askAI);

module.exports = router;
