const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// @route   POST /api/chat
// @desc    Stuur een bericht naar de AI coach
// @access  Private
router.post('/', auth, chatController.handleChat);

// @route   GET /api/chat/history
// @desc    Haal de chatgeschiedenis op
// @access  Private
router.get('/history', auth, chatController.getChatHistory);

module.exports = router;
