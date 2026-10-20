const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const DeviceVitals = require('../models/DeviceVitals');

// --- HARDCODED CREDENTIALS (Bypasses .env issues) ---
const CLIENT_ID = "325159831187-oct8t464rkunpeff2lrqrcdad2ed7dmr.apps.googleusercontent.com";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:5001/api/device/google/callback";

// Helper to initialize Google OAuth Client safely
const getOAuth2Client = () => {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
};

// --- 1. GENERATE AUTH URL ---
router.get('/google/auth', (req, res) => {
  const { userId } = req.query;
  try {
    const oauth2Client = getOAuth2Client();
    const scopes = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: userId
    });
    res.json({ url });
  } catch (error) {
    console.error("Auth URL Error:", error);
    res.status(500).json({ error: "Failed to generate Auth URL" });
  }
});

// --- 2. GOOGLE CALLBACK ---
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  const oauth2Client = getOAuth2Client();

  try {
    // Exchange the code for the access tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const fitness = google.fitness({ version: 'v1', auth: oauth2Client });

    // Time range: Start of today to right now
    const startTime = new Date().setHours(0, 0, 0, 0);
    const endTime = new Date().getTime();

    // Fetch the data from Google Fit
    const response = await fitness.users.dataset.aggregate({
      userId: 'me',
      requestBody: {
        aggregateBy: [
          { dataTypeName: 'com.google.step_count.delta' },
          { dataTypeName: 'com.google.heart_rate.bpm' }
        ],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startTime,
        endTimeMillis: endTime
      }
    });

    // Extracting Data safely
    const steps = response.data.bucket[0]?.dataset[0]?.point[0]?.value[0]?.intVal || 0;
    const heartRate = response.data.bucket[0]?.dataset[1]?.point[0]?.value[0]?.fpVal || 0;

    const newVitals = new DeviceVitals({
      userId: state || "test-user-id",
      heartRate: Math.round(heartRate).toString() || "72",
      steps: steps.toLocaleString(),
      spO2: "98%",
      sleep: "Synced"
    });

    await newVitals.save();

    // ✅ REDIRECT BACK TO VITE FRONTEND (PORT 5173)
    res.redirect('http://localhost:5173/device-health?status=success');

  } catch (error) {
    console.error("Google Fit Error:", error);
    // ✅ REDIRECT BACK TO VITE FRONTEND (PORT 5173)
    res.redirect('http://localhost:5173/device-health?status=error');
  }
});

// --- 3. FETCH HISTORY ---
router.get('/user/:userId', async (req, res) => {
  try {
    const vitals = await DeviceVitals.find({ userId: req.params.userId })
      .sort({ syncDate: -1 })
      .limit(5);
    res.json(vitals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vitals" });
  }
});

module.exports = router;
