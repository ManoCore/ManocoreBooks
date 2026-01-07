const express = require("express");
const { protect, allow } = require("../middleware/auth");

const Client = require("../models/Client");
const Invoice = require("../models/Invoice");
const router = express.Router();

//invoice generater 
const generateInvoiceNumber = async (clientId) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const client = await Client.findById(clientId);
  if (!client) throw new Error("Client not found");

  const prefix = (client.invoicePrefix || "INV").toUpperCase();
  const base = `${prefix}-${year}-${month}`;

  let invoice, seq;

  while (true) {
    invoice = await Invoice.findOne({
      invoiceNumber: { $regex: `^${base}-` },
    })
      .sort({ createdAt: -1 })
      .lean();

    seq = invoice
      ? parseInt(invoice.invoiceNumber.split("-").pop()) + 1
      : 1;

    const newNumber = `${base}-${String(seq).padStart(3, "0")}`;

    try {
      await Invoice.updateOne(
        { invoiceNumber: newNumber },
        { $setOnInsert: { invoiceNumber: newNumber, tempLock: true } },
        { upsert: true }
      );
      break; 
    } catch (err) {
      if (err.code === 11000) continue; 
      throw err;
    }
  }

  return `${base}-${String(seq).padStart(3, "0")}`;
};

//create
router.post("/clients/:clientId/invoices",protect,allow("createInvoice"),async (req, res) => {
    try {
      const { clientId } = req.params;
      const invoiceNumber = await generateInvoiceNumber(clientId);
      await Invoice.deleteOne({ invoiceNumber });
      const invoice = new Invoice({
        ...req.body,
        clientId,
        organizationId: req.user.organizationId,
        invoiceNumber,
      });
      if (invoice.recurring && invoice.recurring.enabled) {
        invoice.recurring.nextRunAt = invoice.recurring.startDate;
      }
      await invoice.save();
      res.json({ message: "Invoice created", invoice });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

//get
router.get("/clients/:clientId/invoices", protect, async (req, res) => {
  const invoices = await Invoice.find({
    clientId: req.params.clientId,
    organizationId: req.user.organizationId,
    deletedAt: null,
  }).sort({ createdAt: -1 });

  res.json(invoices);
});

//get recurring 
router.get("/clients/:clientId/recurring", protect, async (req, res) => {
  const recurring = await Invoice.find({
    clientId: req.params.clientId,
    organizationId: req.user.organizationId,
    "recurring.enabled": true,
  });

  res.json(recurring);
});

// update
router.put("/clients/:clientId/invoices/:invoice_id",protect,allow("editInvoice"),async (req, res) => {
    const invoice = await Invoice.findOne({
      _id: req.params.invoice_id,
      clientId: req.params.clientId,
      organizationId: req.user.organizationId,
    });

    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });

    Object.assign(invoice, req.body);
    await invoice.save();

    res.json({ message: "Invoice updated", invoice });
  }
);

//delete invoice
router.delete("/clients/:clientId/invoices/:invoice_id", protect,allow("trashRestore"),async (req, res) => {
    const invoice = await Invoice.findOne({
      _id: req.params.invoice_id,
      clientId: req.params.clientId,
      organizationId: req.user.organizationId,
    });

    if (!invoice)
      return res.status(404).json({ message: "Invoice not found" });

    invoice.deletedAt = new Date();
    await invoice.save();

    res.json({ message: "Invoice deleted" });
  }
);

module.exports = router;
