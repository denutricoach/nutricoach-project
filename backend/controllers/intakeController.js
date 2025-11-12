const User = require('../models/User');

exports.updateIntake = async (req, res) => {
  try {
    const userId = req.user.id;
    const intakeData = req.body;

    // Update de User met de intake data
    // Oplossing voor INTAKE FORMULIER BUG (Punt #1): De frontend moet nu alleen de data voor de huidige stap sturen.
    // De backend update de gebruiker met de ontvangen data.
    const updatedUser = await User.findByIdAndUpdate(userId, intakeData, { new: true });

    res.json(updatedUser);
  } catch (error) {
    console.error('Intake fout:', error);
    res.status(500).json({ message: 'Intake opslaan mislukt.' });
  }
};
