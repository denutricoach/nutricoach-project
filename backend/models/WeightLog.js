const mongoose = require('mongoose');

// Dit is de blauwdruk voor een enkele gewichtsmeting.
const weightLogSchema = new mongoose.Schema({
  // 'ref: User' is de magische link. Het vertelt de database dat dit ID
  // verwijst naar een document in de 'User' collectie.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gewicht: {
    type: Number,
    required: true
  },
  datum: {
    type: Date,
    default: Date.now
  }
});

const WeightLog = mongoose.model('WeightLog', weightLogSchema);

module.exports = WeightLog;
