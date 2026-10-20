const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // --- Core Profile Fields ---
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // --- Contact Information ---
  phoneNumber: { type: String, default: "" },
  address: { type: String, default: "" },
  
  // --- Community Verification Fields ---
  profilePhoto: { type: String, default: "" }, // URL to the image
  isCommunityVerified: { type: Boolean, default: false }, // The Master Lock
  
  // --- Premium Health Profile Fields ---
  bloodGroup: { type: String, default: "" },
  emergencyContact: { type: String, default: "" },
  allergies: { type: String, default: "None" }
  
}, { 
  timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
});

module.exports = mongoose.model('User', userSchema);