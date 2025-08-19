// backend/index.js

// 1. Imports
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Coach = require('./models/Coach');
const WeightLog = require('./models/WeightLog');
const FoodLog = require('./models/FoodLog');
const ProgressPhoto = require('./models/ProgressPhoto');
const Message = require('./models/Message');
const OpenAI = require('openai');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// 2. OpenAI Client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 3. App & Poort - AANGEPAST VOOR DEPLOYMENT
const app = express();
const PORT = process.env.PORT || 3000; // Gebruik de poort van de host, of 3000 lokaal

// 4. Middleware
app.use(cors());
app.use(bodyParser.json());

// 5. Database verbinding
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Succesvol verbonden met MongoDB!'))
  .catch((error) => console.error('Fout bij verbinden met MongoDB:', error));

// 5B. Cloudinary Configuratie
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- AUTH MIDDLEWARE (DE POORTWACHTER) ---
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'Geen token, autorisatie geweigerd' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is niet geldig' });
  }
};

// --- AUTHENTICATIE ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, intakeData } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Een gebruiker met dit e-mailadres bestaat al.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ email, password: hashedPassword, ...intakeData });
    const prompt = `
      Een nieuwe gebruiker genaamd ${user.algemeen_naam} heeft de intake voltooid.
      Hier zijn de details: ${JSON.stringify(intakeData, null, 2)}.
      Schrijf een warm, persoonlijk en motiverend welkomstbericht.
      Bevestig de belangrijkste doelen en eventuele medische condities of allergieën op een empathische manier.
      Houd het bericht bondig en eindig met de exacte afzender: "Met warme groeten, Nutricoach Judith Schmeltz".
    `;
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 250
    });
    const aiWelcomeMessage = aiResponse.choices[0].message.content;
    user.chatHistory.push({ role: 'assistant', content: aiWelcomeMessage });
    await user.save();
    const payload = { user: { id: user.id, role: 'user' } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, userId: user.id, aiWelcomeMessage });
      }
    );
  } catch (error) {
    console.error('Fout bij registratie:', error);
    res.status(500).json({ message: 'Serverfout bij registratie.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let account = await User.findOne({ email });
    let role = 'user';
    if (!account) {
      account = await Coach.findOne({ email });
      role = 'coach';
    }
    if (!account) {
      return res.status(400).json({ message: 'Ongeldige inloggegevens.' });
    }
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Ongeldige inloggegevens.' });
    }
    const payload = { user: { id: account.id, role: role } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Fout bij inloggen:', error);
    res.status(500).json({ message: 'Serverfout bij inloggen.' });
  }
});

// --- GEBRUIKER ROUTES (BEVEILIGD) ---
app.get('/api/users/me', auth, async (req, res) => { try { const user = await User.findById(req.user.id).select('-password'); res.json(user); } catch (error) { console.error(error.message); res.status(500).send('Server Fout'); } });

app.post('/api/chat', auth, async (req, res) => { 
  try { 
    const userId = req.user.id; 
    const { message } = req.body; 
    const user = await User.findById(userId); 
    if (!user) return res.status(404).json({ message: "Gebruiker niet gevonden." }); 
    
    user.chatHistory.push({ role: 'user', content: message }); 
    
    const messagesForAI = [
      { role: 'system', content: 'Je bent een behulpzame voedingsassistent. Sluit je berichten altijd neutraal af, zonder een naam of afzender te noemen.' },
      ...user.chatHistory
    ];

    const aiResponse = await openai.chat.completions.create({ model: "gpt-4o", messages: messagesForAI, max_tokens: 150 }); 
    const aiMessage = aiResponse.choices[0].message.content; 
    user.chatHistory.push({ role: 'assistant', content: aiMessage }); 
    await user.save(); 
    res.json({ reply: aiMessage }); 
  } catch (error) { 
    console.error('Fout in chat route:', error); 
    res.status(500).json({ message: 'Er is een fout opgetreden in de chat.' }); 
  } 
});

// --- NIEUWE ROUTE: VIND DE STANDAARD COACH ---
app.get('/api/coach/default', auth, async (req, res) => {
  try {
    const coach = await Coach.findOne(); 
    if (!coach) return res.status(404).json({ message: 'Geen coach gevonden.' });
    res.json(coach);
  } catch (error) {
    res.status(500).json({ message: 'Serverfout bij ophalen coach.' });
  }
});

// --- LOG ROUTES (BEVEILIGD) ---
app.post('/api/log/gewicht', auth, async (req, res) => { try { const { gewicht } = req.body; const newWeightLog = new WeightLog({ user: req.user.id, gewicht }); await newWeightLog.save(); const prompt = `De gebruiker heeft zojuist zijn gewicht gelogd: ${gewicht} kg. Geef een korte, motiverende en positieve reactie.`; const aiResponse = await openai.chat.completions.create({ model: "gpt-4o", messages: [{ role: 'user', content: prompt }], max_tokens: 50 }); res.json({ reply: aiResponse.choices[0].message.content }); } catch (error) { console.error('Fout bij loggen gewicht:', error); res.status(500).json({ message: 'Kon gewicht niet loggen.' }); } });
app.get('/api/logs/gewicht', auth, async (req, res) => { try { const weightLogs = await WeightLog.find({ user: req.user.id }).sort({ datum: 'asc' }); res.json(weightLogs); } catch (error) { console.error('Fout bij ophalen gewichtslogs:', error); res.status(500).json({ message: 'Kon gewichtslogs niet ophalen.' }); } });

app.post('/api/log/voeding-analyse', auth, async (req, res) => {
  try {
    const { ontbijt, lunch, diner, tussendoortjes } = req.body;

    if (!ontbijt && !lunch && !diner && !tussendoortjes) {
      return res.status(400).json({ 
        status: 'error',
        title: 'Lege Invoer',
        message: 'Vul alstublieft minstens één maaltijd in om uw voeding te loggen.'
      });
    }

    const user = await User.findById(req.user.id);
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
      user: req.user.id,
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
});

// --- RECEPTEN-ROUTE ---
app.post('/api/recipes/generate', auth, async (req, res) => { try { const user = await User.findById(req.user.id).select('-password'); if (!user) { return res.status(404).json({ message: "Gebruiker niet gevonden." }); } const prompt = `Je bent een creatieve en deskundige chef-kok gespecialiseerd in gezonde voeding. Genereer 3 concrete, makkelijk te bereiden en smakelijke recepten (ontbijt, lunch, of diner) voor de volgende cliënt. **BELANGRIJKE CONTEXT VAN DE CLIËNT:** - **Doel:** ${user.hulpvraag_doel} - **Allergieën/Intoleranties (ZEER BELANGRIJK):** ${user.medisch_allergieen_intoleranties} - **Producten die de cliënt NIET eet:** ${user.voorkeur_producten_niet} - **Voorkeur voor eetstijl:** ${user.voorkeur_eetstijl} - **Beschikbare tijd voor koken:** ${user.voorkeur_tijd_maaltijdbereiding} **INSTRUCTIES VOOR DE RECEPTEN:** 1. Zorg dat de recepten passen bij het doel van de cliënt (bv. afvallen, spiermassa opbouwen). 2. Houd **absoluut** rekening met de allergieën en producten die de cliënt niet eet. 3. Geef elk recept een duidelijke naam. 4. Lijst de benodigde ingrediënten op. 5. Geef duidelijke, stapsgewijze bereidingsinstructies. 6. Presenteer het antwoord in een duidelijk en leesbaar formaat, bijvoorbeeld met Markdown.`; const aiResponse = await openai.chat.completions.create({ model: "gpt-4o", messages: [{ role: 'user', content: prompt }], max_tokens: 1000, }); const recipes = aiResponse.choices[0].message.content; res.json({ recipes }); } catch (error) { console.error('Fout bij genereren recepten:', error); res.status(500).json({ message: 'Kon geen recepten genereren.' }); } });
// --- FOTO UPLOAD ROUTES ---
app.post('/api/photos/upload', auth, upload.single('progressPhoto'), async (req, res) => { try { if (!req.file) { return res.status(400).json({ msg: 'Geen bestand geüpload.' }); } const result = await new Promise((resolve, reject) => { const uploadStream = cloudinary.uploader.upload_stream({ folder: `progress_photos/${req.user.id}` }, (error, result) => { if (error) reject(error); else resolve(result); }); uploadStream.end(req.file.buffer); }); const newPhoto = new ProgressPhoto({ imageUrl: result.secure_url, publicId: result.public_id, user: req.user.id, caption: req.body.caption || '', }); await newPhoto.save(); res.status(201).json(newPhoto); } catch (error) { console.error('Fout bij foto-upload:', error); res.status(500).send('Server Fout'); } });
app.get('/api/photos', auth, async (req, res) => { try { const photos = await ProgressPhoto.find({ user: req.user.id }).sort({ uploadDate: -1 }); res.json(photos); } catch (error) { console.error('Fout bij ophalen fotos:', error); res.status(500).send('Server Fout'); } });


// --- DIRECTE BERICHTEN ROUTES (COACH & KLANT) ---

// Haal de chatgeschiedenis op
app.get('/api/messages/:otherUserId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.otherUserId;
    const conversationId = [currentUserId, otherUserId].sort().join('_');
    const messages = await Message.find({ conversationId }).sort({ timestamp: 'asc' });
    res.json(messages);
  } catch (error) {
    console.error('Fout bij ophalen berichten:', error);
    res.status(500).json({ message: 'Kon berichten niet ophalen.' });
  }
});

// Verstuurt een nieuw bericht
app.post('/api/messages', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;
    let receiverRole = 'user';
    const isCoach = await Coach.findById(receiverId);
    if (isCoach) {
      receiverRole = 'coach';
    }
    const conversationId = [senderId, receiverId].sort().join('_');
    const newMessage = new Message({
      conversationId,
      sender: senderId,
      senderModel: senderRole.charAt(0).toUpperCase() + senderRole.slice(1),
      receiver: receiverId,
      receiverModel: receiverRole.charAt(0).toUpperCase() + receiverRole.slice(1),
      content
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Fout bij versturen bericht:', error);
    res.status(500).json({ message: 'Kon bericht niet versturen.' });
  }
});

// --- NOTIFICATIE ROUTES ---

// Tel het aantal ongelezen berichten voor de ingelogde gebruiker
app.get('/api/messages/unread-count/:otherUserId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.otherUserId;
    const conversationId = [currentUserId, otherUserId].sort().join('_');
    
    const count = await Message.countDocuments({
      conversationId: conversationId,
      receiver: currentUserId,
      read: false
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Kon ongelezen berichten niet tellen.' });
  }
});

// Markeer berichten als gelezen
app.post('/api/messages/mark-as-read/:otherUserId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.otherUserId;
    const conversationId = [currentUserId, otherUserId].sort().join('_');

    await Message.updateMany(
      { conversationId: conversationId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );
    
    res.status(200).json({ message: 'Berichten als gelezen gemarkeerd.' });
  } catch (error) {
    res.status(500).json({ message: 'Kon berichten niet als gelezen markeren.' });
  }
});


// --- ADMIN ROUTES ---

app.get('/api/admin/users', auth, async (req, res) => {
  try {
    const coachId = req.user.id;
    let users = await User.find().lean();

    const usersWithUnreadCount = await Promise.all(users.map(async (user) => {
      const conversationId = [coachId, user._id.toString()].sort().join('_');
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

    res.json(usersWithUnreadCount);
  } catch (error)
 {
    console.error('Fout bij ophalen gebruikers:', error);
    res.status(500).json({ message: 'Kon gebruikers niet ophalen.' });
  }
});

app.get('/api/admin/user/:id', auth, async (req, res) => { 
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
});

app.get('/api/admin/foodlogs/:userId', auth, async (req, res) => {
  try {
    const foodLogs = await FoodLog.find({ user: req.params.userId }).sort({ datum: -1 });
    res.json(foodLogs);
  } catch (error) {
    console.error('Fout bij ophalen voedingslogs:', error);
    res.status(500).json({ message: 'Kon voedingslogs niet ophalen.' });
  }
});

app.post('/api/admin/ask-ai', auth, async (req, res) => { try { const { userId, question } = req.body; const user = await User.findById(userId).select('-password'); if (!user) { return res.status(404).json({ message: "Cliënt niet gevonden." }); } let context = `CONTEXT VAN CLIËNT:\n\n== INTAKE GEGEVENS ==\n${JSON.stringify(user, null, 2)}\n\n`; const systemPrompt = `Je bent een expert data-analist en assistent. Analyseer de context en beantwoord de vraag.`; const messages = [{ role: 'system', content: systemPrompt }, { role: 'user', content: `CONTEXT:\n${context}\n\nVRAAG VAN DE COACH:\n${question}` }]; const aiResponse = await openai.chat.completions.create({ model: "gpt-4o", messages: messages, max_tokens: 500 }); const aiReply = aiResponse.choices[0].message.content; res.json({ reply: aiReply }); } catch (error) { console.error('Fout in de admin AI route:', error); res.status(500).json({ message: 'Er is een fout opgetreden.' }); } });

// --- TIJDELIJKE ROUTE OM DE EERSTE COACH AAN TE MAKEN ---
app.get('/api/setup/create-coach', async (req, res) => { try { const existingCoach = await Coach.findOne({ email: 'judith@nutricoach.ai' }); if (existingCoach) { return res.status(400).send('Coach-account bestaat al.'); } const salt = await bcrypt.genSalt(10); const hashedPassword = await bcrypt.hash('VeiligWachtwoord123!', salt); const newCoach = new Coach({ naam: 'Judith Schmeltz', email: 'judith@nutricoach.ai', password: hashedPassword, }); await newCoach.save(); res.status(201).send('Coach-account voor Judith Schmeltz succesvol aangemaakt!'); } catch (error) { console.error('Fout bij aanmaken coach:', error); res.status(500).send('Kon coach niet aanmaken.'); } });

// 6. Server starten
app.listen(PORT, () => {
  console.log(`Server luistert op http://localhost:${PORT}`       );
});
