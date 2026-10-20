const express = require('express');
const router = express.Router();
const User = require('../models/User');

// --- 1. CHECK VERIFICATION STATUS ---
// The React frontend will call this to see if it should lock or unlock the Community screen
router.get('/check-verification/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if they meet the strict criteria
    const hasPhone = user.phoneNumber && user.phoneNumber.trim() !== "";
    const hasPhoto = user.profilePhoto && user.profilePhoto.trim() !== "";
    
    // Auto-verify if they have both
    if (hasPhone && hasPhoto && !user.isCommunityVerified) {
      user.isCommunityVerified = true;
      await user.save();
    }

    res.status(200).json({ 
      isVerified: user.isCommunityVerified,
      missingFields: {
        phone: !hasPhone,
        photo: !hasPhoto
      },
      userData: {
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto
      }
    });

  } catch (error) {
    console.error("Verification Check Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// --- 2. SUBMIT VERIFICATION DETAILS ---
// This handles the form submission when a user completes their profile
router.post('/verify-profile', async (req, res) => {
  try {
    const { userId, phoneNumber, profilePhotoUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (profilePhotoUrl) user.profilePhoto = profilePhotoUrl;

    // Check if they are now fully verified
    if (user.phoneNumber && user.profilePhoto) {
      user.isCommunityVerified = true;
    }

    await user.save();

    res.status(200).json({ 
      message: "Profile updated successfully!", 
      isVerified: user.isCommunityVerified 
    });

  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;