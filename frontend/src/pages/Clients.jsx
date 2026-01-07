import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import { 
  Users, UserPlus, UploadCloud, Search, Filter, MoreVertical, 
  MapPin, CreditCard, Landmark, Mail, Phone, CheckCircle2, 
  Trash2, Edit3, FileText, Download, Loader2
} from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import { toast } from "react-hot-toast"; 
import { 
  createClient, 
  fetchClients, 
  deleteClient, 
  exportClientsCSV, 
  exportClientsPDF 
} from "../api/client.api";

// --- Constants & Mock Data Helpers ---

const countries = [
  { code: "USA", name: "United States", currency: "USD", states: ["California", "New York", "Texas", "Florida", "Washington"] },
  { code: "IND", name: "India", currency: "INR", states: ["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Gujarat"] },
  { code: "UK", name: "United Kingdom", currency: "GBP", states: ["England", "Scotland", "Wales"] },
  { code: "CAN", name: "Canada", currency: "CAD", states: ["Ontario", "Quebec", "British Columbia"] },
];

const paymentMethods = ["Bank Transfer", "Stripe", "Razorpay", "PayPal", "Cash"];

const Clients = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState("all");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete States
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const initialForm = {
    name: "", 
    type: "Company", 
    email: "", 
    phone: "", 
    address: "",
    country: "", 
    state: "", 
    zip: "", 
    taxId: "", 
    currency: "", // Will be auto-set by country
    paymentPref: "", 
    invoicePrefix: "INV",
    bankDetails: {}
  };
  const [formData, setFormData] = useState(initialForm);

  // --- Load Data ---
  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await fetchClients();
      setClients(res.data);
    } catch (err) {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // --- Handlers ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (e) => {
    const selectedCode = e.target.value;
    const countryData = countries.find((c) => c.code === selectedCode);
    
    setFormData((prev) => ({
      ...prev,
      country: selectedCode,
      state: "", // Reset state
      currency: countryData ? countryData.currency : prev.currency, // Auto-set currency or keep existing
      bankDetails: {} // Reset bank details on country switch
    }));
  };

  const handleBankDetailChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [name]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.country) {
      toast.error("Client name and country are required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Map UI form data to API Payload
      const payload = {
        clientName: formData.name, // Mapping 'name' to 'clientName' for backend
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        state: formData.state,
        zip: formData.zip,
        address: formData.address,
        taxId: formData.taxId,
        currency: formData.currency,
        businessType: formData.type,
        paymentPref: formData.paymentPref,
        invoicePrefix: formData.invoicePrefix,
        bankDetails: formData.bankDetails,
      };

      const res = await createClient(payload);
      
      if (res.data.inviteStatus === "sent") {
        toast.success("Client created & invite sent!");
      } else {
        toast.success("Client created successfully");
      }

      setFormData(initialForm);
      setActiveTab("all");
      loadClients(); // Refresh list to show new client
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error creating client");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedClientId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedClientId) return;
    try {
      setDeleting(true);
      await deleteClient(selectedClientId);
      setClients(prev => prev.filter(c => c._id !== selectedClientId));
      toast.success("Client deleted successfully");
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
      setSelectedClientId(null);
    }
  };

  const handleExport = async (type) => {
    try {
      const res = type === 'csv' ? await exportClientsCSV() : await exportClientsPDF();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `clients-export-${new Date().toLocaleDateString()}.${type}`);
      document.body.appendChild(link);
      link.click();
      toast.success(`${type.toUpperCase()} Export downloaded`);
    } catch (err) {
      toast.error("Export failed");
    }
  };

  // --- Filtering Logic ---
  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  // --- Render Helpers ---

  // Dynamic Bank Fields based on Country
  const renderBankFields = () => {
    if (!formData.country) return <p className="text-sm text-gray-400 italic">Select a country to view bank fields.</p>;

    switch (formData.country) {
      case "USA":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            <div>
              <label className="text-xs font-medium text-gray-600">Bank Name</label>
              <input type="text" name="bankName" value={formData.bankDetails.bankName || ''} onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Routing Number (ABA)</label>
              <input type="text" name="routing" value={formData.bankDetails.routing || ''} onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600">Account Number</label>
              <input type="text" name="accountNumber" value={formData.bankDetails.accountNumber || ''} onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
            </div>
          </div>
        );
      case "IND":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
             <div>
              <label className="text-xs font-medium text-gray-600">Bank Name</label>
              <input type="text" name="bankName" value={formData.bankDetails.bankName || ''} onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">IFSC Code</label>
              <input type="text" name="ifsc" value={formData.bankDetails.ifsc || ''} onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600">Account Number</label>
              <input type="text" name="accountNumber" value={formData.bankDetails.accountNumber || ''} onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
            </div>
          </div>
        );
      case "UK":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            <div>
              <label className="text-xs font-medium text-gray-600">Sort Code</label>
              <input type="text" name="sortCode" value={formData.bankDetails.sortCode || ''} onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Account Number</label>
              <input type="text" name="accountNumber" value={formData.bankDetails.accountNumber || ''} onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 gap-4 animate-fadeIn">
             <div>
              <label className="text-xs font-medium text-gray-600">IBAN / Account Number</label>
              <input type="text" name="iban" value={formData.bankDetails.iban || ''} onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">SWIFT / BIC Code</label>
              <input type="text" name="swift" value={formData.bankDetails.swift || ''} onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
            </div>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 pb-20">

        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mt-16 px-4 md:px-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Clients</h2>
            <p className="text-gray-500 mt-1">Manage, invite, and track your customer base.</p>
          </div>
          <div className="flex gap-2">
             <button onClick={() => handleExport('csv')} className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-gray-600 flex items-center gap-2 text-sm font-medium">
                <FileText size={18} /> Export CSV
             </button>
             <button onClick={() => setActiveTab("add")} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-sm text-sm font-semibold">
                <UserPlus size={18} /> New Client
             </button>
          </div>
        </div>

        {/* --- Sub-Tabs Navigation --- */}
        <div className="flex border-b border-gray-200 gap-8 px-4 md:px-0 overflow-x-auto">
          {["all", "add", "import"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold capitalize transition-all relative ${
                activeTab === tab ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "all" ? (
                <span className="flex items-center gap-2"><Users size={18}/> Directory</span>
              ) : tab === "add" ? (
                <span className="flex items-center gap-2"><UserPlus size={18}/> Add Client</span>
              ) : (
                <span className="flex items-center gap-2"><UploadCloud size={18}/> Import</span>
              )}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
            </button>
          ))}
        </div>

        {/* --- TAB CONTENT: ALL CLIENTS --- */}
        {activeTab === "all" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-500">
            {/* Filter Bar */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 bg-gray-50/50">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search clients by name or email..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 flex items-center cursor-pointer text-sm font-medium">
                <Filter size={16} className="mr-2" /> Filter
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Client Name", "Contact", "Location", "Type", "Status", "Actions"].map((head, i) => (
                      <th key={head} className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === 5 ? "text-right" : ""}`}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="6" className="p-10 text-center text-gray-400">Loading clients...</td></tr>
                  ) : filteredClients.length === 0 ? (
                    <tr><td colSpan="6" className="p-10 text-center text-gray-400">No clients found.</td></tr>
                  ) : (
                    filteredClients.map((client) => (
                      <tr key={client._id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                              {client.clientName?.substring(0,2).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{client.clientName}</div>
                              <div className="text-xs text-gray-500">ID: {client.invoicePrefix}-{client._id.slice(-4)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1.5"><Mail size={14} className="text-gray-400"/> {client.email}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1"><Phone size={14} className="text-gray-400"/> {client.phone || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {client.country} <span className="text-gray-400 text-xs">({client.currency})</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${client.businessType === 'Company' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                            {client.businessType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${client.isPortalActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                            {client.isPortalActive ? "Active User" : "Invited"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-blue-600 transition-all"><Edit3 size={16}/></button>
                             <button onClick={() => handleDeleteClick(client._id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-all"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: ADD CLIENT --- */}
        {activeTab === "add" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Add New Client</h3>
              <p className="text-sm text-gray-500">Enter client details. Required fields are marked with <span className="text-red-500">*</span></p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Basic Info */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Section: General */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4 flex items-center">
                    <Users size={16} className="mr-2 text-blue-500" /> General Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Acme Corp or John Doe"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
                      <select 
                        name="type" 
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="Company">Company</option>
                        <option value="Individual">Individual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / VAT / GST</label>
                      <input 
                        type="text" 
                        name="taxId"
                        value={formData.taxId}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email (For Invoices)</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input 
                        type="text" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 555-000-0000"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6"></div>

                {/* Section: Address */}
                <div>
                   <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4 flex items-center">
                    <MapPin size={16} className="mr-2 text-blue-500" /> Billing Address
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                       <textarea 
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="2" 
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                       ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country <span className="text-red-500">*</span></label>
                      <select 
                        name="country"
                        value={formData.country} 
                        onChange={handleCountryChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none"
                        required
                      >
                        <option value="">Select Country</option>
                        {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                      <select 
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 outline-none"
                        disabled={!formData.country}
                      >
                        <option value="">Select State</option>
                        {formData.country && countries.find(c => c.code === formData.country)?.states.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zip / Postal Code</label>
                      <input 
                        type="text" 
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Financials & Bank */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Financial Settings */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4 flex items-center">
                    <CreditCard size={16} className="mr-2 text-green-600" /> Financial Settings
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
                      <input 
                        type="text" 
                        name="invoicePrefix"
                        value={formData.invoicePrefix}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                      <div className="relative">
                         <input 
                            type="text" 
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            className="w-full p-2.5 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                         />
                         <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Auto-set based on country, but editable.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Preference</label>
                      <select 
                        name="paymentPref"
                        value={formData.paymentPref}
                        onChange={handleInputChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      >
                        <option value="">None</option>
                        {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Nested Form: Bank Details */}
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                  <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-4 flex items-center">
                    <Landmark size={16} className="mr-2 text-blue-600" /> Bank Details
                  </h4>
                  
                  {renderBankFields()}
                </div>
                
                {/* Action Buttons */}
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-300 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <CheckCircle2 size={18} className="mr-2" />} 
                    {isSubmitting ? "Saving..." : "Save Client"}
                  </button>
                  <button type="button" onClick={() => setActiveTab("all")} className="w-full mt-3 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>

              </div>
            </form>
          </div>
        )}

        {/* --- TAB CONTENT: IMPORT CLIENTS --- */}
        {activeTab === "import" && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 animate-in fade-in duration-500 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Import Clients</h3>
            <p className="text-gray-500 text-center max-w-md mb-8">
              Upload a CSV or Excel file to bulk import clients. Please use our template to ensure correct formatting.
            </p>
            
            <div className="w-full max-w-xl border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
              <UploadCloud size={48} className="text-gray-400 group-hover:text-blue-500 mb-4 transition-colors" />
              <p className="text-sm font-medium text-gray-700">Drag and drop your file here, or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">Supports .csv, .xlsx (Max 5MB)</p>
            </div>

            <div className="mt-8 flex gap-4">
               <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                 <Download size={16} className="mr-1" /> Download Template
               </button>
            </div>
          </div>
        )}

      </div>
      
      {/* --- Modals --- */}
      <ConfirmModal
        open={showConfirm}
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        onCancel={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
      />
    </Layout>
  );
};

export default Clients;

// import React, { useState } from "react";
// import Layout from "../components/Layout";
// import { 
//   Users, 
//   UserPlus, 
//   UploadCloud, 
//   Search, 
//   Filter, 
//   MoreVertical, 
//   MapPin, 
//   CreditCard, 
//   Landmark, 
//   Mail, 
//   Phone,
//   CheckCircle2,
//   AlertCircle
// } from "lucide-react";
// import { createClient } from "../api/client.api";

// // --- Mock Data & Constants ---

// const initialClients = [
//   { id: 1, name: "Acme Corporation", type: "Company", email: "billing@acme.com", phone: "+1 555-0101", country: "USA", status: "Active" },
//   { id: 2, name: "John Doe Enterprises", type: "Individual", email: "john@doe.com", phone: "+91 98765-43210", country: "India", status: "Active" },
//   { id: 3, name: "Global Tech Solutions", type: "Company", email: "accounts@globaltech.com", phone: "+44 20 7946 0958", country: "UK", status: "Inactive" },
// ];

// const countries = [
//   { code: "USA", name: "United States", currency: "USD", states: ["California", "New York", "Texas", "Florida"] },
//   { code: "IND", name: "India", currency: "INR", states: ["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu"] },
//   { code: "UK", name: "United Kingdom", currency: "GBP", states: ["England", "Scotland", "Wales"] },
//   { code: "CAN", name: "Canada", currency: "CAD", states: ["Ontario", "Quebec", "British Columbia"] },
// ];

// const paymentMethods = ["Bank Transfer", "Stripe", "Razorpay", "PayPal", "Cash"];

// const Clients = () => {
//   // --- State ---
//   const [activeTab, setActiveTab] = useState("all"); // 'all', 'add', 'import'
//   const [clients, setClients] = useState(initialClients);
  
//   // Form State
//   const [formData, setFormData] = useState({
//     name: "",
//     type: "Company",
//     email: "",
//     phone: "",
//     address: "",
//     country: "",
//     state: "",
//     zip: "",
//     taxId: "",
//     currency: "",
//     paymentPref: "",
//     bankDetails: {}
//   });

//   // --- Handlers ---

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCountryChange = (e) => {
//     const selectedCode = e.target.value;
//     const countryData = countries.find((c) => c.code === selectedCode);
    
//     setFormData((prev) => ({
//       ...prev,
//       country: selectedCode,
//       state: "", // Reset state
//       currency: countryData ? countryData.currency : "", // Auto-set currency
//       bankDetails: {} // Reset bank details on country switch
//     }));
//   };

//   const handleBankDetailChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       bankDetails: { ...prev.bankDetails, [name]: value }
//     }));
//   };

// const handleSubmit = async (e) => {
//   e.preventDefault();

//   // basic required check
//   if (!formData.name || !formData.country) {
//     alert("Client name and country are required");
//     return;
//   }

//   try {
//     const payload = {
//       clientName: formData.name,          // IMPORTANT: backend expects this
//       email: formData.email,
//       phone: formData.phone,
//       country: formData.country,
//       state: formData.state,
//       currency: formData.currency,
//       taxId: formData.taxId,
//       businessType: formData.type,
//       paymentPref: formData.paymentPref,
//       bankDetails: formData.bankDetails,
//       address: formData.address,
//       zip: formData.zip,
//     };

//     const res = await createClient(payload);

//     console.log("Client created:", res.data);

//     // temporarily add to UI (we'll replace later)
//     setClients((prev) => [
//       ...prev,
//       {
//         id: res.data.client._id,
//         name: res.data.client.clientName,
//         email: res.data.client.email,
//         phone: res.data.client.phone,
//         country: res.data.client.country,
//         type: formData.type,
//         status: "Active",
//       },
//     ]);

//     setActiveTab("all");

//   } catch (err) {
//     console.error("Create client error:", err);
//     alert(err.response?.data?.message || "Failed to create client");
//   }
// };


//   // --- Render Helpers ---

//   // Dynamic Bank Fields based on Country
//   const renderBankFields = () => {
//     if (!formData.country) return <p className="text-sm text-gray-400 italic">Select a country to view bank fields.</p>;

//     switch (formData.country) {
//       case "USA":
//         return (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
//             <div>
//               <label className="text-xs font-medium text-gray-600">Bank Name</label>
//               <input type="text" name="bankName" onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
//             </div>
//             <div>
//               <label className="text-xs font-medium text-gray-600">Routing Number (ABA)</label>
//               <input type="text" name="routing" onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
//             </div>
//             <div className="md:col-span-2">
//               <label className="text-xs font-medium text-gray-600">Account Number</label>
//               <input type="text" name="accountNumber" onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
//             </div>
//           </div>
//         );
//       case "IND":
//         return (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
//              <div>
//               <label className="text-xs font-medium text-gray-600">Bank Name</label>
//               <input type="text" name="bankName" onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
//             </div>
//             <div>
//               <label className="text-xs font-medium text-gray-600">IFSC Code</label>
//               <input type="text" name="ifsc" onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
//             </div>
//             <div className="md:col-span-2">
//               <label className="text-xs font-medium text-gray-600">Account Number</label>
//               <input type="text" name="accountNumber" onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
//             </div>
//           </div>
//         );
//       case "UK":
//         return (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
//             <div>
//               <label className="text-xs font-medium text-gray-600">Sort Code</label>
//               <input type="text" name="sortCode" onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
//             </div>
//             <div>
//               <label className="text-xs font-medium text-gray-600">Account Number</label>
//               <input type="text" name="accountNumber" onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
//             </div>
//           </div>
//         );
//       default:
//         return (
//           <div className="grid grid-cols-1 gap-4 animate-fadeIn">
//              <div>
//               <label className="text-xs font-medium text-gray-600">IBAN / Account Number</label>
//               <input type="text" name="iban" onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
//             </div>
//             <div>
//               <label className="text-xs font-medium text-gray-600">SWIFT / BIC Code</label>
//               <input type="text" name="swift" onChange={handleBankDetailChange} className="w-full mt-1 p-2 border rounded bg-gray-50" />
//             </div>
//           </div>
//         );
//     }
//   };

//   return (
//     <Layout>
//       <div className="space-y-6">

//         {/* --- Header Section --- */}
//         <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-20">
//           <div>
//             <h2 className="text-2xl  text-gray-800">Client Management</h2>
//             <p className="text-gray-500">Manage your customer relationships and billing details.</p>
//           </div>
//         </div>

//         {/* --- Sub-Tabs Navigation --- */}
//         <div className=" p-1 flex overflow-x-auto gap-1 ">
//           <button
//             onClick={() => setActiveTab("all")}
//             className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer
//               ${activeTab === "all"  
//                 ? "bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-500" 
//                 : "text-gray-600 hover:bg-gray-50"}`}
//           >
//             <Users size={18} className="mr-2" />
//             All Clients
//           </button>
          
//           <button
//             onClick={() => setActiveTab("add")}
//             className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer 
//               ${activeTab === "add" 
//                 ? "bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-500" 
//                 : "text-gray-600 hover:bg-gray-50"}`}
//           >
//             <UserPlus size={18} className="mr-2" />
//             Add Client
//           </button>

//           <button
//             onClick={() => setActiveTab("import")}
//             className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer
//               ${activeTab === "import" 
//                 ? "bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-500" 
//                 : "text-gray-600 hover:bg-gray-50"}`}
//           >
//             <UploadCloud size={18} className="mr-2" />
//             Import Clients
//           </button>
//         </div>

//         {/* --- TAB CONTENT: ALL CLIENTS --- */}
//         {activeTab === "all" && (
//           <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fadeIn ">
//             {/* Filter Bar */}
//             <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
//               <div className="relative flex-grow">
//                 <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//                 <input type="text" placeholder="Search clients..." className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
//               </div>
//               <button className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 flex items-center cursor-pointer">
//                 <Filter size={18} className="mr-2" /> Filter
//               </button>
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto cursor-pointer">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     {["Client Name", "Contact", "Country", "Type", "Status", "Actions"].map((head) => (
//                       <th key={head} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{head}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-100">
//                   {clients.map((client) => (
//                     <tr key={client.id} className="hover:bg-blue-50/50 transition-colors group">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold text-sm">
//                             {client.name.substring(0,2).toUpperCase()}
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-medium text-gray-900">{client.name}</div>
//                             <div className="text-xs text-gray-500">ID: CLI-{client.id}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900 flex items-center gap-1"><Mail size={12}/> {client.email}</div>
//                         <div className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Phone size={12}/> {client.phone}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client.country}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         <span className={`px-2 py-1 rounded text-xs font-medium ${client.type === 'Company' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
//                           {client.type}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
//                           {client.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         <button className="text-gray-400 hover:text-blue-600 p-1"><MoreVertical size={18} /></button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* --- TAB CONTENT: ADD CLIENT --- */}
//         {activeTab === "add" && (
//           <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fadeIn">
//             <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
//               <h3 className="text-lg font-bold text-gray-800">Add New Client</h3>
//               <p className="text-sm text-gray-500">Enter client details. Required fields are marked with <span className="text-red-500">*</span></p>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              
//               {/* Left Column: Basic Info */}
//               <div className="lg:col-span-2 space-y-6">
                
//                 {/* Section: General */}
//                 <div>
//                   <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4 flex items-center">
//                     <Users size={16} className="mr-2 text-blue-500" /> General Information
//                   </h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="md:col-span-2">
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Client Name <span className="text-red-500">*</span></label>
//                       <input 
//                         type="text" 
//                         name="name" 
//                         value={formData.name}
//                         onChange={handleInputChange}
//                         placeholder="e.g. Acme Corp or John Doe"
//                         className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         required 
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
//                       <select 
//                         name="type" 
//                         value={formData.type}
//                         onChange={handleInputChange}
//                         className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                       >
//                         <option value="Company">Company</option>
//                         <option value="Individual">Individual</option>
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / VAT / GST</label>
//                       <input 
//                         type="text" 
//                         name="taxId"
//                         value={formData.taxId}
//                         onChange={handleInputChange}
//                         className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Email (For Invoices)</label>
//                       <input 
//                         type="email" 
//                         name="email"
//                         value={formData.email}
//                         onChange={handleInputChange}
//                         className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//                       <input 
//                         type="text" 
//                         name="phone"
//                         value={formData.phone}
//                         onChange={handleInputChange}
//                         placeholder="+1 555-000-0000"
//                         className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="border-t border-gray-100 pt-6"></div>

//                 {/* Section: Address */}
//                 <div>
//                    <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4 flex items-center">
//                     <MapPin size={16} className="mr-2 text-blue-500" /> Billing Address
//                   </h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="md:col-span-2">
//                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
//                        <textarea 
//                           name="address"
//                           value={formData.address}
//                           onChange={handleInputChange}
//                           rows="2" 
//                           className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                        ></textarea>
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Country <span className="text-red-500">*</span></label>
//                       <select 
//                         name="country"
//                         value={formData.country} 
//                         onChange={handleCountryChange}
//                         className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
//                         required
//                       >
//                         <option value="">Select Country</option>
//                         {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
//                       <select 
//                         name="state"
//                         value={formData.state}
//                         onChange={handleInputChange}
//                         className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
//                         disabled={!formData.country}
//                       >
//                         <option value="">Select State</option>
//                         {formData.country && countries.find(c => c.code === formData.country)?.states.map(s => (
//                           <option key={s} value={s}>{s}</option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Zip / Postal Code</label>
//                       <input 
//                         type="text" 
//                         name="zip"
//                         value={formData.zip}
//                         onChange={handleInputChange}
//                         className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Right Column: Financials & Bank */}
//               <div className="lg:col-span-1 space-y-6">
                
//                 {/* Financial Settings */}
//                 <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
//                   <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4 flex items-center">
//                     <CreditCard size={16} className="mr-2 text-green-600" /> Financial Settings
//                   </h4>
                  
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
//                       <div className="relative">
//                          <input 
//                             type="text" 
//                             name="currency"
//                             value={formData.currency}
//                             onChange={handleInputChange}
//                             className="w-full p-2.5 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
//                          />
//                          <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
//                       </div>
//                       <p className="text-[10px] text-gray-400 mt-1">Auto-set based on country, but editable.</p>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Payment Preference</label>
//                       <select 
//                         name="paymentPref"
//                         value={formData.paymentPref}
//                         onChange={handleInputChange}
//                         className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
//                       >
//                         <option value="">None</option>
//                         {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Nested Form: Bank Details */}
//                 <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
//                   <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-4 flex items-center">
//                     <Landmark size={16} className="mr-2 text-blue-600" /> Bank Details
//                   </h4>
                  
//                   {renderBankFields()}
//                 </div>
                
//                 {/* Action Buttons */}
//                 <div className="pt-4">
//                   <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-300 flex justify-center items-center">
//                     <CheckCircle2 size={18} className="mr-2" /> Save Client
//                   </button>
//                   <button type="button" onClick={() => setActiveTab("all")} className="w-full mt-3 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
//                     Cancel
//                   </button>
//                 </div>

//               </div>
//             </form>
//           </div>
//         )}

//         {/* --- TAB CONTENT: IMPORT CLIENTS --- */}
//         {activeTab === "import" && (
//           <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 animate-fadeIn flex flex-col items-center justify-center min-h-[400px]">
//             <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
//               <UploadCloud size={32} />
//             </div>
//             <h3 className="text-xl font-bold text-gray-800 mb-2">Import Clients</h3>
//             <p className="text-gray-500 text-center max-w-md mb-8">
//               Upload a CSV or Excel file to bulk import clients. Please use our template to ensure correct formatting.
//             </p>
            
//             <div className="w-full max-w-xl border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
//               <UploadCloud size={48} className="text-gray-400 group-hover:text-blue-500 mb-4 transition-colors" />
//               <p className="text-sm font-medium text-gray-700">Drag and drop your file here, or click to browse</p>
//               <p className="text-xs text-gray-400 mt-2">Supports .csv, .xlsx (Max 5MB)</p>
//             </div>

//             <div className="mt-8 flex gap-4">
//                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
//                  <DownloadIcon size={16} className="mr-1" /> Download Template
//                </button>
//             </div>
//           </div>
//         )}

//       </div>
//     </Layout>
//   );
// };

// // Helper Icon for the download link
// const DownloadIcon = ({size, className}) => (
//   <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
//     <polyline points="7 10 12 15 17 10"></polyline>
//     <line x1="12" y1="15" x2="12" y2="3"></line>
//   </svg>
// );

// export default Clients;