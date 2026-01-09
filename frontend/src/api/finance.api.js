// finance.api.js
import api from "./api";


// Get KPI cards (Total Income, Expenses, Net Profit)
export const getFinanceKPI = (params = {}) => {
  return api.get("/finance/kpi", { params });
};



// Get all transactions with filters + pagination
export const getTransactions = (params = {}) => {
  return api.get("/finance/transactions", { params });
};

// Create a transaction
export const createTransaction = (data) => {
  return api.post("/finance/transactions", data);
};

// Update a transaction
export const updateTransaction = (id, data) => {
  return api.put(`/finance/transactions/${id}`, data);
};

// Soft delete a transaction
export const deleteTransaction = (id) => {
  return api.delete(`/finance/transactions/${id}`);
};


// Export transactions as CSV
export const exportTransactionsCSV = (params = {}) => {
  return api.get("/finance/export/csv", {
    params,
    responseType: "blob", // VERY IMPORTANT
  });
};

// Export transactions as PDF
export const exportTransactionsPDF = (params = {}) => {
  return api.get("/finance/export/pdf", {
    params,
    responseType: "blob", 
  });
};


// Get category summary (for charts)
export const getCategorySummary = (params = {}) => {
  return api.get("/finance/categories", { params });
};
