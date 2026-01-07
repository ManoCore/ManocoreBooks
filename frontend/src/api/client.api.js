// src/api/client.api.js
import api from "./api";


// Create client
export const createClient = (payload) =>
  api.post("/clients", payload);

// Get all clients (filters optional)
export const fetchClients = (params = {}) =>
  api.get("/clients", { params });

// Update client
export const updateClient = (clientId, payload) =>
  api.put(`/clients/${clientId}`, payload);

// Soft delete client
export const deleteClient = (clientId) =>
  api.delete(`/clients/${clientId}`);



// Get invoices of a client
export const fetchClientInvoices = (clientId) =>
  api.get(`/clients/${clientId}/invoices`);

// Get recurring invoices
export const fetchClientRecurringInvoices = (clientId) =>
  api.get(`/clients/${clientId}/recurring`);




// Export CSV
export const exportClientsCSV = () =>
  api.get("/clients/export/csv", {
    responseType: "blob",
  });

// Export PDF
export const exportClientsPDF = () =>
  api.get("/clients/export/pdf", {
    responseType: "blob",
  });
