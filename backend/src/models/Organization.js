const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  currency: { type: String, required: true },
  timezone: { type: String, required: true },
  taxId: { type: String },
  businessType: { type: String, required: true },
  invoicePrefix: { type: String, default: null },
  logo: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Organization", organizationSchema);

