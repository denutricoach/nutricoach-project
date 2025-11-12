const User = require('../models/User');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handleChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Gebruiker niet gevonden.' });
    }

    // 1. Voeg het bericht van de gebruiker toe aan de chatgeschiedenis
    user.chatHistory.push({ role: 'user', content: message });

    // 2. Genereer de AI-respons
    // Oplossing voor AI PROMPT BUG (Punt #5): Zorg ervoor dat de AI GEEN afsluitende groet geeft.
    const systemPrompt = `Je bent NutriCoach AI, een vriendelijke en deskundige voedingscoach. Je analyseert de intakegegevens van de gebruiker en hun chatgeschiedenis om gepersonaliseerd, motiverend en praktisch advies te geven. Je antwoorden zijn beknopt, bemoedigend en altijd gebaseerd op de context.
    
    CONTEXT VAN CLIËNT:
    ${JSON.stringify(user.toObject({ virtuals: true, transform: (doc, ret) => { delete ret.password; delete ret.wachtwoordResetToken; delete ret.wachtwoordResetExpires; delete ret.emailVerificatieToken; return ret; } }), null, 2)}
    
    BELANGRIJK: Je antwoord mag GEEN afsluitende groet bevatten zoals "Met vriendelijke groet," of "Groeten,". Je antwoord moet direct beginnen met het advies of de reactie.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...user.chatHistory.map(msg => ({ role: msg.role, content: msg.content }))
    ];

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // Gebruik een modern model (beschikbaar in de sandbox)
      messages: messages,
      max_tokens: 500,
    });

    const aiReply = aiResponse.choices[0].message.content;

    // 3. Voeg de AI-respons toe aan de chatgeschiedenis
    user.chatHistory.push({ role: 'assistant', content: aiReply });
    await user.save();

    res.json({ reply: aiReply });
  } catch (error) {
    console.error('Chatfout:', error);
    res.status(500).json({ message: 'Chatbericht verwerken mislukt.' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('chatHistory');
    res.json(user.chatHistory);
  } catch (error) {
    res.status(500).json({ message: 'Kon chatgeschiedenis niet ophalen.' });
  }
};
