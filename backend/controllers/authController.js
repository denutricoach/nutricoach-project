const User = require('../models/User');
const Coach = require('../models/Coach');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');
const passport = require('passport');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// --- HULPFUNCTIES ---
const generateToken = (id, role) => {
  return jwt.sign({ user: { id, role } }, JWT_SECRET, { expiresIn: '7d' });
};

// --- AUTHENTICATIE LOGICA ---

// Registratie (met E-mailverificatie)
exports.registerUser = async (req, res) => {
  try {
    const { email, password, intakeData } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Een gebruiker met dit e-mailadres bestaat al.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Genereer verificatietoken
    const verificationToken = crypto.randomBytes(20).toString('hex');

    user = new User({ 
      email, 
      password: hashedPassword, 
      ...intakeData,
      emailVerificatieToken: verificationToken,
      emailGeverifieerd: false // Standaard op false
    });

    await user.save();

    // Verzend verificatie-e-mail (asynchroon)
    const verificationLink = `${CLIENT_URL}/verify-email/${verificationToken}`;
    const emailHtml = `
      <h1>Welkom bij NutriCoach!</h1>
      <p>Bedankt voor uw registratie. Klik op de onderstaande link om uw e-mailadres te verifiëren:</p>
      <a href="${verificationLink}">E-mailadres verifiëren</a>
      <p>Als u zich niet heeft geregistreerd, kunt u deze e-mail negeren.</p>
    `;
    sendEmail(email, 'Verifieer uw NutriCoach E-mailadres', emailHtml);

    // Geef token terug, maar de gebruiker moet nog verifiëren
    const token = generateToken(user.id, 'user');
    res.status(201).json({ 
      token, 
      userId: user.id, 
      message: 'Registratie succesvol. Controleer uw e-mail om uw account te verifiëren.' 
    });

  } catch (error) {
    console.error('Registratiefout:', error);
    res.status(500).json({ message: 'Serverfout bij registratie.' });
  }
};

// E-mailverificatie
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ emailVerificatieToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Ongeldige of verlopen verificatielink.' });
    }

    user.emailGeverifieerd = true;
    user.emailVerificatieToken = undefined; // Token verwijderen na gebruik
    await user.save();

    res.json({ message: 'E-mailadres succesvol geverifieerd. U kunt nu inloggen.' });
  } catch (error) {
    console.error('Verificatiefout:', error);
    res.status(500).json({ message: 'Serverfout bij e-mailverificatie.' });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let account = await User.findOne({ email });
    let role = 'user';

    if (!account) {
      account = await Coach.findOne({ email });
      role = 'coach';
    }

    if (!account) {
      return res.status(400).json({ message: 'Ongeldige inloggegevens.' });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Ongeldige inloggegevens.' });
    }
    
    // Check voor User of e-mail geverifieerd is
    if (role === 'user' && !account.emailGeverifieerd) {
        return res.status(403).json({ message: 'Uw e-mailadres is nog niet geverifieerd. Controleer uw inbox.' });
    }

    const token = generateToken(account.id, role);
    res.json({ token, role });

  } catch (error) {
    console.error('Inlogfout:', error);
    res.status(500).json({ message: 'Serverfout bij inloggen.' });
  }
};

// Gebruiker ophalen (voor refresh)
exports.getMe = async (req, res) => {
  try {
    // req.user is al ingesteld door de auth middleware
    const user = req.user;
    const isCoach = req.isCoach;
    res.json({ user, role: isCoach ? 'coach' : 'user' });
  } catch (error) {
    res.status(500).json({ message: 'Kon gebruiker niet ophalen.' });
  }
};

// --- WACHTWOORD VERGETEN LOGICA ---

// Wachtwoord reset aanvragen
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Stuur altijd een succesbericht, zelfs als de gebruiker niet bestaat, om enumeratie te voorkomen
      return res.json({ message: 'Als het e-mailadres bij ons bekend is, ontvangt u een link om uw wachtwoord opnieuw in te stellen.' });
    }

    // Genereer reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.wachtwoordResetToken = resetToken;
    user.wachtwoordResetExpires = Date.now() + 3600000; // 1 uur
    await user.save();

    // Verzend reset e-mail
    const resetLink = `${CLIENT_URL}/reset-password/${resetToken}`;
    const emailHtml = `
      <h1>Wachtwoord opnieuw instellen</h1>
      <p>U heeft gevraagd om uw wachtwoord opnieuw in te stellen. Klik op de onderstaande link om dit te doen:</p>
      <a href="${resetLink}">Wachtwoord opnieuw instellen</a>
      <p>Deze link is 1 uur geldig. Als u dit niet heeft aangevraagd, kunt u deze e-mail negeren.</p>
    `;
    sendEmail(email, 'Wachtwoord opnieuw instellen voor NutriCoach', emailHtml);

    res.json({ message: 'Als het e-mailadres bij ons bekend is, ontvangt u een link om uw wachtwoord opnieuw in te stellen.' });

  } catch (error) {
    console.error('Wachtwoord vergeten fout:', error);
    res.status(500).json({ message: 'Serverfout bij het aanvragen van wachtwoordherstel.' });
  }
};

// Wachtwoord resetten
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      wachtwoordResetToken: token,
      wachtwoordResetExpires: { $gt: Date.now() } // Token is nog geldig
    });

    if (!user) {
      return res.status(400).json({ message: 'Ongeldige of verlopen wachtwoord reset link.' });
    }

    // Nieuw wachtwoord hashen en opslaan
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.wachtwoordResetToken = undefined;
    user.wachtwoordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Wachtwoord succesvol opnieuw ingesteld.' });

  } catch (error) {
    console.error('Wachtwoord reset fout:', error);
    res.status(500).json({ message: 'Serverfout bij het resetten van het wachtwoord.' });
  }
};

// --- GOOGLE OAUTH LOGICA ---

// Start Google OAuth flow
exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// Google OAuth callback
exports.googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { failureRedirect: `${CLIENT_URL}/login` }, (err, user, info) => {
    if (err) {
      console.error('Google Auth Fout:', err);
      return res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
    }
    if (!user) {
      return res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
    }

    // Genereer JWT token voor de gebruiker
    const token = generateToken(user.id, 'user');
    
    // Stuur de token terug naar de frontend via een query parameter
    res.redirect(`${CLIENT_URL}/login?token=${token}`);

  })(req, res, next);
};
