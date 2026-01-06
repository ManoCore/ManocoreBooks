const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
const Organization = require("../models/Organization");
const {
  sendOtpHandler,
  verifyOtpHandler,
} = require("../controllers/otpController");
const sendInvoiceEmail =require( "../utils/sendEmail");


const router = express.Router();

router.post("/send-otp", sendOtpHandler);
router.post("/verify-otp", verifyOtpHandler);

//role permissions
const ROLE_PERMISSIONS = {
  Admin: {
    createInvoice: true,
    editInvoice: true,
    deleteInvoice: true,
    recurringInvoice: true,
    viewReports: true,
    manageIntegrations: true,
    manageUsers: true,
    approvePayments: true,
    trashRestore: true,
  },
  Manager: {
    createInvoice: true,
    editInvoice: true,
    deleteInvoice: false,
    recurringInvoice: true,
    viewReports: true,
    manageIntegrations: false,
    manageUsers: false,
    approvePayments: true,
    trashRestore: true,
  },
  Finance: {
    createInvoice: true,
    editInvoice: true,
    deleteInvoice: false,
    recurringInvoice: true,
    viewReports: true,
    manageIntegrations: false,
    manageUsers: false,
    approvePayments: true,
    trashRestore: true,
  },
};

//signup
router.post("/signup", async (req, res) => {
  try {
    let {
      companyName,
      fullName,
      email,
      password,
      confirmPassword,
      country,
      state,
      currency,
      phone,
      timezone,
      taxId,
      businessType,
      acceptedTerms,
      role,
    } = req.body;
    if (
      !companyName || !fullName || !email || !password || !confirmPassword ||
      !country || !state || !currency || !phone || !timezone || !businessType
    ) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }
    if (email !== email.toLowerCase()) {
      return res.status(400).json({ message: "Email must be in lowercase." });
    }
    email = email.toLowerCase().trim();
    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "Password is missing or invalid." });
    }
    password = password.trim();
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ message: "Password must include at least one lowercase letter." });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: "Password must include at least one uppercase letter." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    if (!acceptedTerms) {
      return res.status(400).json({ message: "You must accept the terms and conditions." });
    }
    let organization = await Organization.findOne({ name: companyName });
    if (!organization) {
      organization = new Organization({
        name: companyName,
        country,
        state,
        currency,
        timezone,
        taxId,
        businessType,
      });
      await organization.save();
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "This email is already registered. Please use a different email." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      organizationId: organization._id,
      companyName,
      fullName,
      email,
      password: hashedPassword,
      phone,
      acceptedTerms,
    });
    //role assignment
    const userCount = await User.countDocuments({ organizationId: organization._id });
    if (userCount === 0) {
      user.role = "Admin";
    } else {
      if (!role || !["Manager", "Finance"].includes(role)) {
        return res.status(400).json({
          message: "Role is required and must be either Manager or Finance.",
        });
      }
      user.role = role;
    }
    await user.save();
    const token = jwt.sign(
      { id: user._id, organizationId: organization._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
   res.status(201).json({
      message: "Signup successful!",
      user: {
        id: user._id,
        organizationId: organization._id,
        fullName: user.fullName,
        email: user.email,
        companyName: user.companyName,
        role: user.role,
        permissions: ROLE_PERMISSIONS[user.role],
      },
      token,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    const token = jwt.sign(
      { id: user._id, organizationId: user.organizationId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      message: "Login successful!",
      user: {
        id: user._id,
        organizationId: user.organizationId,
        fullName: user.fullName,
        email: user.email,
        companyName: user.companyName,
        role: user.role,
        permissions: ROLE_PERMISSIONS[user.role],
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/send-set-password-link", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.password) {
  return res.status(400).json({
    message: "Password is already set for this email"
  });
}

    const token = jwt.sign(
      { userId: user._id, purpose: "set-password" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" } 
    );

    const setupLink = `${process.env.FRONTEND_URL}/set-password?token=${token}`;

    await sendInvoiceEmail({
      email: user.email,
      subject: "Set up your Manocore Books Account",
      message: `
        <p>Hello ${user.fullName},</p>
        <p>You have been invited to Manocore Books.</p>
        <p>Please click the link below to set your password:</p>
        <p><a href="${setupLink}">Set Password</a></p>
        <p>This link will expire in 30 minutes.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Password setup link sent successfully",
    });
  } catch (error) {
    console.error("Send Set Password Link Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/set-password", async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Invalid or expired link" });
    }

    if (decoded.purpose !== "set-password") {
      return res.status(400).json({ message: "Invalid token purpose" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password set successfully. You can now login.",
    });
  } catch (error) {
    console.error("Set Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
