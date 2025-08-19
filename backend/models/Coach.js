// backend/models/Coach.js
const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'coach'
  }
});

module.exports = mongoose.model('Coach', coachSchema);
