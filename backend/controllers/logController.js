const User = require('../models/User');
const FoodLog = require('../models/FoodLog');
const WeightLog = require('../models/WeightLog');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- GEWICHTSLOG LOGICA ---

exports.logWeight = async (req, res) => {
  try {
    const { gewicht } = req.body;
    const userId = req.user.id;

    const newWeightLog = new WeightLog({ user: userId, gewicht });
    await newWeightLog.save();

    // Genereer een korte AI-reactie
    const prompt = `De gebruiker heeft zojuist zijn gewicht gelogd: ${gewicht} kg. Geef een korte, motiverende en positieve reactie.`;
    const aiResponse = await openai.chat.completions.create({ 
      model: "gpt-4o", 
      messages: [{ role: 'user', content: prompt }], 
      max_tokens: 50 
    });
    
    res.json({ 
      log: newWeightLog,
      aiReply: aiResponse.choices[0].message.content 
    });
  } catch (error) {
    console.error('Fout bij loggen gewicht:', error);
    res.status(500).json({ message: 'Kon gewicht niet loggen.' });
  }
};

exports.getWeightLogs = async (req, res) => {
  try {
    const weightLogs = await WeightLog.find({ user: req.user.id }).sort({ datum: 'asc' });
    res.json(weightLogs);
  } catch (error) {
    console.error('Fout bij ophalen gewichtslogs:', error);
    res.status(500).json({ message: 'Kon gewichtslogs niet ophalen.' });
  }
};

// --- VOEDINGSLOG LOGICA ---

exports.logFood = async (req, res) => {
  try {
    const { ontbijt, lunch, diner, tussendoortjes } = req.body;
    const userId = req.user.id;

    if (!ontbijt && !lunch && !diner && !tussendoortjes) {
      return res.status(400).json({ 
        status: 'error',
        title: 'Lege Invoer',
        message: 'Vul alstublieft minstens één maaltijd in om uw voeding te loggen.'
      });
    }

    const user = await User.findById(userId);
    const userGoal = user.hulpvraag_doel || 'een gezondere levensstijl';

    const prompt = `
      Een cliënt met als doel "${userGoal}" heeft de volgende maaltijden gelogd:
      - Ontbijt: ${ontbijt || 'niet ingevuld'}
      - Lunch: ${lunch || 'niet ingevuld'}
      - Diner: ${diner || 'niet ingevuld'}
      - Tussendoortjes: ${tussendoortjes || 'niet ingevuld'}
      Analyseer dit. Maak een ruwe schatting van de calorieën. Vergelijk dit met een standaard doel van 2000 kcal voor gewichtsbehoud.
      Bepaal op basis van de analyse de status: 'perfect', 'te_veel', of 'te_weinig'.
      Genereer een JSON-object met de volgende structuur:
      {
        "status": "...",
        "title": "...",
        "message": "..."
      }
    `;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    const feedback = JSON.parse(aiResponse.choices[0].message.content);

    const newFoodLog = new FoodLog({
      user: userId,
      ontbijt, lunch, diner, tussendoortjes,
      feedbackStatus: feedback.status,
      feedbackMessage: feedback.message
    });
    await newFoodLog.save();
    
    res.json(feedback);

  } catch (error) {
    console.error('Fout bij analyseren voeding:', error);
    res.status(500).json({ 
      status: 'error',
      title: 'Oeps!',
      message: 'Er is iets misgegaan bij het analyseren van je voeding. Probeer het later opnieuw.'
    });
  }
};

exports.getFoodLogs = async (req, res) => {
  try {
    const foodLogs = await FoodLog.find({ user: req.user.id }).sort({ datum: -1 });
    res.json(foodLogs);
  } catch (error) {
    res.status(500).json({ message: 'Kon voedingslogs niet ophalen.' });
  }
};
