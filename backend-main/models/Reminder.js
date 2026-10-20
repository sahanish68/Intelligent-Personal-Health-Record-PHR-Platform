const mongoose = require('mongoose');
const mongooseEncryptionPlugin = require('../security/encryption/mongooseEncryptionPlugin');

const reminderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  medicineName: { type: String, required: true },
  frequency: { type: String, required: true },
  durationInDays: { type: Number, default: 7 },
  startDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Apply Secure Envelope Encryption to sensitive fields
reminderSchema.plugin(mongooseEncryptionPlugin, {
  fields: ['medicineName']
});

module.exports = mongoose.model('Reminder', reminderSchema);