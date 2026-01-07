import api from "./api";

// Dashboard summary cards
export const getDashboardStats = () =>
  api.get("/dashboard/stats");

// Charts data
export const getRevenueChart = () =>
  api.get("/dashboard/revenue");

// Recent invoices
export const getRecentInvoices = () =>
  api.get("/dashboard/recent-invoices");

// Notifications
export const getNotifications = () =>
  api.get("/dashboard/notifications");
