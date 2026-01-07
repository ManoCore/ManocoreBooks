const mongoose = require("mongoose");
const clientSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Organization",
    },
    clientName: {
      type: String,
      required: true,
    },
    email: { type: String, unique: true },
    phone: String,
    address: String,
    country: String,
    state: String,
    taxId: String,
    defaultCurrency: String,
    paymentPreference: String,
    bankDetails: {
      accountNumber: String,
      accountName: String,
      bankName: String,
      ifsc: String,
      swift: String,
      iban: String,
    },
    invoicePrefix: {
      type: String,
      required: true,
    },
    deletedAt: { type: Date, default: null },
},
  { timestamps: true }
);
module.exports = mongoose.model("Client", clientSchema);
