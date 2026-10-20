const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_key_123';

// 1. REGISTER a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use!" });

    // Save the new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });

    // Send back the user's secure ID and token
    res.status(201).json({ message: "User registered successfully!", userId: newUser._id, name: newUser.name, token });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});

// 2. LOGIN an existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    // Success! Send back their secure ID and token
    res.status(200).json({ message: "Login successful!", userId: user._id, name: user.name, token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});


// 3. GET User Profile Data
router.get('/profile/:id', async (req, res) => {
  try {
    // We use .select('-password') to securely hide the password from the frontend!
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
});

// 4. UPDATE User Profile Data
router.put('/profile/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true } // This tells MongoDB to return the newly updated document
    ).select('-password');
    res.status(200).json({ message: "Profile updated successfully!", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
});

module.exports = router;