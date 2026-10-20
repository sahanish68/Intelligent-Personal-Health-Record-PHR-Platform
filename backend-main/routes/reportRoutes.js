const express = require('express');
const router = express.Router();
const Report = require('../models/Report'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Clean the filename so there are no weird spaces
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, Date.now() + '-' + safeName);
  }
});

const upload = multer({ storage });

// --- 3. THE UPGRADED MULTIPART SAVE ROUTE ---
router.post('/add', upload.array('files'), async (req, res) => {
  try {
    console.log("📥 Incoming report save request...");
    
    // Safety Check 1: Did we get the text data?
    if (!req.body.reportData) {
      throw new Error("Missing reportData in the request body!");
    }

    // Parse the JSON string sent from React
    const reportData = JSON.parse(req.body.reportData);
    
    // Safety Check 2: Did we get physical files?
    const attachedFiles = req.files && req.files.length > 0 
      ? req.files.map(file => `/uploads/${file.filename}`) 
      : [];

    console.log(`📄 Files attached: ${attachedFiles.length}`);

    // Create and save the new record
    const newReport = new Report({
      ...reportData,
      attachedFiles: attachedFiles 
    });

    const savedReport = await newReport.save();
    console.log("✅ Report securely saved to Vault!");
    
    res.status(201).json(savedReport);

  } catch (error) {
    console.error("❌ CRITICAL ERROR SAVING REPORT:");
    console.error(error);
    res.status(500).json({ message: "Failed to save report to vault", error: error.message });
  }
});

// --- 4. GET ALL REPORTS FOR A USER ---
router.get('/user/:userId', async (req, res) => {
  try {
    const reports = await Report.find({ patientId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
});

// --- 5. GET A SINGLE REPORT BY ID ---
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Error fetching report", error: error.message });
  }
});


// --- DELETE A REPORT ---
router.delete('/:id', async (req, res) => {
  try {
    const reportId = req.params.id;
    const deletedReport = await Report.findByIdAndDelete(reportId);
    
    if (!deletedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report", error: error.message });
  }
});

// --- UPDATE A REPORT ---
router.put('/:id', async (req, res) => {
  try {
    const reportId = req.params.id;
    // Find the report by ID and update it with the new data from React
    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      req.body,
      { new: true } // This tells MongoDB to return the newly updated version
    );
    
    if (!updatedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: "Error updating report", error: error.message });
  }
});


module.exports = router;