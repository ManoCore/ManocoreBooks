const jwt = require("jsonwebtoken");
const User = require("../models/User");

const ROLE_PERMISSIONS = {
  Admin: {
    createInvoice: true,
    editInvoice: true,
    deleteInvoice: true,
    recurringInvoice: true,
    viewReports: true,
    manageIntegrations: true,
    manageUsers: true,
    approvePayments: true,
    trashRestore: true,
  },
  Manager: {
    createInvoice: true,
    editInvoice: true,
    deleteInvoice: false,
    recurringInvoice: true,
    viewReports: true,
    manageIntegrations: false,
    manageUsers: false,
    approvePayments: true,
    trashRestore: true,
  },
  Finance: {
    createInvoice: true,
    editInvoice: true,
    deleteInvoice: false,
    recurringInvoice: true,
    viewReports: true,
    manageIntegrations: false,
    manageUsers: false,
    approvePayments: true,
    trashRestore: true,
  },
};

//protect middleware
exports.protect = async (req, res, next) => {
  try {
    let token =
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null;

    if (!token) return res.status(401).json({ message: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid user" });
    req.user = {
      id: user._id,
      role: user.role,
      organizationId: user.organizationId,
      permissions: ROLE_PERMISSIONS[user.role],
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Access denied", error: err.message });
  }
};
exports.allow = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions[permission]) {
      return res
        .status(403)
        .json({ message: "Permission denied: " + permission });
    }
    next();
  };
};

