const Invoice = require("../models/Invoice");

const getDateFilter = (range) => {
  const today = new Date();
  switch (range) {
    case "7D": return { $gte: new Date(today - 7 * 24 * 60 * 60 * 1000) };
    case "30D": return { $gte: new Date(today - 30 * 24 * 60 * 60 * 1000) };
    case "90D": return { $gte: new Date(today - 90 * 24 * 60 * 60 * 1000) };
    case "YTD": return { $gte: new Date(today.getFullYear(), 0, 1) };
    default: return {};
  }
};

const getDashboardData = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const range = req.query.range || "30D";
    const dateFilter = getDateFilter(range);

    const [totalRevenue, paid, pending, overdue] = await Promise.all([
      Invoice.aggregate([{ $match: { organizationId } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Invoice.countDocuments({ organizationId, status: "paid" }),
      Invoice.countDocuments({ organizationId, status: "pending" }),
      Invoice.countDocuments({ organizationId, status: "overdue" }),
    ]);

    const { search, sortField = "date", sortOrder = "desc", limit = 10 } = req.query;
    const filter = { organizationId };
    if (search) {
      filter.$or = [
        { status: new RegExp(search, "i") },
        { amount: isNaN(search) ? undefined : Number(search) },
      ].filter(Boolean);
    }
    const revenueTrends = await Invoice.aggregate([
      { $match: { organizationId, date: dateFilter } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, total: { $sum: "$amount" } } },
      { $sort: { "_id": 1 } },
    ]);

    const recentTransactions = await Invoice.find(filter)
      .sort({ [sortField]: sortOrder === "desc" ? -1 : 1 })
      .limit(Number(limit))
      .select("clientId amount status date");

    res.json({
      KPIs: {
        totalRevenue: totalRevenue[0]?.total || 0,
        paid,
        pending,
        outstanding: overdue,
      },
      revenueTrends,
      recentTransactions,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

module.exports = { getDashboardData };
