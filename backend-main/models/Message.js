const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  channel: { type: String, required: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  profilePhoto: { type: String, default: "" },
  text: { type: String, required: true },
  proofImage: { type: String, default: "" }, // Base64 string for the uploaded proof
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);