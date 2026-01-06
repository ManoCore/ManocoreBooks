const express = require("express");
const { getDashboardData } = require("../middleware/dashboardController");
const { protect } = require("../middleware/auth");
const Invoice = require("../models/Invoice");

const router = express.Router();

router.get("/", protect, getDashboardData);

module.exports = router;
