
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");

const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const financeRoutes = require("./routes/financeRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const startRecurringCron = require("./scheduler/recurringCron");
const bankAccountRoutes = require("./routes/bankAccountRoutes");
const roleRoutes = require("./routes/roleRoutes");
const profileRoutes = require("./routes/profileRoutes");
const companyRoutes = require("./routes/companyRoutes");



const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

mongoose
  .connect(process.env.DB)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

app.use("/auth", authRoutes);
app.use("/clients", clientRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/finance", financeRoutes);
app.use("/reports", reportsRoutes);
app.use("/bank", bankAccountRoutes);
app.use("/role", roleRoutes);
app.use("/profile", profileRoutes);
app.use("/company",companyRoutes);
app.use("/", invoiceRoutes);

startRecurringCron();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
