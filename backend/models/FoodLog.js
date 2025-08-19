// backend/models/FoodLog.js

const mongoose = require('mongoose');

const foodLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  datum: {
    type: Date,
    default: Date.now
  },
  ontbijt: { type: String },
  lunch: { type: String },
  diner: { type: String },
  tussendoortjes: { type: String },

  // --- DE NIEUWE VELDEN VOOR DE AI-FEEDBACK ---
  feedbackStatus: {
    type: String, // Wordt 'perfect', 'te_veel', of 'te_weinig'
    enum: ['perfect', 'te_veel', 'te_weinig', 'error', null], // Beperk de mogelijke waarden
    default: null
  },
  feedbackMessage: {
    type: String, // De volledige boodschap van de AI
    default: ''
  }
});

module.exports = mongoose.model('FoodLog', foodLogSchema);
