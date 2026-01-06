const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const BankAccount = require("../models/BankAccount");
const Organization = require("../models/Organization");
//Mask account number helper
function maskAccount(num) {
  return num.replace(/\d(?=\d{4})/g, "X");
}
//POST

router.post("/:id/bank-accounts", protect, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const {
      bankName,
      accountNumber,
      confirmAccountNumber,
      ifsc,
      swift,
      iban,
      accountHolderName,
      accountType,
      currency,
      ledger,
      customFields
    } = req.body;

    // Required fields
    if (!bankName || !accountNumber || !confirmAccountNumber || !accountHolderName || !accountType || !currency) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }
    if (accountNumber !== confirmAccountNumber) {
      return res.status(400).json({ message: "Account numbers do not match." });
    }
    const org = await Organization.findById(organizationId);
    if (!org) {
      return res.status(404).json({ message: "Organization not found." });
    }
    if (org.country === "India") {
      if (!ifsc) {
        return res.status(400).json({ message: "IFSC code required for Indian accounts." });
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(ifsc)) {
        return res.status(400).json({ message: "Invalid IFSC format." });
      }
    }
    // Create bank account record
    const bank = new BankAccount({
      organizationId,
      bankName,
      accountNumber,
      confirmAccountNumber,
      ifsc,
      swift,
      iban,
      accountHolderName,
      accountType,
      currency,
      ledger,
      customFields
    });
    await bank.save();
    res.status(201).json({
      success: true,
      message: "Bank account added successfully",
      data: {
        id: bank._id,
        bankName: bank.bankName,
        accountNumberMasked: maskAccount(bank.accountNumber),
        currency: bank.currency,
        accountType: bank.accountType
      }
    });
  } catch (error) {
    console.error("Add Bank Account Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// GET — List All Bank Accounts 

router.get("/:id/bank-accounts",protect, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const accounts = await BankAccount.find({ organizationId });
    const formatted = accounts.map(acc => ({
      id: acc._id,
      bankName: acc.bankName,
      accountNumberMasked: maskAccount(acc.accountNumber),
      currency: acc.currency,
      accountType: acc.accountType,
      createdAt: acc.createdAt
    }));
    res.status(200).json({
      success: true,
      bankAccounts: formatted
    });

  } catch (error) {
    console.error("List Bank Accounts Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
