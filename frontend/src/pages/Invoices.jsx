
import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import { toast } from "react-hot-toast"; // Recommend installing: npm i react-hot-toast
import { 
  PiInvoiceDuotone 
} from "react-icons/pi";
import { createTransaction } from "../api/finance.api";
import { FaFileInvoice, FaTrashAlt } from "react-icons/fa";
import { CgTemplate } from "react-icons/cg";
import { 
  Pencil, Download, PlusCircle, X, RotateCcw, Trash2, 
  Check, Lock, Code, LayoutTemplate, Loader2, Search, Filter
} from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import {useSelector} from 'react-redux';

// API Imports
import { 
  fetchInvoices, 
  createInvoice, 
  updateInvoice, 
  deleteInvoice 
} from "../api/invoice.api";
import { fetchClients } from "../api/client.api"; 

const createIncomeTransactionFromInvoice = async (invoice) => {

  try {
    const res = await createTransaction({
      type: "income",
      category: "Invoice Payment",
      amount: invoice.amount,
      currency: invoice.currency,
      date: new Date(),
      description: `Payment received for ${invoice.invoiceNumber}`,
      clientId: invoice.clientId,
      invoiceId: invoice._id,
      paymentMethod: "bank_transfer",
      reference: invoice.invoiceNumber,
    });

  } catch (err) {
    console.error(" [TRANSACTION] API error:", err.response?.data || err);
    toast.error("Transaction creation failed");
  }
};



const Invoices = () => {
const isAdmin = useSelector(state => state.auth.user?.role === 'Admin');
const user=useSelector(state=>state.auth.user);
// console.log("user",user)
  // --- Global State ---
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [trashItems, setTrashItems] = useState([]); // Local state for demo (Backend needs 'get trash' endpoint)
  const [loading, setLoading] = useState(true);
  
  // --- Filter State ---
  const [selectedClientId, setSelectedClientId] = useState(""); // Needed because backend is /clients/:id/invoices
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // --- Modal States ---
  const [showForm, setShowForm] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // --- Form/Editing State ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
const [confirmOpen, setConfirmOpen] = useState(false);
const [confirmLoading, setConfirmLoading] = useState(false);
const [confirmConfig, setConfirmConfig] = useState({
  title: "",
  message: "",
  onConfirm: null,
});
  
  // Initial Form State
  const initialFormState = {
    clientId: "",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: "USD",
    status: "pending",
    items: [{ description: "", qty: 1, rate: 0, tax: 0 }],
    notes: "",
    recurring: { enabled: false, frequency: "Monthly" }
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- Template State ---
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const isPro = false;

  // --- 1. Load Data ---
  useEffect(() => {
    loadClients();
  }, []);
  const loadInvoices = async (clientId) => {
  setLoading(true);
  try {
    const res = await fetchInvoices(clientId);
    setInvoices(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Fetch invoices error:", err.response || err);
    toast.error(err.response?.data?.message || "Failed to load invoices");
  } finally {
    setLoading(false);
  }
};

  // When client selection changes, fetch their invoices
  useEffect(() => {
    if (selectedClientId) {
      loadInvoices(selectedClientId);
    } else {
      setInvoices([]); // Or handle "All Invoices" if backend supports it
    }
  }, [selectedClientId]);

  const loadClients = async () => {
    try {
      const res = await fetchClients();
      setClients(res.data);
      // Auto-select first client to show data immediately
      if (res.data.length > 0) setSelectedClientId(res.data[0]._id);
    } catch (err) {
      toast.error("Failed to load clients");
    }
  };

 

  // --- 2. Handlers ---

  // Form Input Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Line Items Logic
  const handleLineItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: "", qty: 1, rate: 0, tax: 0 }]
    }));
  };

  const removeLineItem = (index) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // Calculations
  const calculateTotals = () => {
    const subtotal = formData.items.reduce((acc, item) => acc + (Number(item.qty) * Number(item.rate)), 0);
    // Simple tax calculation logic (sum of individual item taxes)
    const taxTotal = formData.items.reduce((acc, item) => {
       const lineTotal = Number(item.qty) * Number(item.rate);
       return acc + (lineTotal * (Number(item.tax) / 100));
    }, 0);
    return { subtotal, taxTotal, total: subtotal + taxTotal };
  };

  // CRUD Actions
  const handleCreateOpen = () => {
    setEditingInvoice(null);
    setFormData({
      ...initialFormState, 
      clientId: selectedClientId // Default to current view
    }); 
    setShowForm(true);
  };

  const handleEditOpen = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      clientId: invoice.clientId,
      issueDate: invoice.issueDate ? invoice.issueDate.split('T')[0] : "",
      dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : "",
      currency: invoice.currency,
      status: invoice.status || "pending",
      items: invoice.items || [],
      notes: invoice.notes || "",
      recurring: invoice.recurring || { enabled: false }
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientId) return toast.error("Please select a client");

    setIsSubmitting(true);
    const totals = calculateTotals();
    
    const payload = {
      ...formData,
      amount: totals.total, // Ensure total is saved
      subtotal: totals.subtotal,
      tax: totals.taxTotal
    };

    try {
let savedInvoice;

if (editingInvoice) {
  const res = await updateInvoice(
    editingInvoice.clientId,
    editingInvoice._id,
    payload
  );
  savedInvoice = res.data.invoice; 
  toast.success("Invoice updated successfully");
} else {
  const res = await createInvoice(formData.clientId, payload);
  savedInvoice = res.data.invoice; 
  toast.success("Invoice created successfully");
}



      
      setShowForm(false);
      const wasUnpaid =
  editingInvoice && editingInvoice.status !== "paid";
const isNowPaid = savedInvoice.status === "paid";

if (isNowPaid && (!editingInvoice || wasUnpaid)) {
  await createIncomeTransactionFromInvoice(savedInvoice);



}


      loadInvoices(formData.clientId || selectedClientId); 
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };


  

const handleDelete = (invoice) => {
  setConfirmConfig({
    title: "Move Invoice to Trash",
    message: `Are you sure you want to move invoice ${invoice.invoiceNumber} to trash?`,
    onConfirm: async () => {
      setConfirmLoading(true);
      try {
        await deleteInvoice(invoice.clientId, invoice._id);

        setInvoices(prev =>
          prev.filter(i => i._id !== invoice._id)
        );

        setTrashItems(prev => [
          ...prev,
          { ...invoice, deletedAt: new Date().toISOString() },
        ]);

        toast.success("Invoice moved to trash");
      } catch (err) {
        toast.error("Failed to delete invoice");
      } finally {
        setConfirmLoading(false);
        setConfirmOpen(false);
      }
    },
  });

  setConfirmOpen(true);
};



  const handleDownload = (invoice) => {
    toast.success(`Downloading ${invoice.invoiceNumber}...`);
    // Implement actual PDF download logic here calling export endpoint
  };

  // --- 3. Filter Logic ---
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            String(inv.amount).includes(searchTerm);
      const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + (i.amount || 0), 0);
    const totalPending = invoices.filter(i => i.status === 'pending').reduce((acc, i) => acc + (i.amount || 0), 0);
    const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((acc, i) => acc + (i.amount || 0), 0);

    return [
      { label: "paid", amount: totalPaid, color: "bg-gradient-to-r from-green-400 to-emerald-500 border-green-300 text-green-800" },
      { label: "pending", amount: totalPending, color: "bg-gradient-to-r from-yellow-400 to-amber-500 border-yellow-300 text-yellow-800" },
      { label: "overdue", amount: totalOverdue, color: "bg-gradient-to-r from-red-400 to-red-500 text-red-800" },
      { label: "Total Count", amount: invoices.length, color: "bg-gradient-to-r from-blue-400 to-blue-500 border-blue-300 text-blue-800" },
    ];
  }, [invoices]);

  return (
    <Layout>
      <div className="space-y-6 pb-20">

        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-16 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Invoice Management</h2>
            <p className="text-gray-500 mt-1">Track payments and manage billing for your clients.</p>
          </div>

          <div className="flex flex-wrap gap-3">
             {/* Client Selector (Important for backend structure) */}
             <select 
              value={selectedClientId} 
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="" disabled>Select Client Context</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.clientName}</option>
              ))}
            </select>

            <button onClick={handleCreateOpen} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all">
               <PlusCircle size={18} /> Create Invoice
            </button>

            <button onClick={() => setShowTrash(true)} className="p-2.5 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-600 hover:text-red-600 transition-all">
               <FaTrashAlt size={18} />
            </button>
          </div>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className={`p-5 rounded-2xl shadow-sm border ${stat.color} bg-opacity-10 backdrop-blur-sm relative overflow-hidden group`}>
               <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full ${stat.color} opacity-20 blur-xl group-hover:scale-150 transition-transform duration-500`}></div>
               <p className="text-sm font-semibold opacity-80 mb-1">{stat.label}</p>
               <p className="text-2xl font-bold">
                 {typeof stat.amount === 'number' && stat.label !== 'Total Count' ? `$${stat.amount.toLocaleString()}` : stat.amount}
               </p>
            </div>
          ))}
        </div>

        {/* --- Controls --- */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
           <div className="relative grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
              <input 
                type="text" 
                placeholder="Search invoice # or amount..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
           </div>
           <div className="flex gap-3">
              <div className="relative">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                 <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                 >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                 </select>
              </div>
              <button onClick={() => setShowTemplates(true)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium">
                 <CgTemplate size={18}/> Templates
              </button>
           </div>
        </div>

        {/* --- Invoice Table --- */}
        <div className="bg-white shadow-xl shadow-gray-200/40 rounded-2xl overflow-hidden border border-gray-200 animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  {["Invoice ID", "Client", "Amount", "Issued", "Due", "Status", "Actions"].map((header, i) => (
                    <th key={header} className={`px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider ${i === 6 ? "text-right" : "text-left"}`}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                   <tr><td colSpan="7" className="p-10 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2"/> Loading data...</td></tr>
                ) : filteredInvoices.length === 0 ? (
                   <tr><td colSpan="7" className="p-10 text-center text-gray-400">No invoices found for this context.</td></tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="font-mono font-bold text-gray-800 text-sm">{invoice.invoiceNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                         {clients.find(c => c._id === invoice.clientId)?.clientName || "Unknown Client"}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {invoice.amount?.toLocaleString('en-US', { style: 'currency', currency: invoice.currency || 'USD' })}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditOpen(invoice)} className="p-2 text-gray-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-all"><Pencil size={16}/></button>
                          <button onClick={() => handleDownload(invoice)} className="p-2 text-gray-400 hover:text-green-600 bg-white hover:bg-green-50 rounded-lg border border-transparent hover:border-green-100 transition-all"><Download size={16}/></button>
                          {isAdmin && <button onClick={() => handleDelete(invoice)} className="p-2 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all"><Trash2 size={16}/></button>}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

       
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
               {/* Decorative Top Border */}
               <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
               
               {/* Modal Header */}
               <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                       {editingInvoice ? <Pencil size={20} className="text-blue-500"/> : <PlusCircle size={20} className="text-blue-500"/>}
                       {editingInvoice ? "Edit Invoice" : "New Invoice"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 ml-7">
                       {editingInvoice ? `Updating ${editingInvoice.invoiceNumber}` : "Create a new invoice for your client"}
                    </p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
               </div>

               {/* Modal Body */}
               <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     
                     {/* Left: Main Details */}
                     <div className="lg:col-span-2 space-y-8">
                        
                        {/* Section 1: Meta */}
                        <div className="grid grid-cols-2 gap-6">
                           <div className="col-span-2 md:col-span-1">
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Client</label>
                              <select 
                                name="clientId"
                                value={formData.clientId}
                                onChange={handleInputChange}
                                disabled={editingInvoice} // Usually don't change client on edit
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              >
                                 <option value="">Select Client</option>
                                 {clients.map(c => <option key={c._id} value={c._id}>{c.clientName}</option>)}
                              </select>
                           </div>
                           <div className="col-span-2 md:col-span-1">
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Invoice #</label>
                              <div className="relative">
                                 <input disabled value={editingInvoice ? editingInvoice.invoiceNumber : "Auto-generated"} className="w-full p-3 bg-gray-100 border border-gray-200 text-gray-500 rounded-lg font-mono text-sm" />
                                 <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                              </div>
                           </div>
                        </div>

                        {/* Section 2: Dates */}
                        <div className="grid grid-cols-3 gap-4">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Issued</label>
                              <input type="date" name="issueDate" value={formData.issueDate} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500"/>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Due</label>
                              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500"/>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Currency</label>
                              <select name="currency" value={formData.currency} onChange={handleInputChange} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500">
                                 <option value="USD">USD ($)</option>
                                 <option value="EUR">EUR (€)</option>
                                 <option value="INR">INR (₹)</option>
                              </select>
                           </div>
                        </div>

                        <hr className="border-gray-100"/>

                        {/* Section 3: Line Items */}
                        <div>
                           <div className="flex justify-between items-end mb-3">
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Line Items</label>
                              <button type="button" onClick={addLineItem} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">+ Add Item</button>
                           </div>
                           
                           <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                              <table className="w-full text-left">
                                 <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-200">
                                    <tr>
                                       <th className="px-4 py-2 w-5/12">Description</th>
                                       <th className="px-4 py-2 w-2/12">Qty</th>
                                       <th className="px-4 py-2 w-2/12">Rate</th>
                                       <th className="px-4 py-2 w-2/12">Tax %</th>
                                       <th className="px-4 py-2 w-1/12 text-center">X</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                    {formData.items.map((item, index) => (
                                       <tr key={index} className="group hover:bg-gray-50/50">
                                          <td className="p-2"><input type="text" value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} placeholder="Service desc..." className="w-full p-2 rounded border-transparent hover:border-gray-200 focus:border-blue-500 outline-none transition-all"/></td>
                                          <td className="p-2"><input type="number" min="1" value={item.qty} onChange={(e) => handleLineItemChange(index, 'qty', e.target.value)} className="w-full p-2 rounded border-transparent hover:border-gray-200 focus:border-blue-500 outline-none text-right"/></td>
                                          <td className="p-2"><input type="number" min="0" value={item.rate} onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)} className="w-full p-2 rounded border-transparent hover:border-gray-200 focus:border-blue-500 outline-none text-right"/></td>
                                          <td className="p-2"><input type="number" min="0" value={item.tax} onChange={(e) => handleLineItemChange(index, 'tax', e.target.value)} className="w-full p-2 rounded border-transparent hover:border-gray-200 focus:border-blue-500 outline-none text-right text-gray-500"/></td>
                                          <td className="p-2 text-center"><button type="button" onClick={() => removeLineItem(index)} className="text-gray-300 hover:text-red-500"><X size={14}/></button></td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Notes</label>
                           <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" placeholder="Payment terms, thank you note..."></textarea>
                        </div>
                     </div>

                     {/* Right: Summary & Options */}
                     <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                           <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Summary</h4>
                           <div className="space-y-3 text-sm">
                              <div className="flex justify-between text-gray-600">
                                 <span>Subtotal</span>
                                 <span>{calculateTotals().subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-gray-600">
                                 <span>Tax</span>
                                 <span>{calculateTotals().taxTotal.toFixed(2)}</span>
                              </div>
                              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                 <span>Total</span>
                                 <span className="text-blue-600">{calculateTotals().total.toLocaleString('en-US', { style: 'currency', currency: formData.currency })}</span>
                              </div>
                           </div>
                        </div>

                        {/* Status */}
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
                           <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                              <option value="draft">Draft</option>
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="overdue">Overdue</option>
                           </select>
                        </div>

                        {/* Recurring Toggle */}
                        <div className="border border-blue-100 bg-blue-50/50 p-4 rounded-xl">
                           <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer mb-2">
                              <input 
                                 type="checkbox" 
                                 checked={formData.recurring?.enabled} 
                                 onChange={(e) => setFormData(prev => ({ ...prev, recurring: { ...prev.recurring, enabled: e.target.checked } }))} 
                                 className="rounded text-blue-600 focus:ring-blue-500" 
                              />
                              Enable Recurring
                           </label>
                           {formData.recurring?.enabled && (
                              <select 
                                 value={formData.recurring.frequency}
                                 onChange={(e) => setFormData(prev => ({ ...prev, recurring: { ...prev.recurring, frequency: e.target.value } }))}
                                 className="w-full p-2 bg-white border border-gray-200 rounded text-sm mt-1"
                              >
                                 <option>Weekly</option>
                                 <option>Monthly</option>
                                 <option>Quarterly</option>
                                 <option>Annually</option>
                              </select>
                           )}
                        </div>
                     </div>
                  </div>
               </form>

               {/* Modal Footer */}
               <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl font-semibold text-gray-500 hover:bg-gray-200/50 transition-colors">Cancel</button>
                  <button 
                     onClick={handleSubmit} 
                     disabled={isSubmitting}
                     className="px-8 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center gap-2"
                  >
                     {isSubmitting && <Loader2 className="animate-spin" size={18}/>}
                     {editingInvoice ? "Save Changes" : "Generate Invoice"}
                  </button>
               </div>
            </div>
          </div>
        )}

        {showTrash && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl relative overflow-hidden">
               <div className="bg-gray-100 p-5 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><FaTrashAlt className="text-gray-400"/> Trash Bin</h3>
                  <button onClick={() => setShowTrash(false)}><X size={20} className="text-gray-500 hover:text-red-500"/></button>
               </div>
               <div className="p-0 max-h-[60vh] overflow-y-auto">
                  {trashItems.length === 0 ? (
                     <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                        <FaTrashAlt size={40} className="mb-3 opacity-20"/>
                        <p>Trash is empty</p>
                        <p className="text-xs mt-1">Deleted invoices will appear here during this session.</p>
                     </div>
                  ) : (
                     <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                           <tr>
                              <th className="p-4">Invoice</th>
                              <th className="p-4">Deleted On</th>
                              <th className="p-4 text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {trashItems.map((item) => (
                              <tr key={item._id} className="hover:bg-gray-50">
                                 <td className="p-4 font-mono text-sm">{item.invoiceNumber}</td>
                                 <td className="p-4 text-sm text-gray-500">{new Date(item.deletedAt).toLocaleDateString()}</td>
                                 <td className="p-4 text-right gap-2">
                                    <button className="text-green-600 text-xs font-bold px-3 py-1 bg-green-50 rounded-lg hover:bg-green-100">Restore</button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  )}
               </div>
            </div>
          </div>
        )}
        
        {/* Template Modal Placeholder (Reused from your code logic, condensed for brevity) */}
        {showTemplates && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full text-center">
                 <LayoutTemplate size={48} className="mx-auto text-blue-500 mb-4"/>
                 <h3 className="text-xl font-bold mb-2">Template Store</h3>
                 <p className="text-gray-500 mb-6">Select a visual style for your invoices. (Feature integration pending backend support for PDF generation).</p>
                 <button onClick={() => setShowTemplates(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg">Close</button>
              </div>
           </div>
        )}

      </div>
      <ConfirmModal
  open={confirmOpen}
  title={confirmConfig.title}
  message={confirmConfig.message}
  confirmText="Yes, Move"
  cancelText="Cancel"
  loading={confirmLoading}
  onCancel={() => setConfirmOpen(false)}
  onConfirm={confirmConfig.onConfirm}
/>
    </Layout>
  );
};

// --- Helper Component ---
const StatusBadge = ({ status }) => {
   const styles = {
      paid: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      overdue: "bg-red-100 text-red-700 border-red-200",
      draft: "bg-gray-100 text-gray-600 border-gray-200"
   };
   return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.draft}`}>
         {status}
      </span>
   );
};

export default Invoices;
// import React, { useState } from "react";
// import Layout from "../components/Layout";
// import { PiInvoiceDuotone } from "react-icons/pi";
// import { FaFileInvoice } from "react-icons/fa6";
// import { FaTrashAlt } from "react-icons/fa";
// import { CgTemplate } from "react-icons/cg";
// import { 
//   Pencil, 
//   Download, 
//   PlusCircle, 
//   X, 
//   RotateCcw, 
//   Trash2, 
//   Check, 
//   Lock, 
//   Code, 
//   LayoutTemplate 
// } from "lucide-react";

// // Mock Data
// const InvoiceStats = [
//   { label: "Paid", amount: "$68,150", color: "bg-gradient-to-r from-green-400 to-emerald-500 border-green-300 text-green-800" },
//   { label: "Pending", amount: "$38,040", color: "bg-gradient-to-r from-yellow-400 to-amber-500 border-yellow-300 text-yellow-800" },
//   { label: "Overdue", amount: "$15,600", color: "bg-gradient-to-r from-red-400 to-red-500 text-red-800" },
//   { label: "Draft", amount: "3", color: "bg-gradient-to-r from-blue-400 to-blue-500 border-blue-300 text-blue-800" },
// ];

// const initialInvoiceData = [
//   { 
//     id: "INV-2025-01-001", 
//     client: "Acme Corporation", 
//     amount: 12450.00, 
//     currency: "USD",
//     issue: "2025-01-15", 
//     due: "2025-01-30", 
//     status: "Paid" 
//   },
//   { 
//     id: "INV-2025-01-002", 
//     client: "Tech Innovators Ltd", 
//     amount: 8920.00, 
//     currency: "USD",
//     issue: "2025-01-18", 
//     due: "2025-02-02", 
//     status: "Pending" 
//   },
//   { 
//     id: "INV-2025-01-003", 
//     client: "Global Solutions Inc", 
//     amount: 15600.00, 
//     currency: "USD",
//     issue: "2025-01-10", 
//     due: "2025-01-25", 
//     status: "Overdue" 
//   },
//   { 
//     id: "INV-2025-01-004", 
//     client: "Digital Ventures", 
//     amount: 6780.00, 
//     currency: "USD",
//     issue: "2025-01-20", 
//     due: "2025-02-04", 
//     status: "Paid" 
//   },
//   { 
//     id: "INV-2025-01-005", 
//     client: "Smart Systems Co", 
//     amount: 22340.00, 
//     currency: "USD",
//     issue: "2025-01-22", 
//     due: "2025-02-06", 
//     status: "Pending" 
//   },
// ];

// const initialTrashData = [
//   { id: "INV-2499", client: "Old Client LLC", amount: "$4,500", deletedDate: "Jan 20, 2025" },
//   { id: "INV-2498", client: "Bad Debt Inc", amount: "$1,200", deletedDate: "Jan 18, 2025" },
// ];

// const templatesData = [
//   { id: 1, name: "Clean Minimal", type: "Free", color: "bg-white border-gray-200" },
//   { id: 2, name: "Modern Blue", type: "Free", color: "bg-blue-50 border-blue-100" },
//   { id: 3, name: "Corporate Dark", type: "Pro", color: "bg-slate-800 text-white border-slate-700" },
//   { id: 4, name: "Creative Bold", type: "Pro", color: "bg-purple-50 border-purple-200" },
// ];

// const Invoices = () => {
//   // State Management
//   const [invoiceData, setInvoiceData] = useState(initialInvoiceData);
//   const [trashItems, setTrashItems] = useState(initialTrashData);
  
//   // Modals State
//   const [showForm, setShowForm] = useState(false);
//   const [showRecurring, setShowRecurring] = useState(false);
//   const [showTrash, setShowTrash] = useState(false);
//   const [showTemplates, setShowTemplates] = useState(false);

//   // Edit/View State
//   const [editingInvoice, setEditingInvoice] = useState(null);

//   // Template State
//   const [selectedTemplate, setSelectedTemplate] = useState(1);
//   const isPro = false; 

//   // --- Handlers ---

//   // Handle Opening Form for Create
//   const handleCreate = () => {
//     setEditingInvoice(null);
//     setShowForm(true);
//   };

//   // Handle Opening Form for Edit (Pencil) or View (Eye)
//   const handleEdit = (invoice) => {
//     setEditingInvoice(invoice);
//     setShowForm(true);
//   };

//   // Handle Download (Simulated)
//   const handleDownload = (invoice) => {
//     // In a real app, this would fetch a PDF blob
//     const fileName = `${invoice.id}.txt`;
//     const fileContent = `Invoice ID: ${invoice.id}\nClient: ${invoice.client}\nAmount: ${invoice.amount}\nStatus: ${invoice.status}`;
    
//     const element = document.createElement("a");
//     const file = new Blob([fileContent], {type: 'text/plain'});
//     element.href = URL.createObjectURL(file);
//     element.download = fileName;
//     document.body.appendChild(element);
//     element.click();
//     document.body.removeChild(element);
    
//     alert(`Downloading Invoice: ${invoice.id}`);
//   };

//   // NEW: Handle Soft Delete (Moves to Trash)
//   const handleSoftDelete = (invoice) => {
//     if (window.confirm(`Are you sure you want to move ${invoice.id} to trash?`)) {
//       // 1. Create a trash item object (formatting date for display)
//       const deletedItem = {
//         ...invoice,
//         deletedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
//       };

//       // 2. Add to Trash State
//       setTrashItems((prev) => [deletedItem, ...prev]);

//       // 3. Remove from Active Invoice State
//       setInvoiceData((prev) => prev.filter((item) => item.id !== invoice.id));
//     }
//   };

//   const handleRestore = (id) => {
//     const isUnique = !invoiceData.some(inv => inv.id === id);
//     if (!isUnique) {
//       alert(`Error: Invoice ID ${id} already exists in the active list.`);
//       return;
//     }
//     const itemToRestore = trashItems.find((item) => item.id === id);
//     if (itemToRestore) {
//       // Remove the extra 'deletedDate' property when restoring if desired, or keep it.
//       // We map it back to active structure
//       const { ...rest } = itemToRestore; 
      
//       setInvoiceData((prev) => [
//         ...prev, 
//         { ...rest, status: "Draft" } // Set status to draft on restore usually
//       ]);
//       setTrashItems((prev) => prev.filter((item) => item.id !== id));
//       alert(`Invoice ${id} restored successfully.`);
//     }
//   };

//   const handlePermanentDelete = (id) => {
//     if (window.confirm(`Are you sure you want to permanently delete ${id}? This cannot be undone.`)) {
//       setTrashItems((prev) => prev.filter((item) => item.id !== id));
//     }
//   };

//   const handleTemplateSelect = (template) => {
//     if (template.type === "Pro" && !isPro) {
//       alert("This template requires a Pro subscription.");
//       return;
//     }
//     setSelectedTemplate(template.id);
//   };

//   return (
//     <Layout>
//       <div className="bg-white shadow-sm rounded-md mb-19"></div>

//       <div className="space-y-6">

//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
//           <div>
//             <h2 className="text-2xl text-gray-800">Invoice Management</h2>
//             <p className="text-gray-500">Create and manage your invoices</p>
//           </div>

//           {/* Buttons */}
//           <div className="flex flex-wrap gap-3">
            
//             {/* All Invoice */}
//             <button className="relative inline-flex items-center justify-center p-[2px] rounded-md bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 shadow-lg hover:shadow-[0_0_25px_rgba(66,133,244,0.7)] transition-all duration-300 cursor-pointer">
//               <span className="flex items-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-md">
//                 <PiInvoiceDuotone size={18} className="mr-2 text-[#4285F4]" />
//                 All Invoice
//               </span>
//             </button>

//             {/* Create Invoice */}
//             <button
//               onClick={handleCreate}
//               className="relative inline-flex items-center justify-center p-[2px] rounded-md bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 shadow-lg hover:shadow-[0_0_25px_rgba(66,133,244,0.7)] transition-all duration-300 cursor-pointer"
//             >
//               <span className="flex items-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-md">
//                 <PlusCircle size={18} className="mr-2 text-[#4285F4]" />
//                 Create Invoice
//               </span>
//             </button>

//             {/* Recurring Invoice */}
//             <button
//               onClick={() => setShowRecurring(true)}
//               className="relative inline-flex items-center justify-center p-[2px] rounded-md bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 shadow-lg hover:shadow-[0_0_25px_rgba(66,133,244,0.7)] transition-all duration-300 cursor-pointer"
//             >
//               <span className="flex items-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-md">
//                 <FaFileInvoice size={18} className="mr-2 text-[#4285F4]" />
//                 Recurring Invoice
//               </span>
//             </button>

//             {/* Trash Button */}
//             <button 
//               onClick={() => setShowTrash(true)}
//               className="relative inline-flex items-center justify-center p-[2px] rounded-md bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 shadow-lg hover:shadow-[0_0_25px_rgba(66,133,244,0.7)] transition-all duration-300 cursor-pointer">
//               <span className="flex items-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-md">
//                 <FaTrashAlt size={18} className="mr-2 text-[#4285F4]" />
//                 Trash
//               </span>
//             </button>

//             {/* Template Store Button */}
//             <button 
//               onClick={() => setShowTemplates(true)}
//               className="relative inline-flex items-center justify-center p-[2px] rounded-md bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 shadow-lg hover:shadow-[0_0_25px_rgba(66,133,244,0.7)] transition-all duration-300 cursor-pointer">
//               <span className="flex items-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-md">
//                 <CgTemplate size={18} className="mr-2 text-[#4285F4]" />
//                 Template Store
//               </span>
//             </button>

//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {InvoiceStats.map((stat) => (
//             <div
//               key={stat.label}
//               className={`p-4 rounded-lg shadow-md border ${stat.color} transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1`}
//             >
//               <p className="text-sm font-medium mb-1">{stat.label}</p>
//               <p className="text-2xl font-bold">{stat.amount}</p>
//             </div>
//           ))}
//         </div>

//         {/* Search + Filter */}
//         <div className="flex space-x-4 items-center">
//           <input
//             type="text"
//             placeholder="Search invoices..."
//             className="p-2 flex-grow border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
//           />
//           <select className="p-2 border border-gray-300 rounded-md shadow-sm text-gray-900 cursor-pointer">
//             <option>All Status</option>
//             <option>Paid</option>
//             <option>Pending</option>
//             <option>Overdue</option>
//           </select>
//           <button className="bg-white border border-blue-600 text-gray-800 font-medium py-2 px-4 rounded-md shadow-sm hover:bg-blue-50 transition-colors duration-200 flex items-center cursor-pointer">
//             Export
//           </button>
//         </div>

//         {/* TABLE */}
//         <div className="bg-gradient-to-b from-gray-50 to-white shadow-2xl rounded-xl overflow-auto border border-gray-200">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-300">
//               <tr>
//                 {["Invoice ID", "Client", "Amount", "Issue Date", "Due Date", "Status", "Actions"].map((header) => (
//                   <th
//                     key={header}
//                     className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider"
//                   >
//                     {header}
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody className="bg-white divide-y divide-gray-100">
//               {invoiceData.map((invoice, index) => (
//                 <tr
//                   key={invoice.id}
//                   className={`group transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50  ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
//                 >
//                   <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.id}</td>
//                   <td className="px-6 py-4 text-sm text-gray-700">{invoice.client}</td>
//                   <td className="px-6 py-4 text-sm font-bold text-gray-900">{invoice.amount}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">{invoice.issue}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">{invoice.due}</td>
//                   <td className="px-6 py-4 text-sm">
//                     <span
//                       className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                         invoice.status === "Paid"
//                           ? "bg-green-100 text-green-800 border border-green-300"
//                           : invoice.status === "Pending"
//                           ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
//                           : "bg-red-100 text-red-800 border border-red-300"
//                       }`}
//                     >
//                       {invoice.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-sm font-medium">
//                     <div className="flex space-x-3 text-gray-500">
                      
//                       {/* PENCIL ICON: OPEN FORM (EDIT) */}
//                       <button 
//                         onClick={() => handleEdit(invoice)} 
//                         className="hover:text-blue-600 transform hover:scale-110 transition-all duration-200"
//                         title="Edit Invoice"
//                       >
//                         <Pencil size={16} />
//                       </button>

//                       {/* DOWNLOAD ICON: DOWNLOAD INVOICE */}
//                       {/* Note: Changed to Green so it doesn't conflict with Delete (Red) */}
//                       <button 
//                         onClick={() => handleDownload(invoice)}
//                         className="hover:text-green-600 transform hover:scale-110 transition-all duration-200"
//                         title="Download Invoice"
//                       >
//                         <Download size={16} />
//                       </button>
                      
//                       {/* DELETE ICON: MOVE TO TRASH */}
//                       <button 
//                         onClick={() => handleSoftDelete(invoice)}
//                         className="hover:text-red-600 transform hover:scale-110 transition-all duration-200"
//                         title="Move to Trash"
//                       >
//                         <Trash2 size={16} />
//                       </button>

//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* ------------------------------------------------- */}
//         {/*                  TRASH POPUP                      */}
//         {/* ------------------------------------------------- */}
//         {showTrash && (
//           <div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-50 animate-fadeIn">
//             <div className="bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 p-[3px] rounded-2xl shadow-2xl w-[90%] md:w-[800px] animate-scaleIn relative">
//               <div className="bg-white rounded-2xl p-6 shadow-inner border border-gray-100 relative min-h-[400px]">
//                 <button onClick={() => setShowTrash(false)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition-colors"><X size={24} /></button>
//                 <div className="flex items-center gap-3 mb-6  pb-4">
//                   <div className="p-2 bg-red-100 rounded-full text-red-600"><FaTrashAlt size={24} /></div>
//                   <div>
//                     <h3 className="text-2xl font-semibold text-gray-800">Soft-Deleted Invoices</h3>
//                     <p className="text-sm text-gray-500">Restore items or permanently remove them.</p>
//                   </div>
//                 </div>
//                 {trashItems.length === 0 ? (
//                   <div className="flex flex-col items-center justify-center h-64 text-gray-400">
//                     <FaTrashAlt size={48} className="mb-4 opacity-20" />
//                     <p>Trash is empty</p>
//                   </div>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="w-full text-left border-collapse">
//                       <thead>
//                         <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase">
//                           <th className="py-3 px-4 font-medium">Invoice ID</th>
//                           <th className="py-3 px-4 font-medium">Client</th>
//                           <th className="py-3 px-4 font-medium">Amount</th>
//                           <th className="py-3 px-4 font-medium">Deleted Date</th>
//                           <th className="py-3 px-4 font-medium text-right">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-100">
//                         {trashItems.map((item) => (
//                           <tr key={item.id} className="hover:bg-gray-50 transition-colors">
//                             <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.id}</td>
//                             <td className="py-3 px-4 text-sm text-gray-600">{item.client}</td>
//                             <td className="py-3 px-4 text-sm font-bold text-gray-800">{item.amount}</td>
//                             <td className="py-3 px-4 text-sm text-gray-500">{item.deletedDate}</td>
//                             <td className="py-3 px-4 text-right space-x-2">
//                               <button onClick={() => handleRestore(item.id)} className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 border border-green-200"><RotateCcw size={14} className="mr-1.5" /> Restore</button>
//                               <button onClick={() => handlePermanentDelete(item.id)} className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 shadow-sm"><Trash2 size={14} className="mr-1.5" /> Delete</button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ------------------------------------------------- */}
//         {/*               TEMPLATE STORE POPUP                */}
//         {/* ------------------------------------------------- */}
//         {showTemplates && (
//           <div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-50 animate-fadeIn">
//             {/* Wider container for Preview + Options */}
//             <div className="bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 p-[3px] rounded-2xl shadow-2xl w-[95%] md:w-[900px] h-[90vh] md:h-auto animate-scaleIn relative">
//               <div className="bg-white rounded-2xl p-0 shadow-inner border border-gray-100 relative h-full flex flex-col md:flex-row overflow-hidden">
                
//                 {/* Close Button */}
//                 <button
//                   onClick={() => setShowTemplates(false)}
//                   className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-10 bg-white/80 rounded-full p-1"
//                 >
//                   <X size={24} />
//                 </button>

//                 {/* Left Side: Template Grid */}
//                 <div className="w-full md:w-7/12 p-6 bg-gray-50 overflow-y-auto">
//                   <div className="flex items-center gap-3 mb-6">
//                     <div className="p-2 bg-emerald-100 rounded-full bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600  ">
//                       <LayoutTemplate size={24} />
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-bold text-gray-800">Template Store</h3>
//                       <p className="text-sm text-gray-500">2 free templates per company. Pro unlocks all.</p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     {templatesData.map((template) => (
//                       <div 
//                         key={template.id}
//                         onClick={() => handleTemplateSelect(template)}
//                         className={`relative rounded-xl border-2 cursor-pointer transition-all duration-200 overflow-hidden group
//                           ${selectedTemplate === template.id 
//                             ? "border-blue-500 ring-2 ring-purple-200 ring-offset-2" 
//                             : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
//                           }
//                         `}
//                       >
//                         {/* Mock Preview Area */}
//                         <div className={`h-32 ${template.color} flex flex-col p-3`}>
//                           <div className="w-1/3 h-2 bg-current opacity-20 rounded mb-2"></div>
//                           <div className="w-1/2 h-2 bg-current opacity-10 rounded mb-4"></div>
//                           <div className="mt-auto w-full h-8 bg-current opacity-5 rounded-md border border-current border-opacity-10"></div>
//                         </div>

//                         {/* Footer */}
//                         <div className="p-3 bg-white flex justify-between items-center">
//                           <span className="font-semibold text-gray-700">{template.name}</span>
//                           {template.type === "Pro" ? (
//                             <span className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
//                               <Lock size={12} className="mr-1" /> PRO
//                             </span>
//                           ) : (
//                             <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                               FREE
//                             </span>
//                           )}
//                         </div>

//                         {/* Selection Checkmark */}
//                         {selectedTemplate === template.id && (
//                           <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1 shadow-sm">
//                             <Check size={14} />
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Right Side: Options & Customization */}
//                 <div className="w-full md:w-5/12 p-6 flex flex-col bg-white border-l border-gray-100">
                  
//                   {/* Placeholders Info */}
//                   <div className="mb-6">
//                     <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3 flex items-center">
//                       <Code size={16} className="mr-2 text-blue-500" />
//                       Dynamic Placeholders
//                     </h4>
//                     <p className="text-xs text-gray-500 mb-3">Use these tags to auto-fill invoice data.</p>
//                     <div className="flex flex-wrap gap-2">
//                       {["{{company_name}}", "{{client_name}}", "{{total}}", "{{due_date}}", "{{id}}"].map((tag) => (
//                         <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-mono rounded border border-blue-100 select-all">
//                           {tag}
//                         </span>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Custom CSS (Pro Only) */}
//                   <div className="mb-6 flex-grow relative">
//                      <div className="flex justify-between items-center mb-2">
//                         <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
//                           Custom CSS
//                         </h4>
//                         {!isPro && <span className="text-[10px] font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 px-2 py-0.5 rounded-full">PRO ONLY</span>}
//                      </div>
                     
//                      <div className="relative h-full">
//                        <textarea 
//                           disabled={!isPro}
//                           className={`w-full h-40 md:h-full p-3 text-sm font-mono border rounded-lg resize-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
//                             ${!isPro ? "bg-gray-50 text-gray-400" : "bg-gray-800 text-green-400"}
//                           `}
//                           placeholder={isPro ? ".invoice-header { background: #000; }" : "/* Upgrade to Pro to unlock custom CSS styling for your invoices. */"}
//                        ></textarea>
                       
//                        {/* Lock Overlay if not Pro */}
//                        {!isPro && (
//                          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-[1px]">
//                            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 text-center max-w-[200px]">
//                              <Lock size={24} className="mx-auto text-indigo-500 mb-2" />
//                              <p className="text-xs text-gray-600 font-medium">Unlock full customization with Pro Plan.</p>
//                            </div>
//                          </div>
//                        )}
//                      </div>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="pt-4 mt-auto border-t border-gray-100">
//                     <button 
//                       onClick={() => setShowTemplates(false)}
//                       className="w-full  bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg shadow-md transition-all duration-300 font-bold flex justify-center items-center"
//                     >
//                       Apply Template
//                     </button>
//                     {!isPro && (
//                        <p className="text-center text-xs text-gray-400 mt-3">
//                          You are using 1 of 2 free templates.
//                        </p>
//                     )}
//                   </div>

//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//       {/* ------------------------------------------------- */}
//       {/*          CREATE / EDIT INVOICE FORM             */}
//       {/* ------------------------------------------------- */}
//       {showForm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          
//           {/* GRADIENT BORDER CONTAINER */}
//           <div className="bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 p-[3px] rounded-2xl shadow-2xl w-full max-w-4xl animate-scaleIn relative flex flex-col max-h-[90vh]">
            
//             {/* WHITE CONTENT AREA */}
//             <div className="bg-white rounded-xl shadow-inner border border-gray-100 flex flex-col h-full overflow-hidden">
              
//               {/* HEADER - Sticky */}
//               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
//                 <div>
//                   <h3 className="text-2xl font-bold text-gray-800">
//                     {editingInvoice ? "Edit Invoice" : "Create Invoice"}
//                   </h3>
//                   <p className="text-sm text-gray-500">
//                     {editingInvoice ? `Updating details for ${editingInvoice.id}` : "Fill in the details below"}
//                   </p>
//                 </div>
//                 <button 
//                   onClick={() => setShowForm(false)} 
//                   className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
//                 >
//                   <X size={24} />
//                 </button>
//               </div>

//               {/* SCROLLABLE FORM BODY */}
//               <div className="p-6 overflow-y-auto custom-scrollbar">
//                 <form className="space-y-6">
                  
//                   {/* ROW 1: Client & Invoice Meta */}
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
//                     {/* Client Dropdown */}
//                     <div className="md:col-span-2">
//                       <label className="text-sm font-semibold text-gray-700">Client <span className="text-red-500">*</span></label>
//                       <select 
//                         defaultValue={editingInvoice ? "custom" : ""}
//                         className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
//                       >
//                         <option value="">Select existing client</option>
//                         <option value="1">John Doe - Acme Corp</option>
//                         <option value="2">Sarah Smith - Wayne Ent</option>
//                         {editingInvoice && <option value="custom" selected>{editingInvoice.client}</option>}
//                       </select>
//                     </div>

//                     {/* Invoice Number (Auto-gen) */}
//                     <div>
//                       <label className="text-sm font-semibold text-gray-700">Invoice Number</label>
//                       <div className="relative mt-1">
//                         <input 
//                           type="text" 
//                           value={editingInvoice ? editingInvoice.id : `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-001`}
//                           readOnly 
//                           className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed font-mono" 
//                         />
//                         <div className="absolute right-3 top-3 text-green-500">
//                           {editingInvoice ? <Lock size={20} /> : <Check size={20} />}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* ROW 2: Dates & Currency */}
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div>
//                       <label className="text-sm font-semibold text-gray-700">Issue Date <span className="text-red-500">*</span></label>
//                       <input 
//                         type="date" 
//                         defaultValue={editingInvoice ? editingInvoice.issue : new Date().toISOString().split("T")[0]}
//                         className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none" 
//                       />
//                     </div>
//                     <div>
//                       <label className="text-sm font-semibold text-gray-700">Due Date <span className="text-red-500">*</span></label>
//                       <input 
//                         type="date" 
//                         defaultValue={editingInvoice && editingInvoice.due !== "TBD" ? editingInvoice.due : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
//                         className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none" 
//                       />
//                     </div>
//                     <div>
//                       <label className="text-sm font-semibold text-gray-700">Currency <span className="text-red-500">*</span></label>
//                       <select 
//                          defaultValue={editingInvoice ? editingInvoice.currency : "USD"}
//                          className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
//                       >
//                         <option value="USD">USD ($)</option>
//                         <option value="EUR">EUR (€)</option>
//                         <option value="INR">INR (₹)</option>
//                       </select>
//                     </div>
//                   </div>

//                   <hr className="border-gray-100" />

//                   {/* ROW 3: Line Items Table */}
//                   <div>
//                     <label className="text-sm font-semibold text-gray-700 mb-2 block">Line Items <span className="text-red-500">*</span></label>
//                     <div className="border border-gray-200 rounded-lg overflow-hidden">
//                       <table className="w-full text-left bg-gray-50">
//                         <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 text-xs uppercase">
//                           <tr>
//                             <th className="px-4 py-3 w-5/12">Description</th>
//                             <th className="px-4 py-3 w-2/12">Qty</th>
//                             <th className="px-4 py-3 w-2/12">Rate</th>
//                             <th className="px-4 py-3 w-2/12">Tax %</th>
//                             <th className="px-4 py-3 w-1/12 text-right">Total</th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-100">
//                           {[1].map((item, i) => (
//                             <tr key={i}>
//                               <td className="p-2">
//                                 <input 
//                                   type="text" 
//                                   placeholder="Item Name" 
//                                   defaultValue={editingInvoice ? "Consulting Services" : ""}
//                                   className="w-full p-2 border border-transparent hover:border-gray-300 rounded focus:border-blue-400 outline-none" 
//                                 />
//                               </td>
//                               <td className="p-2">
//                                 <input 
//                                   type="number" 
//                                   placeholder="1" 
//                                   defaultValue="1"
//                                   className="w-full p-2 border border-transparent hover:border-gray-300 rounded focus:border-blue-400 outline-none" 
//                                 />
//                               </td>
//                               <td className="p-2">
//                                 <input 
//                                   type="number" 
//                                   placeholder="0.00" 
//                                   defaultValue={editingInvoice ? editingInvoice.amount : ""}
//                                   className="w-full p-2 border border-transparent hover:border-gray-300 rounded focus:border-blue-400 outline-none" 
//                                 />
//                               </td>
//                               <td className="p-2">
//                                 <select className="w-full p-2 border border-transparent hover:border-gray-300 rounded focus:border-blue-400 outline-none text-sm">
//                                   <option>None</option>
//                                   <option>GST (18%)</option>
//                                   <option>VAT (20%)</option>
//                                 </select>
//                               </td>
//                               <td className="p-2 text-right font-medium text-gray-700">
//                                 {editingInvoice ? `$${editingInvoice.amount}` : "$0.00"}
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                       <button type="button" className="w-full py-2 bg-gray-50 text-blue-600 text-sm font-semibold hover:bg-gray-100 transition-colors border-t border-gray-200">
//                         + Add New Item
//                       </button>
//                     </div>
//                   </div>

//                   {/* ROW 4: Financials & Options */}
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
//                     {/* Left: Notes, Template, Files */}
//                     <div className="space-y-4">
//                       <div>
//                         <label className="text-sm font-semibold text-gray-700">Notes</label>
//                         <textarea 
//                           rows={3} 
//                           className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
//                           placeholder="Internal or customer notes..."
//                           defaultValue={editingInvoice ? "Thank you for your business." : ""}
//                         ></textarea>
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                          <div>
//                             <label className="text-sm font-semibold text-gray-700">Template</label>
//                             <select className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none text-sm">
//                               <option>Standard (Free)</option>
//                               <option>Modern (Free)</option>
//                               <option disabled>Professional (Pro Only)</option>
//                             </select>
//                          </div>
//                          <div>
//                             <label className="text-sm font-semibold text-gray-700">Attachments</label>
//                             <input 
//                               type="file" 
//                               className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-white text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                             />
//                          </div>
//                       </div>
//                     </div>

//                     {/* Right: Calculations & Recurring */}
//                     <div className="space-y-4">
//                       <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
//                          <div className="flex justify-between mb-2 text-sm">
//                             <span className="text-gray-600">Subtotal</span>
//                             <span className="font-medium">{editingInvoice ? `$${editingInvoice.amount}` : "$0.00"}</span>
//                          </div>
//                          <div className="flex justify-between mb-2 text-sm items-center">
//                             <span className="text-gray-600">Discount</span>
//                             <input type="number" placeholder="0" className="w-20 p-1 text-right text-sm border rounded bg-white" />
//                          </div>
//                          <div className="flex justify-between mb-3 text-sm">
//                             <span className="text-gray-600">Tax</span>
//                             <span className="font-medium">$0.00</span>
//                          </div>
//                          <div className="flex justify-between pt-3 border-t border-gray-200 text-lg font-bold text-gray-800">
//                             <span>Total</span>
//                             <span className="text-blue-600">{editingInvoice ? `$${editingInvoice.amount}` : "$0.00"}</span>
//                          </div>
//                       </div>

//                       {/* Recurring Section */}
//                       <div className="border border-blue-100 bg-blue-50/50 p-4 rounded-xl">
//                         <div className="flex justify-between items-center mb-3">
//                           <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
//                             <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
//                             Recurring Invoice
//                           </label>
//                         </div>
//                         <div className="grid grid-cols-2 gap-3">
//                            <select className="p-2 border border-gray-200 rounded text-sm bg-white"><option>Monthly</option><option>Weekly</option></select>
//                            <div className="flex items-center gap-2 text-xs text-gray-600">
//                               <input type="checkbox" /> Auto-charge
//                            </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                 </form>
//               </div>

//               {/* FOOTER - Fixed at bottom */}
//               <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end items-center gap-3">
                
//                 {/* CANCEL BUTTON */}
//                 <button 
//                   onClick={() => setShowForm(false)}
//                   className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 transition-colors"
//                 >
//                   Cancel
//                 </button>

//                 {/* CREATE/UPDATE INVOICE BUTTON */}
//                 <button 
//                   type="submit" 
//                   className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-base shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
//                 >
//                   {editingInvoice ? "Update Invoice" : "Create Invoice"}
//                 </button>
//               </div>

//             </div>
//           </div>
//         </div>
//       )}

//         {/* RECURRING INVOICE POPUP */}
//         {showRecurring && (
//           <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50 animate-fadeIn">
//             <div className="bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 p-[3px] rounded-2xl shadow-2xl w-96 animate-scaleIn relative">
//               <div className="bg-white rounded-2xl p-6 shadow-inner border border-gray-100 relative">
//                 <button onClick={() => setShowRecurring(false)} className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 transition-colors"><X size={20} /></button>
//                 <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Recurring Invoice Settings</h3>
//                 <form className="space-y-4">
//                   <div>
//                     <label className="text-sm font-medium text-gray-700">Frequency</label>
//                     <select className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
//                       <option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option><option>Yearly</option><option>Custom</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-700">Options</label>
//                     <div className="mt-2 space-y-2">
//                       {["Auto-send", "Auto-charge", "Pause", "Skip", "Modify"].map((option) => (
//                         <label key={option} className="flex items-center gap-3 text-gray-700"><input type="checkbox" className="w-4 h-4" />{option}</label>
//                       ))}
//                     </div>
//                   </div>
//                   <p className="text-xs text-gray-500 bg-gray-100 p-2 rounded-md border">Scheduler triggers daily via cron with queue & idempotency.</p>
//                   <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-purple-600 text-white py-2.5 rounded-lg shadow-md transition-all duration-300 font-medium">Save Settings</button>
//                 </form>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </Layout>
//   );
// };

// export default Invoices;
