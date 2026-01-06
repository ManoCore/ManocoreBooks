const otpGenerator = require("otp-generator");
const redisClient = require("../config/redis");

const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const OTP_PREFIX = "otp:books"; // namespace to avoid collision

/**
 * Generate and store OTP
 */
exports.generateAndStoreOTP = async (email) => {
  if (!email) {
    throw new Error("Email is required for OTP generation");
  }

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  const key = `${OTP_PREFIX}:${email}`;

  // Store OTP with expiry
  await redisClient.set(key, otp, "EX", OTP_EXPIRY_SECONDS);

  return otp;
};

/**
 * Verify OTP
 */
exports.verifyOTP = async (email, enteredOtp) => {
  if (!email || !enteredOtp) return false;

  const key = `${OTP_PREFIX}:${email}`;
  const storedOtp = await redisClient.get(key);

  if (!storedOtp) return false;
  if (storedOtp !== enteredOtp) return false;

  // OTP verified → delete immediately
  await redisClient.del(key);

  return true;
};
