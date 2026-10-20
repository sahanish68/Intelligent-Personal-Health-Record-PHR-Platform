const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

// 1. Add multiple reminders at once (When a report is saved)
router.post('/add-bulk', async (req, res) => {
  try {
    const { userId, medicines } = req.body;
    
    // Convert the AI's medicine list into active database alarms
    const remindersToSave = medicines.map(med => ({
      userId,
      medicineName: med.name,
      frequency: med.frequency || "Once a day",
      durationInDays: med.durationInDays || 7
    }));

    await Reminder.insertMany(remindersToSave);
    res.status(201).json({ message: "Automated reminders set successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error setting reminders", error: error.message });
  }
});

// 2. Get all active reminders for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.params.userId }).sort({ startDate: -1 });
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reminders", error: error.message });
  }
});

// 3. Delete a specific reminder
router.delete('/:id', async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting reminder", error: error.message });
  }
});

module.exports = router;
