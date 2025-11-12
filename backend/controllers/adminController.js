const User = require('../models/User');
const FoodLog = require('../models/FoodLog');
const WeightLog = require('../models/WeightLog');
const Message = require('../models/Message');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware om te controleren of de gebruiker een coach is
const isCoach = (req, res, next) => {
  if (!req.isCoach) {
    return res.status(403).json({ message: 'Toegang geweigerd. Alleen coaches.' });
  }
  next();
};

exports.getUsers = [isCoach, async (req, res) => {
  try {
    const coachId = req.user.id;
    let users = await User.find().lean();
    
    // Haal ongelezen berichten en laatste logstatus op
    const usersWithData = await Promise.all(users.map(async (user) => {
      const conversationId = [coachId.toString(), user._id.toString()].sort().join('_');
      const unreadCount = await Message.countDocuments({
        conversationId: conversationId,
        receiver: coachId,
        read: false
      });
      
      const lastLog = await FoodLog.findOne({ user: user._id }).sort({ datum: -1 });
      return {
        ...user,
        unreadCount: unreadCount,
        lastLogStatus: lastLog ? lastLog.feedbackStatus : null
      };
    }));
    res.json(usersWithData);
  } catch (error) {
    console.error('Fout bij ophalen gebruikers:', error);
    res.status(500).json({ message: 'Kon gebruikers niet ophalen.' });
  }
}];

exports.getUserDetails = [isCoach, async (req, res) => {
  try {
    const userId = req.params.id;
    const [user, weightLogs] = await Promise.all([
      User.findById(userId).select('-password'),
      WeightLog.find({ user: userId }).sort({ datum: 'asc' })
    ]);
    if (!user) {
      return res.status(404).json({ message: 'Gebruiker niet gevonden' });
    }
    const userObject = user.toObject();
    userObject.weightLogs = weightLogs;
    res.json(userObject);
  } catch (error) {
    console.error('Fout bij ophalen gebruiker details:', error);
    res.status(500).json({ message: 'Kon gebruiker details niet ophalen.' });
  }
}];

exports.getFoodLogs = [isCoach, async (req, res) => {
  try {
    const foodLogs = await FoodLog.find({ user: req.params.userId }).sort({ datum: -1 });
    res.json(foodLogs);
  } catch (error) {
    console.error('Fout bij ophalen voedingslogs:', error);
    res.status(500).json({ message: 'Kon voedingslogs niet ophalen.' });
  }
}];

exports.askAI = [isCoach, async (req, res) => {
  try {
    const { userId, question } = req.body;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "Cliënt niet gevonden." });
    }
    
    let context = `CONTEXT VAN CLIËNT:\n\n== INTAKE GEGEVENS ==\n${JSON.stringify(user.toObject(), null, 2)}\n\n`;
    const systemPrompt = `Je bent een expert data-analist en assistent. Analyseer de context en beantwoord de vraag.`;
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `CONTEXT:\n${context}\n\nVRAAG VAN DE COACH:\n${question}` }
    ];
    
    const aiResponse = await openai.chat.completions.create({ 
      model: "gpt-4o", 
      messages: messages, 
      max_tokens: 500 
    });
    
    const aiReply = aiResponse.choices[0].message.content;
    res.json({ reply: aiReply });
  } catch (error) {
    console.error('Fout in de admin AI route:', error);
    res.status(500).json({ message: 'Er is een fout opgetreden.' });
  }
}];
