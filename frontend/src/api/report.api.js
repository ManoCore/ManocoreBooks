import api from "./api";


// Get Profit & Loss data (JSON)
export const getProfitLoss = (params = {}) => {
  return api.get("/reports/profit-loss", { params });
};

// Export Profit & Loss as CSV
export const exportProfitLossCSV = (params = {}) => {
  return api.get("/reports/profit-loss/export/csv", {
    params,
    responseType: "blob",
  });
};

// Export Profit & Loss as PDF
export const exportProfitLossPDF = (params = {}) => {
  return api.get("/reports/profit-loss/export/pdf", {
    params,
    responseType: "blob",
  });
};



// Get Balance Sheet data (JSON)
export const getBalanceSheet = (params = {}) => {
  return api.get("/reports/balance-sheet", { params });
};

// Export Balance Sheet as PDF
export const exportBalanceSheetPDF = (params = {}) => {
  return api.get("/reports/balance-sheet/export/pdf", {
    params,
    responseType: "blob",
  });
};



// Get Cash Flow data (JSON)
export const getCashFlow = (params = {}) => {
  return api.get("/reports/cash-flow", { params });
};

// Export Cash Flow as CSV
export const exportCashFlowCSV = (params = {}) => {
  return api.get("/reports/cash-flow/export/csv", {
    params,
    responseType: "blob",
  });
};

// Export Cash Flow as PDF
export const exportCashFlowPDF = (params = {}) => {
  return api.get("/reports/cash-flow/export/pdf", {
    params,
    responseType: "blob",
  });
};
