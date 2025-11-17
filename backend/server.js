// Force backend re-evaluation
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Laad omgevingsvariabelen uit .env bestand (voor lokaal) of Render's environment
dotenv.config();

// DEBUG: Log de CLIENT_URL om te controleren of deze correct wordt geladen
console.log(`CORS origin wordt ingesteld voor: ${process.env.CLIENT_URL}`);

// Maak verbinding met de database
connectDB();

// Passport config
require('./config/passport')(passport);

const app = express();

// --- BELANGRIJKE CORS FIX ---
// 1. Handel preflight 'OPTIONS' verzoeken expliciet af.
// Dit is de sleutel om complexe CORS-fouten op te lossen.
app.options('*', cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true } ));

// 2. Stel de CORS-headers in voor alle andere verzoeken (GET, POST, etc.).
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }  ));
// --- EINDE CORS FIX ---

// Session middleware (nodig voor Passport)
app.use(session({ secret: process.env.SESSION_SECRET || 'secret', resave: false, saveUninitialized: false }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware om JSON-verzoeken te parsen
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/intake', require('./routes/intakeRoutes'));
app.use('/api/log', require('./routes/logRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
