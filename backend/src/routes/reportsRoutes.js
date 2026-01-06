const express = require("express");
const { protect } = require("../middleware/auth");
const Transaction = require("../models/Transaction");
const { Invoice } = require("../models/Invoice");
const Client = require("../models/Client");
const json2csv = require("json2csv").parse;
const PDFDocument = require("pdfkit");

const router = express.Router();

//profit or loss
router.get("/profit-loss", protect, async (req, res) => {
  try {
    const { startDate, endDate, currency, clientId } = req.query;
    
    const filters = {
      organizationId: req.user.organizationId,
      deletedAt: null,
    };
    
    if (currency) filters.currency = currency;
    if (clientId) filters.clientId = clientId;
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    // Revenue by category
    const revenue = await Transaction.aggregate([
      { $match: { ...filters, type: "income" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Expenses by category
    const expenses = await Transaction.aggregate([
      { $match: { ...filters, type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalRevenue = revenue.reduce((sum, r) => sum + r.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;

    res.json({
      period: {
        startDate: startDate || "Beginning",
        endDate: endDate || "Present",
      },
      revenue: {
        categories: revenue,
        total: totalRevenue,
      },
      expenses: {
        categories: expenses,
        total: totalExpenses,
      },
      netProfit,
      profitMargin: `${profitMargin}%`,
      currency: currency || "mixed",
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating P&L report", error: err.message });
  }
});

// Export P&L as CSV
router.get("/profit-loss/export/csv", protect, async (req, res) => {
  try {
    const { startDate, endDate, currency, clientId } = req.query;
    
    const filters = {
      organizationId: req.user.organizationId,
      deletedAt: null,
    };
    
    if (currency) filters.currency = currency;
    if (clientId) filters.clientId = clientId;
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filters)
      .sort({ category: 1, date: -1 })
      .lean();

    const csvData = transactions.map(t => ({
      date: t.date.toISOString().split('T')[0],
      type: t.type,
      category: t.category,
      amount: t.amount,
      currency: t.currency,
      description: t.description || "",
    }));

    const csv = json2csv(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment("profit-loss-report.csv");
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "CSV export error", error: err.message });
  }
});

// Export P&L as PDF
router.get("/profit-loss/export/pdf", protect, async (req, res) => {
  try {
    const { startDate, endDate, currency } = req.query;
    
    const filters = {
      organizationId: req.user.organizationId,
      deletedAt: null,
    };
    
    if (currency) filters.currency = currency;
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    const revenue = await Transaction.aggregate([
      { $match: { ...filters, type: "income" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const expenses = await Transaction.aggregate([
      { $match: { ...filters, type: "expense" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(20).text("Profit & Loss Statement", { align: "center", underline: true });
    doc.moveDown();
    doc.fontSize(10).text(`Period: ${startDate || "Start"} to ${endDate || "Present"}`, { align: "center" });
    doc.moveDown(2);

    // Revenue Section
    doc.fontSize(14).text("REVENUE", { underline: true });
    doc.moveDown(0.5);
    let totalRevenue = 0;
    revenue.forEach((r) => {
      doc.fontSize(11).text(`${r._id}: ${r.total.toFixed(2)}`);
      totalRevenue += r.total;
    });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total Revenue: ${totalRevenue.toFixed(2)}`, { bold: true });
    doc.moveDown(2);

    // Expenses Section
    doc.fontSize(14).text("EXPENSES", { underline: true });
    doc.moveDown(0.5);
    let totalExpenses = 0;
    expenses.forEach((e) => {
      doc.fontSize(11).text(`${e._id}: ${e.total.toFixed(2)}`);
      totalExpenses += e.total;
    });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total Expenses: ${totalExpenses.toFixed(2)}`, { bold: true });
    doc.moveDown(2);

    // Net Profit
    const netProfit = totalRevenue - totalExpenses;
    doc.fontSize(16).text(`NET PROFIT: ${netProfit.toFixed(2)}`, { bold: true, underline: true });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: "PDF export error", error: err.message });
  }
});

//BALANCE SHEET REPORT
router.get("/balance-sheet", protect, async (req, res) => {
  try {
    const { asOfDate, currency } = req.query;
    
    const filters = {
      organizationId: req.user.organizationId,
      deletedAt: null,
    };
    
    if (currency) filters.currency = currency;
    
    if (asOfDate) {
      filters.date = { $lte: new Date(asOfDate) };
    }

    // Assets calculation (cumulative income)
    const assetsResult = await Transaction.aggregate([
      { $match: { ...filters, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Liabilities calculation (cumulative expenses)
    const liabilitiesResult = await Transaction.aggregate([
      { $match: { ...filters, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalAssets = assetsResult[0]?.total || 0;
    const totalLiabilities = liabilitiesResult[0]?.total || 0;
    const equity = totalAssets - totalLiabilities;

    res.json({
      asOfDate: asOfDate || new Date().toISOString().split('T')[0],
      assets: {
        currentAssets: totalAssets,
        total: totalAssets,
      },
      liabilities: {
        currentLiabilities: totalLiabilities,
        total: totalLiabilities,
      },
      equity: {
        retainedEarnings: equity,
        total: equity,
      },
      totalLiabilitiesAndEquity: totalLiabilities + equity,
      currency: currency || "mixed",
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating balance sheet", error: err.message });
  }
});

// Export Balance Sheet as PDF
router.get("/balance-sheet/export/pdf", protect, async (req, res) => {
  try {
    const { asOfDate, currency } = req.query;
    
    const filters = {
      organizationId: req.user.organizationId,
      deletedAt: null,
    };
    
    if (currency) filters.currency = currency;
    if (asOfDate) filters.date = { $lte: new Date(asOfDate) };

    const assetsResult = await Transaction.aggregate([
      { $match: { ...filters, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const liabilitiesResult = await Transaction.aggregate([
      { $match: { ...filters, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalAssets = assetsResult[0]?.total || 0;
    const totalLiabilities = liabilitiesResult[0]?.total || 0;
    const equity = totalAssets - totalLiabilities;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(20).text("Balance Sheet", { align: "center", underline: true });
    doc.moveDown();
    doc.fontSize(10).text(`As of: ${asOfDate || new Date().toISOString().split('T')[0]}`, { align: "center" });
    doc.moveDown(2);

    doc.fontSize(14).text("ASSETS");
    doc.fontSize(11).text(`Current Assets: ${totalAssets.toFixed(2)}`);
    doc.fontSize(12).text(`Total Assets: ${totalAssets.toFixed(2)}`, { bold: true });
    doc.moveDown(2);

    doc.fontSize(14).text("LIABILITIES");
    doc.fontSize(11).text(`Current Liabilities: ${totalLiabilities.toFixed(2)}`);
    doc.fontSize(12).text(`Total Liabilities: ${totalLiabilities.toFixed(2)}`, { bold: true });
    doc.moveDown(2);

    doc.fontSize(14).text("EQUITY");
    doc.fontSize(11).text(`Retained Earnings: ${equity.toFixed(2)}`);
    doc.fontSize(12).text(`Total Equity: ${equity.toFixed(2)}`, { bold: true });
    doc.moveDown(2);

    doc.fontSize(14).text(`Total Liabilities & Equity: ${(totalLiabilities + equity).toFixed(2)}`, { bold: true });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: "PDF export error", error: err.message });
  }
});

//CASH FLOW REPORT
router.get("/cash-flow", protect, async (req, res) => {
  try {
    const { startDate, endDate, currency, clientId } = req.query;
    
    const filters = {
      organizationId: req.user.organizationId,
      deletedAt: null,
    };
    
    if (currency) filters.currency = currency;
    if (clientId) filters.clientId = clientId;
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    // Cash inflows (income)
    const inflows = await Transaction.aggregate([
      { $match: { ...filters, type: "income" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Cash outflows (expenses)
    const outflows = await Transaction.aggregate([
      { $match: { ...filters, type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalInflows = inflows.reduce((sum, i) => sum + i.total, 0);
    const totalOutflows = outflows.reduce((sum, o) => sum + o.total, 0);
    const netCashFlow = totalInflows - totalOutflows;

    res.json({
      period: {
        startDate: startDate || "Beginning",
        endDate: endDate || "Present",
      },
      inflows: {
        categories: inflows,
        total: totalInflows,
      },
      outflows: {
        categories: outflows,
        total: totalOutflows,
      },
      netCashFlow,
      currency: currency || "mixed",
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating cash flow report", error: err.message });
  }
});

// Export Cash Flow as CSV
router.get("/cash-flow/export/csv", protect, async (req, res) => {
  try {
    const { startDate, endDate, currency } = req.query;
    
    const filters = {
      organizationId: req.user.organizationId,
      deletedAt: null,
    };
    
    if (currency) filters.currency = currency;
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filters)
      .sort({ date: -1 })
      .lean();

    const csvData = transactions.map(t => ({
      date: t.date.toISOString().split('T')[0],
      type: t.type === "income" ? "Inflow" : "Outflow",
      category: t.category,
      amount: t.amount,
      currency: t.currency,
      description: t.description || "",
    }));

    const csv = json2csv(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment("cash-flow-report.csv");
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "CSV export error", error: err.message });
  }
});

// Export Cash Flow as PDF
router.get("/cash-flow/export/pdf", protect, async (req, res) => {
  try {
    const { startDate, endDate, currency } = req.query;
    
    const filters = {
      organizationId: req.user.organizationId,
      deletedAt: null,
    };
    
    if (currency) filters.currency = currency;
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    const inflows = await Transaction.aggregate([
      { $match: { ...filters, type: "income" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const outflows = await Transaction.aggregate([
      { $match: { ...filters, type: "expense" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(20).text("Cash Flow Statement", { align: "center", underline: true });
    doc.moveDown();
    doc.fontSize(10).text(`Period: ${startDate || "Start"} to ${endDate || "Present"}`, { align: "center" });
    doc.moveDown(2);

    // Inflows
    doc.fontSize(14).text("CASH INFLOWS", { underline: true });
    doc.moveDown(0.5);
    let totalInflows = 0;
    inflows.forEach((i) => {
      doc.fontSize(11).text(`${i._id}: ${i.total.toFixed(2)}`);
      totalInflows += i.total;
    });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total Inflows: ${totalInflows.toFixed(2)}`, { bold: true });
    doc.moveDown(2);

    // Outflows
    doc.fontSize(14).text("CASH OUTFLOWS", { underline: true });
    doc.moveDown(0.5);
    let totalOutflows = 0;
    outflows.forEach((o) => {
      doc.fontSize(11).text(`${o._id}: ${o.total.toFixed(2)}`);
      totalOutflows += o.total;
    });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total Outflows: ${totalOutflows.toFixed(2)}`, { bold: true });
    doc.moveDown(2);

    // Net Cash Flow
    const netCashFlow = totalInflows - totalOutflows;
    doc.fontSize(16).text(`NET CASH FLOW: ${netCashFlow.toFixed(2)}`, { bold: true, underline: true });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: "PDF export error", error: err.message });
  }
});

module.exports = router;