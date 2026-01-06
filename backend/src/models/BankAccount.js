const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true }, // store encrypted later
    confirmAccountNumber: { type: String, required: true },
    ifsc: { type: String }, // India only
    swift: { type: String },
    iban: { type: String },
    accountHolderName: { type: String, required: true },
    accountType: {
      type: String,
      enum: ["Savings", "Current", "Checking"],
      required: true,
    },
    currency: { type: String, required: true },
    ledger: { type: String },
    customFields: [
      {
        label: String,
        value: String,
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("BankAccount", bankAccountSchema);
