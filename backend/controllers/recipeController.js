const User = require('../models/User');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateRecipes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "Gebruiker niet gevonden." });
    }
    
    const prompt = `Je bent een creatieve en deskundige chef-kok gespecialiseerd in gezonde voeding. Genereer 3 concrete, makkelijk te bereiden en smakelijke recepten (ontbijt, lunch, of diner) voor de volgende cliënt.
    
    **BELANGRIJKE CONTEXT VAN DE CLIËNT:**
    - **Doel:** ${user.hulpvraag_doel || 'een gezondere levensstijl'}
    - **Allergieën/Intoleranties (ZEER BELANGRIJK):** ${user.medisch_allergieen_intoleranties || 'geen'}
    - **Producten die de cliënt NIET eet:** ${user.voorkeur_producten_niet || 'geen'}
    - **Voorkeur voor eetstijl:** ${user.voorkeur_eetstijl || 'geen specifieke voorkeur'}
    - **Beschikbare tijd voor koken:** ${user.voorkeur_tijd_maaltijdbereiding || 'gemiddeld'}
    
    **INSTRUCTIES VOOR DE RECEPTEN:**
    1. Zorg dat de recepten passen bij het doel van de cliënt (bv. afvallen, spiermassa opbouwen).
    2. Houd **absoluut** rekening met de allergieën en producten die de cliënt niet eet.
    3. Geef elk recept een duidelijke naam.
    4. Lijst de benodigde ingrediënten op.
    5. Geef duidelijke, stapsgewijze bereidingsinstructies.
    6. Presenteer het antwoord in een duidelijk en leesbaar formaat, bijvoorbeeld met Markdown.
    7. **BELANGRIJK:** Sluit het bericht NIET af met een groet of naam.
    `;
    
    const aiResponse = await openai.chat.completions.create({ 
      model: "gpt-4o", 
      messages: [{ role: 'user', content: prompt }], 
      max_tokens: 1000, 
    });
    
    const recipes = aiResponse.choices[0].message.content;
    res.json({ recipes });
  } catch (error) {
    console.error('Fout bij genereren recepten:', error);
    res.status(500).json({ message: 'Kon geen recepten genereren.' });
  }
};
