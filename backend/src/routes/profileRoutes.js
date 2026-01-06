const express = require("express");
const bcrypt = require("bcryptjs");
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const router = express.Router();
//get profile
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
// update prfile
router.put("/", protect, async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      timezone,
      language,
      notificationPreferences
    } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
// Update fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email.toLowerCase();
    if (timezone) user.timezone = timezone;
    if (language) user.language = language;

    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences
      };
    }
// Password update
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    await user.save();
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
