const sendEmail = require("../utils/sendEmail");
const { generateAndStoreOTP, verifyOTP } = require("../utils/otpService");
const User = require("../models/User");

//send otp
exports.sendOtpHandler = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Optional but recommended: check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = await generateAndStoreOTP(email);

    await sendEmail({
      email,
      subject: "Your Manocore Books OTP Code",
      message: `
        <p>Your verification OTP is: <b>${otp}</b></p>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

//verify otp
exports.verifyOtpHandler = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const isValid = await verifyOTP(email, otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Example post-verification action
    await User.updateOne(
      { email },
      { $set: { isEmailVerified: true } }
    );

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
};
