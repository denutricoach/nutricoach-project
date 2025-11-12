const nodemailer = require('nodemailer');
require('dotenv').config();

// Nodemailer transporter configuratie
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail succesvol verzonden:', info.messageId);
    return true;
  } catch (error) {
    console.error('Fout bij verzenden e-mail:', error);
    return false;
  }
};

module.exports = { sendEmail };
