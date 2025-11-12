const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');

// @route   GET /api/messages/:otherUserId
// @desc    Haal berichten op tussen twee gebruikers en markeer als gelezen
// @access  Private
router.get('/:otherUserId', auth, messageController.getMessages);

// @route   POST /api/messages
// @desc    Stuur een nieuw bericht
// @access  Private
router.post('/', auth, messageController.sendMessage);

// @route   GET /api/messages/unread-count/:otherUserId
// @desc    Tel ongelezen berichten
// @access  Private
router.get('/unread-count/:otherUserId', auth, messageController.getUnreadCount);

// @route   POST /api/messages/mark-as-read/:otherUserId
// @desc    Markeer berichten als gelezen
// @access  Private
router.post('/mark-as-read/:otherUserId', auth, messageController.markAsRead);

module.exports = router;
