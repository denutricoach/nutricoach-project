// Force backend re-evaluation
const express = require('express');
// const session = require('express-session'); // TIJDELIJK UIT
// const passport = require('passport'); // TIJDELIJK UIT
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Laad omgevingsvariabelen
dotenv.config();

// Maak verbinding met de database
connectDB();

// Passport config - TIJDELIJK UIT
// require('./config/passport')(passport);

const app = express();

// --- EXPLICIETE CORS CONFIGURATIE ---
// We gebruiken de meest robuuste versie die we hebben.
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000'];
const corsOptions = {
  origin: function (origin, callback ) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
};
app.use(cors(corsOptions));
// --- EINDE CONFIGURATIE ---


// Session middleware - TIJDELIJK UIT
// app.use(session({ secret: process.env.SESSION_SECRET || 'secret', resave: false, saveUninitialized: false }));

// Passport middleware - TIJDELIJK UIT
// app.use(passport.initialize());
// app.use(passport.session());

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
