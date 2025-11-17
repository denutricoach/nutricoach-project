// backend/seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Coach = require('./models/Coach'); // Zorg dat het pad naar je Coach model klopt

// Laad omgevingsvariabelen
dotenv.config();

const seedCoach = async () => {
  try {
    // Verbind met de database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB verbonden voor seeding...');

    // Controleer of de coach al bestaat
    const coachExists = await Coach.findOne({ email: 'judith@nutricoach.ai' });
    if (coachExists) {
      console.log('Coach Judith bestaat al. Seeding wordt overgeslagen.');
      mongoose.connection.close();
      return;
    }

    // Hash het wachtwoord
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('VeiligWachtwoord123!', salt);

    // Maak de nieuwe coach aan
    const newCoach = new Coach({
      naam: 'Judith de Coach',
      email: 'judith@nutricoach.ai',
      password: hashedPassword,
    });

    await newCoach.save();
    console.log('Coach Judith succesvol aangemaakt!');

  } catch (error) {
    console.error('Fout tijdens het seeden:', error.message);
  } finally {
    // Sluit de databaseverbinding
    mongoose.connection.close();
    console.log('Databaseverbinding gesloten.');
  }
};

// Voer de functie uit
seedCoach();
