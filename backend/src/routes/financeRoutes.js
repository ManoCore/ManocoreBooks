const express = require("express");
const { protect, allow } = require("../middleware/auth");
const Transaction = require("../models/Transaction");
const json2csv = require("json2csv").parse;
const PDFDocument = require("pdfkit");

const router = express.Router();

// Get KPI Cards (Total Income, Expenses, Net Profit)
router.get("/kpi", protect, async (req, res) => {
  try {
    const { startDate, endDate, currency } = req.query;
    
    const filters = {
      organizationId: req.user.organizationId,
      deletedAt: null,
    };
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }
    
    if (currency) filters.currency = currency;

    // Aggregate income
    const incomeResult = await Transaction.aggregate([
      { $match: { ...filters, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Aggregate expenses
    const expenseResult = await Transaction.aggregate([
      { $match: { ...filters, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpenses = expenseResult[0]?.total || 0;
    const netProfit = totalIncome - totalExpenses;

    res.json({
      totalIncome,
      totalExpenses,
      netProfit,
      currency: currency || "mixed",
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching KPI data", error: err.message });
  }
});

// Get all transactions with filters
router.get("/transactions", protect, async (req, res) => {
  try {
    const { type, startDate, endDate, currency, category, page = 1, limit = 50 } = req.query;
    
    const filters = {
      organizationId: req.user.organizationId,
      deletedAt: null,
    };
    
    if (type) filters.type = type;
    if (currency) filters.currency = currency;
    if (category) filters.category = category;
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await Transaction.find(filters)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("clientId", "clientName email");

    const total = await Transaction.countDocuments(filters);

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching transactions", error: err.message });
  }
});

// Create transaction
router.post("/transactions", protect, allow("createInvoice"), async (req, res) => {

  try {
    const transaction = new Transaction({
      ...req.body,
      organizationId: req.user.organizationId,
    });
    
    await transaction.save();
    
    res.status(201).json({ message: "Transaction created successfully", transaction });
  } catch (err) {
    res.status(500).json({ message: "Error creating transaction", error: err.message });
  }
});

// Update transaction
router.put("/transactions/:id", protect, allow("editInvoice"), async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
      deletedAt: null,
    });
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    Object.assign(transaction, req.body);
    await transaction.save();
    
    res.json({ message: "Transaction updated successfully", transaction });
  } catch (err) {
    res.status(500).json({ message: "Error updating transaction", error: err.message });
  }
});

// Delete transaction (soft delete)
router.delete("/transactions/:id", protect, allow("trashRestore"), async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });
    
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    transaction.deletedAt = new Date();
    await transaction.save();
    
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting transaction", error: err.message });
  }
});

// Export transactions as CSV
router.get("/export/csv", protect, async (req, res) => {
  try {
    const { type, startDate, endDate, currency } = req.query;
    
    const filters = {
      organizationId: req.user.organizationId,
      deletedAt: null,
    };
    
    if (type) filters.type = type;
    if (currency) filters.currency = currency;
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filters)
      .populate("clientId", "clientName")
      .sort({ date: -1 })
      .lean();

    const csvData = transactions.map(t => ({
      date: t.date.toISOString().split('T')[0],
      type: t.type,
      category: t.category,
      amount: t.amount,
      currency: t.currency,
      description: t.description || "",
      client: t.clientId?.clientName || "",
      paymentMethod: t.paymentMethod || "",
      reference: t.reference || "",
    }));

    const csv = json2csv(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment("transactions.csv");
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "CSV export error", error: err.message });
  }
});

// Export transactions as PDF
router.get("/export/pdf", protect, async (req, res) => {
  try {
    const { type, startDate, endDate, currency } = req.query;
    
    const filters = {
      organizationId: req.user.organizationId,
      deletedAt: null,
    };
    
    if (type) filters.type = type;
    if (currency) filters.currency = currency;
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filters)
      .populate("clientId", "clientName")
      .sort({ date: -1 });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=transactions.pdf");
    doc.pipe(res);

    doc.fontSize(20).text("Transaction Report", { align: "center" });
    doc.moveDown();
    
    if (startDate || endDate) {
      doc.fontSize(10).text(
        `Period: ${startDate || "Start"} to ${endDate || "Present"}`,
        { align: "center" }
      );
      doc.moveDown();
    }

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      const dateStr = t.date.toISOString().split('T')[0];
      const amount = `${t.currency} ${t.amount.toFixed(2)}`;
      
      doc.fontSize(10).text(
        `${dateStr} | ${t.type.toUpperCase()} | ${t.category} | ${amount} | ${t.description || ""}`,
        { width: 500 }
      );
      
      if (t.type === "income") totalIncome += t.amount;
      if (t.type === "expense") totalExpense += t.amount;
    });

    doc.moveDown();
    doc.fontSize(12).text(`Total Income: ${totalIncome.toFixed(2)}`, { bold: true });
    doc.text(`Total Expenses: ${totalExpense.toFixed(2)}`, { bold: true });
    doc.text(`Net Profit: ${(totalIncome - totalExpense).toFixed(2)}`, { bold: true });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: "PDF export error", error: err.message });
  }
});

// Get transaction categories summary
router.get("/categories", protect, async (req, res) => {
  try {
    const { type, startDate, endDate, currency } = req.query;
    
    const filters = {
      organizationId: req.user.organizationId,
      deletedAt: null,
    };
    
    if (type) filters.type = type;
    if (currency) filters.currency = currency;
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    const categories = await Transaction.aggregate([
      { $match: filters },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
});

module.exports = router;