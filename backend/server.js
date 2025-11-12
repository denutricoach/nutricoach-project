const express = require('express');\nconst session = require('express-session');\nconst passport = require('passport');\nconst cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();\n\n// Passport config\nrequire('./config/passport')(passport);

const app = express();\n\n// CORS instellingen (belangrijk voor frontend/backend communicatie)\napp.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));\n\n// Session middleware (nodig voor Passport)\napp.use(session({ secret: process.env.SESSION_SECRET || 'secret', resave: false, saveUninitialized: false }));\n\n// Passport middleware\napp.use(passport.initialize());\napp.use(passport.session());

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/intake', require('./routes/intakeRoutes'));
app.use('/api/log', require('./routes/logRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
