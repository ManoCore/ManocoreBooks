const cron = require("node-cron");
const moment = require("moment");
const Invoice = require("../models/Invoice");
const { Client } = require("../models/Client");
const sendEmail = require("../utils/sendEmail");

//invoice generation 
async function generateInvoiceNumber(clientId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const client = await Client.findById(clientId);
  if (!client) throw new Error("Client not found for recurring invoice");

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
}

//get next run
function getNextRunDate(rec) {
  const now = moment(rec.nextRunAt);

  switch (rec.frequency) {
    case "monthly_first_day":
      return now.add(1, "month").startOf("month").toDate();

    case "monthly_specific_day":
      const day = rec.specificDay || 1;
      const next = now.add(1, "month");
      next.date(day);
      if (next.date() !== day) next.endOf("month");
      return next.toDate();

    case "weekly":
      return now.add(7, "days").toDate();

    case "quarterly":
      return now.add(3, "months").toDate();

    case "yearly":
      return now.add(1, "year").toDate();

    case "custom_days":
      return now.add(rec.customDays || 1, "days").toDate();

    default:
      return now.add(1, "month").startOf("month").toDate();
  }
}

//cron job
const startRecurringCron = () => {
  console.log("Recurring Invoice Cron Started…");
  
  // Run every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    console.log(" Running Recurring Invoice Cron:", new Date().toISOString());

    try {
      const now = new Date();

      const templates = await Invoice.find({
        "recurring.enabled": true,
        "recurring.paused": false,
        "recurring.nextRunAt": { $lte: now },
        deletedAt: null,
      });

      console.log(` ${templates.length} recurring invoices due.`);

      for (const tpl of templates) {
        const runDate = tpl.recurring.nextRunAt;

        if (tpl.recurring.endDate && runDate > tpl.recurring.endDate) {
          tpl.recurring.enabled = false;
          await tpl.save();
          console.log(" Recurring Stopped (End Date Reached)");
          continue;
        }

        const invoiceNumber = await generateInvoiceNumber(tpl.clientId);
        await Invoice.deleteOne({ invoiceNumber }); // Remove lock

        const newInvoice = new Invoice({
          organizationId: tpl.organizationId,
          clientId: tpl.clientId,
          invoiceNumber,
          issueDate: runDate,
          dueDate: moment(runDate).add(7, "days").toDate(),
          items: tpl.items,
          currency: tpl.currency,
          discount: tpl.discount,
          taxType: tpl.taxType,
          amount: tpl.amount,
          notes: tpl.notes,
          attachments: tpl.attachments,
          template: tpl.template,
          status: "pending",
          recurring: { enabled: false },
          parentRecurringId: tpl._id,
        });

        await newInvoice.save();
        console.log(` Recurring Invoice Created → ${newInvoice.invoiceNumber}`);

        if (tpl.recurring.autoSend) {
          try {
            const client = await Client.findById(tpl.clientId);
            if (client?.email) {
              await sendEmail({
                email: client.email,
                subject: `Invoice: ${newInvoice.invoiceNumber}`,
                message: `<p>Your recurring invoice <b>${newInvoice.invoiceNumber}</b> has been generated.</p>`,
              });
              console.log(" Auto Email Sent");
            }
          } catch (emailErr) {
            console.error(" Email Sending Failed:", emailErr);
          }
        }

        if (tpl.recurring.autoCharge) {
          console.log("💳 Auto-charge logic not implemented yet.");
        }

        tpl.recurring.lastRunAt = runDate;
        tpl.recurring.nextRunAt = getNextRunDate(tpl.recurring);
        tpl.recurring.runCount += 1;

        await tpl.save();
      }
    } catch (err) {
      console.error(" Recurring Cron Error:", err);
    }
  });
};

module.exports = startRecurringCron;
