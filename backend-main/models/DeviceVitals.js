const mongoose = require('mongoose');

const deviceVitalsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  heartRate: { type: String, default: '--' },
  steps: { type: String, default: '--' },
  spO2: { type: String, default: '--' },
  sleep: { type: String, default: '--' },
  syncDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeviceVitals', deviceVitalsSchema);