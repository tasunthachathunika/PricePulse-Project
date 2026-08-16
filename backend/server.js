const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

// ✅ Import Services & Utils correctly
const { startCronJob } = require('./services/cronService');
const { sendEmail } = require('./utils/emailService');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- ROUTES SECTION ---
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

// Test Route for Email
app.get('/test-email', async (req, res) => {
  const testEmail = req.query.email || process.env.TEST_EMAIL || 'your_email@gmail.com';
  console.log(`Testing email to: ${testEmail}`);

  // Using 'welcome' type for test as it is generic
  const success = await sendEmail(testEmail, 'welcome', { name: 'Test User' });

  if (success) {
    res.json({ message: '✅ Test Email sent successfully!' });
  } else {
    res.status(500).json({ error: '❌ Failed to send test email. Check server console.' });
  }
});

const PORT = process.env.PORT || 5000;

// ✅ Connect to DB *BEFORE* starting the server
const startServer = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pricepulse';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');

    // Start Cron Job only after DB is ready
    startCronJob();

    app.listen(PORT, () => {
      console.log(`🚀 Professional Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ DB Connection Error:', err);
    process.exit(1); // Exit process if DB fails
  }
};

startServer();