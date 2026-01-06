const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { protect } = require("../middleware/auth");
const User = require("../models/User");

//admin only can change role
const allowAdminOnly = (req, res, next) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Access denied. Only Admin users can manage roles."
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// Assign role
router.post("/:companyId/roles", protect, allowAdminOnly, async (req, res) => {
  try {
    const { companyId } = req.params;
    const { userId, role } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId format." });
    }
    if (!mongoose.isValidObjectId(companyId)) {
      return res.status(400).json({ message: "Invalid companyId format." });
    }
    const validRoles = ["Admin", "Manager", "Finance"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role value." });
    }
    const user = await User.findOne({ _id: userId, organizationId: companyId });
    if (!user) {
      return res.status(404).json({ message: "User not found in this company." });
    }
    user.role = role;
    await user.save();
    res.status(200).json({
      success: true,
      message: "User role assigned successfully.",
      user,
    });
  } catch (error) {
    console.error("Assign Role Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// Update role
router.put("/:companyId/roles/:userId", protect, allowAdminOnly, async (req, res) => {
  try {
    const { companyId, userId } = req.params;
    const { role } = req.body;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId format." });
    }
    if (!mongoose.isValidObjectId(companyId)) {
      return res.status(400).json({ message: "Invalid companyId format." });
    }
    const validRoles = ["Admin", "Manager", "Finance"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role value." });
    }
    const user = await User.findOne({ _id: userId, organizationId: companyId });
    if (!user) {
      return res.status(404).json({ message: "User not found in this organization." });
    }
    user.role = role;
    await user.save();
    res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Update Role Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
module.exports = router;
