import api from "./api";

// Dashboard summary cards
export const getDashboardStats = () =>
  api.get("/dashboard");

