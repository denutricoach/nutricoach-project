// backend/models/ProgressPhoto.js

const mongoose = require('mongoose');

const progressPhotoSchema = new mongoose.Schema({
  // De URL van de afbeelding zoals die in Cloudinary is opgeslagen.
  // Dit is de belangrijkste informatie.
  imageUrl: {
    type: String,
    required: true,
  },

  // Een unieke ID die we van Cloudinary krijgen, handig als we de foto later willen verwijderen.
  publicId: {
    type: String,
    required: true,
  },

  // Een koppeling naar de gebruiker aan wie deze foto toebehoort.
  // Dit zorgt ervoor dat we de foto's van de juiste gebruiker kunnen ophalen.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Verwijst naar ons 'User' model
    required: true,
  },

  // Een optionele notitie die de gebruiker kan toevoegen, bv. "Week 1 - Vooraanzicht".
  caption: {
    type: String,
    default: '',
  },

  // De datum waarop de foto is geüpload.
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ProgressPhoto', progressPhotoSchema);
