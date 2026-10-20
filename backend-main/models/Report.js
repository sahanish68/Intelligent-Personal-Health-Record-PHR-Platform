const mongoose = require('mongoose');
const mongooseEncryptionPlugin = require('../security/encryption/mongooseEncryptionPlugin');

const reportSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  doctorName: { type: String, default: "Unknown Doctor" },
  hospitalName: { type: String, default: "Unknown Clinic" },
  visitDate: { type: String },
  diseaseName: { type: String },
  reasonForCondition: { type: String },
  extractedText: { type: String },
  actionPlan: [{ type: String }],
  medicines: [
    {
      name: { type: String },
      specification: { type: String },
      purpose: { type: String },
      durationInDays: { type: Number },
      frequency: { type: String }
    }
  ],

  // --- NEW: VITALS TRACKING (Feature 2) ---
  vitals: {
    bloodPressure: { type: String, default: null },
    heartRate: { type: Number, default: null },
    temperature: { type: Number, default: null },
    bloodSugar: { type: Number, default: null }
  },

  voiceReportUrl: { type: String },

  // --- X-Ray & Visual Scan Data ---
  containsVisualScan: { type: Boolean, default: false },
  scanType: { type: String, default: "None" },
  croppedScanUrl: { type: String },

  // --- Original File Storage ---
  attachedFiles: [{ type: String }],

  createdAt: { type: Date, default: Date.now }
});

// Apply Secure Envelope Encryption to sensitive fields
reportSchema.plugin(mongooseEncryptionPlugin, {
  fields: ['doctorName', 'hospitalName', 'diseaseName', 'reasonForCondition', 'extractedText', 'vitals.bloodPressure']
});

module.exports = mongoose.model('Report', reportSchema);