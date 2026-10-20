const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. MUST BE FIRST: Open CORS to completely allow all origins during development
app.use(cors());

// 2. MUST BE SECOND: Parse incoming JSON data
app.use(express.json());

const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists and is publicly accessible
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'backend-main',
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 3. Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartphr';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch((err) => {
    console.warn(`⚠️ MongoDB connection note: Unable to connect to MongoDB at ${MONGO_URI}`);
    console.warn('   Ensure MongoDB is running locally, or configure a valid MONGO_URI (e.g., MongoDB Atlas) in backend-main/.env');
  });

// 4. Route Connections
// Auth Routes for Login/Register
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// --- Medicine Reminder System ---
const reminderRoutes = require('./routes/reminderRoutes');
app.use('/api/reminders', reminderRoutes);

// Existing Report Routes
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

// --- The Geospatial Hospital Engine ---
const hospitalRoutes = require('./routes/hospitalRoutes');
app.use('/api/hospitals', hospitalRoutes);

// --- The Emergency SOS Dispatcher ---
const sosRoutes = require('./routes/sosRoutes');
app.use('/api/sos', sosRoutes);

// --- Community System ---
const communityRoutes = require('./routes/communityRoutes');
app.use('/api/community', communityRoutes);

// --- Wearable & Google Fit Bridge ---
const deviceRoutes = require('./routes/deviceRoutes');
app.use('/api/device', deviceRoutes);

// --- SOCKET.IO IMPLEMENTATION ---
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 User connected to Socket.IO: ${socket.id}`);

  // User joins a specific community channel
  socket.on('join_channel', async (channelName) => {
    socket.join(channelName);
    console.log(`👤 User joined channel: ${channelName}`);

    try {
      // Fetch the last 50 messages for this channel
      const history = await Message.find({ channel: channelName })
        .sort({ createdAt: 1 })
        .limit(50);

      // Send history ONLY to the user who just joined
      socket.emit('receive_history', history);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  });

  // User sends a message to a channel
  socket.on('send_message', async (data) => {
    try {
      // Save message to MongoDB
      const newMessage = new Message({
        channel: data.channel,
        userId: data.userId,
        name: data.name,
        email: data.email,
        profilePhoto: data.profilePhoto,
        text: data.text,
        proofImage: data.proofImage
      });
      await newMessage.save();

      // Broadcast the saved message to everyone in that channel
      io.to(data.channel).emit('receive_message', newMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Start the server (Fallback set to 5001 to avoid Mac AirPlay conflicts)
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});