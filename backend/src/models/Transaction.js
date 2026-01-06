const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Organization",
    },
    
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    
    category: {
      type: String,
      required: true,
    },
    
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    
    currency: {
      type: String,
      required: true,
    },
    
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    
    description: {
      type: String,
      trim: true,
    },
    
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "credit_card", "debit_card", "cheque", "upi", "other"],
    },
    
    reference: {
      type: String,
      trim: true,
    },
    
    attachments: [String],
    
    tags: [String],
    
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
transactionSchema.index({ organizationId: 1, date: -1 });
transactionSchema.index({ organizationId: 1, type: 1, deletedAt: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);