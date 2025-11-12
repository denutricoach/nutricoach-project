const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { // Een unieke ID voor het gesprek (bv. "coachId_userId")
    type: String,
    required: true,
    index: true // Maakt het opzoeken van gesprekken sneller
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel' // Verwijst dynamisch naar User of Coach
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Coach'] // De afzender kan een User of een Coach zijn
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverModel'
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['User', 'Coach']
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: { // Om later 'gelezen' status te kunnen toevoegen
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Message', messageSchema);
