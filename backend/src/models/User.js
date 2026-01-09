const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    companyName: { type: String, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    password: { type: String, minlength: 8 },
    passwordSet: { type: Boolean, default: false },

    phone: { type: String,  trim: true },
    acceptedTerms: {type: Boolean,default: false},
    role: { type: String,enum: ["Admin", "Manager", "Finance","Client"],default: "Admin",required: true,
    timezone: { type: String, default: "Asia/Kolkata" },
    language: { type: String, default: "en" },
     resetPasswordToken: String,
    resetPasswordExpire: Date,
    notificationPreferences: {
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true }
}
  }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
