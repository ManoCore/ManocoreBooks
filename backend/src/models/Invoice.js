const mongoose = require("mongoose");
const invoiceSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Organization",
    },
    clientId: {type: mongoose.Schema.Types.ObjectId,ref: "Client",required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    issueDate: { type: Date, default: Date.now },
    dueDate: Date,
    items: {
      type: Array,
      required: true,
    },
    currency: { type: String, required: true },
    discount: Number,
    taxType: String,
    amount: Number,
    notes: String,
    attachments: Array,
    template: String,
    status: {
      type: String,
      enum: ["draft", "pending", "paid", "overdue", "cancelled"],
      default: "pending",
    },
    recurring: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String },
      specificDay: Number,
      customDays: Number,
      startDate: Date,
      nextRunAt: Date,
      endDate: Date,
      paused: { type: Boolean, default: false },
      autoSend: { type: Boolean, default: false },
      autoCharge: { type: Boolean, default: false },
      lastRunAt: Date,
      runCount: { type: Number, default: 0 },
    },
    parentRecurringId: { type: mongoose.Schema.Types.ObjectId },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;


