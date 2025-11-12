const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Gebruik de nieuwe opties voor Mongoose 6+
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB verbonden');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
