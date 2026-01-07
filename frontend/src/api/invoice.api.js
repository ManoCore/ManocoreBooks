import api from "./api";

/**
 * Create a new invoice for a client
 */
export const createInvoice = (clientId, data) =>
  api.post(`/clients/${clientId}/invoices`, data);

/**
 * Fetch all invoices for a client
 */
export const fetchInvoices = (clientId) =>
  api.get(`/clients/${clientId}/invoices`);

/**
 * Fetch recurring invoices for a client
 */
export const fetchRecurringInvoices = (clientId) =>
  api.get(`/clients/${clientId}/recurring`);

/**
 * Update an existing invoice
 */
export const updateInvoice = (clientId, invoiceId, data) =>
  api.put(`/clients/${clientId}/invoices/${invoiceId}`, data);

/**
 * Soft delete an invoice
 */
export const deleteInvoice = (clientId, invoiceId) =>
  api.delete(`/clients/${clientId}/invoices/${invoiceId}`);
