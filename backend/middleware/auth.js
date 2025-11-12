const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Coach = require('../models/Coach');
require('dotenv').config();

const auth = async (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'Geen token, autorisatie geweigerd' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Zoek in beide collecties (User en Coach)
    let user = await User.findById(decoded.user.id).select('-password');
    let isCoach = false;

    if (!user) {
      user = await Coach.findById(decoded.user.id).select('-password');
      isCoach = true;
    }

    if (!user) {
      return res.status(401).json({ message: 'Token is niet geldig, gebruiker niet gevonden.' });
    }

    req.user = user;
    req.isCoach = isCoach;
    req.token = token;
    next();
  } catch (err) {
    // Dit vangt fouten op zoals 'jwt expired'
    res.status(401).json({ message: 'Token is niet geldig of verlopen.' });
  }
};

module.exports = auth;
