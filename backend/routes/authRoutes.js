const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Registreer gebruiker (met e-mailverificatie)
// @access  Public
router.post('/register', authController.registerUser);

// @route   GET /api/auth/verify-email/:token
// @desc    Verifieer e-mailadres
// @access  Public
router.get('/verify-email/:token', authController.verifyEmail);

// @route   POST /api/auth/login
// @desc    Login gebruiker/coach
// @access  Public
router.post('/login', authController.loginUser);

// @route   GET /api/auth/me
// @desc    Haal ingelogde gebruiker/coach op (voor refresh)
// @access  Private
router.get('/me', auth, authController.getMe);

// @route   POST /api/auth/forgot-password
// @desc    Vraag wachtwoord reset aan
// @access  Public
router.post('/forgot-password', authController.forgotPassword);

// @route   POST /api/auth/reset-password/:token
// @desc    Stel nieuw wachtwoord in
// @access  Public
router.post('/reset-password/:token', authController.resetPassword);

// --- SOCIAL LOGIN (GOOGLE) ---

// @route   GET /api/auth/google
// @desc    Start Google OAuth flow
// @access  Public
router.get('/google', authController.googleAuth);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', authController.googleAuthCallback);

module.exports = router;
