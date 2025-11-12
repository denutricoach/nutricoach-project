const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  naam: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  registratieDatum: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coach', coachSchema);
