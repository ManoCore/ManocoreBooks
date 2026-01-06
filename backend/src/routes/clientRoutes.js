const express = require("express");
const { protect, allow } = require("../middleware/auth");
const Client = require("../models/Client");
const { Invoice } = require("../models/Invoice");
const json2csv = require("json2csv").parse;
const PDFDocument = require("pdfkit");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendInvoiceEmail = require("../utils/sendEmail"); 
//create
router.post(
  "/",
  protect,
  allow("createInvoice"),
  async (req, res) => {
    try {
      /* ------------------------------------
         1. Create Client
      ------------------------------------ */
      const client = new Client({
        ...req.body,
        organizationId: req.user.organizationId,
        invoicePrefix: (req.body.invoicePrefix || "INV").toUpperCase(),
      });

      await client.save();

      let inviteStatus = "not_sent";

      /* ------------------------------------
         2. Invite client if email exists
      ------------------------------------ */
      if (client.email) {
        const normalizedEmail = client.email.toLowerCase().trim();

        // Check if login account already exists
        let user = await User.findOne({ email: normalizedEmail });

        // CASE 1: User does NOT exist → create + invite
        if (!user) {
          user = new User({
            organizationId: req.user.organizationId,
            companyName: req.user.companyName,
            fullName: client.clientName || "Client User",
            email: normalizedEmail,
            role: "Finance", // Client access role
            passwordSet: false,
          });

          await user.save();

          inviteStatus = "sent";
        }

        // CASE 2: User exists but password not set → re-invite
        if (user && !user.passwordSet) {
          const token = jwt.sign(
            { userId: user._id, purpose: "set-password" },
            process.env.JWT_SECRET,
            { expiresIn: "30m" }
          );

          const setupLink = `${process.env.FRONTEND_URL}/set-password?token=${token}`;

          await sendInvoiceEmail({
            email: user.email,
            subject: "Set up your Manocore Books account",
            message: `
              <p>Hello ${user.fullName || "there"},</p>
              <p>You have been added as a client in Manocore Books.</p>
              <p>Please set your password to access your account:</p>
              <p><a href="${setupLink}">Set Password</a></p>
              <p>This link expires in 30 minutes.</p>
            `,
          });

          inviteStatus = "sent";
        }

        // CASE 3: User exists & password already set → no invite
        if (user && user.passwordSet) {
          inviteStatus = "already_active";
        }
      }

      /* ------------------------------------
         3. Response
      ------------------------------------ */
      res.status(201).json({
        message: "Client created successfully",
        client,
        inviteStatus, // sent | already_active | not_sent
      });
    } catch (err) {
      console.error("Create Client Error:", err);
      res.status(500).json({
        message: "Error creating client",
        error: err.message,
      });
    }
  }
);


// router.post("/",protect,allow("createinvoice"),
//   async (req, res) => {
//     try {
//       const client = new Client({
//         ...req.body,
//         organizationId: req.user.organizationId,
//         invoicePrefix: (req.body.invoicePrefix || "INV").toUpperCase(),
//       });
//       await client.save();
//       res.status(201).json({ message: "Client created successfully", client });
//     } catch (err) {
//       res
//         .status(500)
//         .json({ message: "Error creating client", error: err.message });
//     }
//   }
// );
// get 
router.get("/", protect, async (req, res) => {
  try {
    const filters = {
      organizationId: req.user.organizationId,
      deletedAt: null,
    };
    if (req.query.country) filters.country = req.query.country;
    if (req.query.state) filters.state = req.query.state;
    const clients = await Client.find(filters).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching clients", error: err.message });
  }
});
// update invoice
router.put("/:id",protect,allow("editInvoice"),async (req, res) => {
    try {
      const client = await Client.findOne({
        _id: req.params.id,
        organizationId: req.user.organizationId,
      });
      if (!client) return res.status(404).json({ message: "Client not found" });
      if (req.body.invoicePrefix) {
        req.body.invoicePrefix = req.body.invoicePrefix.toUpperCase();
      }
      Object.assign(client, req.body);
      await client.save();
      res.json({ message: "Client updated", client });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error updating client", error: err.message });
    }
  }
);
//delete
router.delete("/:id",protect,allow("trashRestore"),async (req, res) => {
    try {
      const client = await Client.findOne({
        _id: req.params.id,
        organizationId: req.user.organizationId,
      });
      if (!client) return res.status(404).json({ message: "Client not found" });
      client.deletedAt = new Date();
      await client.save();
      res.json({ message: "Client deleted" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error deleting client", error: err.message });
    }
  }
);
// get by invoice id
router.get("/:clientId/invoices", protect, async (req, res) => {
  try {
    const invoices = await Invoice.find({
      clientId: req.params.clientId,
      organizationId: req.user.organizationId,
      deletedAt: null,
    }).sort({ createdAt: -1 });

    res.json(invoices);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching invoices", error: err.message });
  }
});

//recurring invoice
router.get("/:clientId/recurring", protect, async (req, res) => {
  try {
    const recurring = await Invoice.find({
      clientId: req.params.clientId,
      organizationId: req.user.organizationId,
      "recurring.enabled": true,
    });

    res.json(recurring);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching recurring", error: err.message });
  }
});

//export csv
router.get("/export/csv", protect, async (req, res) => {
  try {
    const clients = await Client.find({
      organizationId: req.user.organizationId,
      deletedAt: null,
    });
    const csv = json2csv(clients);
    res.header("Content-Type", "text/csv");
    res.attachment("clients.csv");
    return res.send(csv);
  } catch (err) {
    res
      .status(500)
      .json({ message: "CSV export error", error: err.message });
  }
});

// export pdf
router.get("/export/pdf", protect, async (req, res) => {
  try {
    const clients = await Client.find({
      organizationId: req.user.organizationId,
      deletedAt: null,
    });
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);
    doc.fontSize(18).text("Client List Report", { underline: true });
    doc.moveDown();
    clients.forEach((c) => {
      doc
        .fontSize(12)
        .text(
          `${c.clientName} | ${c.email || "No Email"} | ${
            c.phone || "No Phone"
          } | ${c.country}`
        );
    });

    doc.end();
  } catch (err) {
    res
      .status(500)
      .json({ message: "PDF export error", error: err.message });
  }
});
module.exports = router;
