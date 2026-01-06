import React, { useState } from "react";
import Layout from "../components/Layout";
import { PiInvoiceDuotone } from "react-icons/pi";
import { FaFileInvoice } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";
import { CgTemplate } from "react-icons/cg";
import { 
  Pencil, 
  Download, 
  PlusCircle, 
  X, 
  RotateCcw, 
  Trash2, 
  Check, 
  Lock, 
  Code, 
  LayoutTemplate 
} from "lucide-react";

// Mock Data
const InvoiceStats = [
  { label: "Paid", amount: "$68,150", color: "bg-gradient-to-r from-green-400 to-emerald-500 border-green-300 text-green-800" },
  { label: "Pending", amount: "$38,040", color: "bg-gradient-to-r from-yellow-400 to-amber-500 border-yellow-300 text-yellow-800" },
  { label: "Overdue", amount: "$15,600", color: "bg-gradient-to-r from-red-400 to-red-500 text-red-800" },
  { label: "Draft", amount: "3", color: "bg-gradient-to-r from-blue-400 to-blue-500 border-blue-300 text-blue-800" },
];

const initialInvoiceData = [
  { 
    id: "INV-2025-01-001", 
    client: "Acme Corporation", 
    amount: 12450.00, 
    currency: "USD",
    issue: "2025-01-15", 
    due: "2025-01-30", 
    status: "Paid" 
  },
  { 
    id: "INV-2025-01-002", 
    client: "Tech Innovators Ltd", 
    amount: 8920.00, 
    currency: "USD",
    issue: "2025-01-18", 
    due: "2025-02-02", 
    status: "Pending" 
  },
  { 
    id: "INV-2025-01-003", 
    client: "Global Solutions Inc", 
    amount: 15600.00, 
    currency: "USD",
    issue: "2025-01-10", 
    due: "2025-01-25", 
    status: "Overdue" 
  },
  { 
    id: "INV-2025-01-004", 
    client: "Digital Ventures", 
    amount: 6780.00, 
    currency: "USD",
    issue: "2025-01-20", 
    due: "2025-02-04", 
    status: "Paid" 
  },
  { 
    id: "INV-2025-01-005", 
    client: "Smart Systems Co", 
    amount: 22340.00, 
    currency: "USD",
    issue: "2025-01-22", 
    due: "2025-02-06", 
    status: "Pending" 
  },
];

const initialTrashData = [
  { id: "INV-2499", client: "Old Client LLC", amount: "$4,500", deletedDate: "Jan 20, 2025" },
  { id: "INV-2498", client: "Bad Debt Inc", amount: "$1,200", deletedDate: "Jan 18, 2025" },
];

const templatesData = [
  { id: 1, name: "Clean Minimal", type: "Free", color: "bg-white border-gray-200" },
  { id: 2, name: "Modern Blue", type: "Free", color: "bg-blue-50 border-blue-100" },
  { id: 3, name: "Corporate Dark", type: "Pro", color: "bg-slate-800 text-white border-slate-700" },
  { id: 4, name: "Creative Bold", type: "Pro", color: "bg-purple-50 border-purple-200" },
];

const Invoices = () => {
  // State Management
  const [invoiceData, setInvoiceData] = useState(initialInvoiceData);
  const [trashItems, setTrashItems] = useState(initialTrashData);
  
  // Modals State
  const [showForm, setShowForm] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Edit/View State
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Template State
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const isPro = false; 

  // --- Handlers ---

  // Handle Opening Form for Create
  const handleCreate = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };

  // Handle Opening Form for Edit (Pencil) or View (Eye)
  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  // Handle Download (Simulated)
  const handleDownload = (invoice) => {
    // In a real app, this would fetch a PDF blob
    const fileName = `${invoice.id}.txt`;
    const fileContent = `Invoice ID: ${invoice.id}\nClient: ${invoice.client}\nAmount: ${invoice.amount}\nStatus: ${invoice.status}`;
    
    const element = document.createElement("a");
    const file = new Blob([fileContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    alert(`Downloading Invoice: ${invoice.id}`);
  };

  // NEW: Handle Soft Delete (Moves to Trash)
  const handleSoftDelete = (invoice) => {
    if (window.confirm(`Are you sure you want to move ${invoice.id} to trash?`)) {
      // 1. Create a trash item object (formatting date for display)
      const deletedItem = {
        ...invoice,
        deletedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      // 2. Add to Trash State
      setTrashItems((prev) => [deletedItem, ...prev]);

      // 3. Remove from Active Invoice State
      setInvoiceData((prev) => prev.filter((item) => item.id !== invoice.id));
    }
  };

  const handleRestore = (id) => {
    const isUnique = !invoiceData.some(inv => inv.id === id);
    if (!isUnique) {
      alert(`Error: Invoice ID ${id} already exists in the active list.`);
      return;
    }
    const itemToRestore = trashItems.find((item) => item.id === id);
    if (itemToRestore) {
      // Remove the extra 'deletedDate' property when restoring if desired, or keep it.
      // We map it back to active structure
      const { ...rest } = itemToRestore; 
      
      setInvoiceData((prev) => [
        ...prev, 
        { ...rest, status: "Draft" } // Set status to draft on restore usually
      ]);
      setTrashItems((prev) => prev.filter((item) => item.id !== id));
      alert(`Invoice ${id} restored successfully.`);
    }
  };

  const handlePermanentDelete = (id) => {
    if (window.confirm(`Are you sure you want to permanently delete ${id}? This cannot be undone.`)) {
      setTrashItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleTemplateSelect = (template) => {
    if (template.type === "Pro" && !isPro) {
      alert("This template requires a Pro subscription.");
      return;
    }
    setSelectedTemplate(template.id);
  };

  return (
    <Layout>
      <div className="bg-white shadow-sm rounded-md mb-19"></div>

      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl text-gray-800">Invoice Management</h2>
            <p className="text-gray-500">Create and manage your invoices</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            
            {/* All Invoice */}
            <button className="relative inline-flex items-center justify-center p-[2px] rounded-md bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 shadow-lg hover:shadow-[0_0_25px_rgba(66,133,244,0.7)] transition-all duration-300 cursor-pointer">
              <span className="flex items-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-md">
                <PiInvoiceDuotone size={18} className="mr-2 text-[#4285F4]" />
                All Invoice
              </span>
            </button>

            {/* Create Invoice */}
            <button
              onClick={handleCreate}
              className="relative inline-flex items-center justify-center p-[2px] rounded-md bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 shadow-lg hover:shadow-[0_0_25px_rgba(66,133,244,0.7)] transition-all duration-300 cursor-pointer"
            >
              <span className="flex items-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-md">
                <PlusCircle size={18} className="mr-2 text-[#4285F4]" />
                Create Invoice
              </span>
            </button>

            {/* Recurring Invoice */}
            <button
              onClick={() => setShowRecurring(true)}
              className="relative inline-flex items-center justify-center p-[2px] rounded-md bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 shadow-lg hover:shadow-[0_0_25px_rgba(66,133,244,0.7)] transition-all duration-300 cursor-pointer"
            >
              <span className="flex items-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-md">
                <FaFileInvoice size={18} className="mr-2 text-[#4285F4]" />
                Recurring Invoice
              </span>
            </button>

            {/* Trash Button */}
            <button 
              onClick={() => setShowTrash(true)}
              className="relative inline-flex items-center justify-center p-[2px] rounded-md bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 shadow-lg hover:shadow-[0_0_25px_rgba(66,133,244,0.7)] transition-all duration-300 cursor-pointer">
              <span className="flex items-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-md">
                <FaTrashAlt size={18} className="mr-2 text-[#4285F4]" />
                Trash
              </span>
            </button>

            {/* Template Store Button */}
            <button 
              onClick={() => setShowTemplates(true)}
              className="relative inline-flex items-center justify-center p-[2px] rounded-md bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 shadow-lg hover:shadow-[0_0_25px_rgba(66,133,244,0.7)] transition-all duration-300 cursor-pointer">
              <span className="flex items-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-md">
                <CgTemplate size={18} className="mr-2 text-[#4285F4]" />
                Template Store
              </span>
            </button>

          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {InvoiceStats.map((stat) => (
            <div
              key={stat.label}
              className={`p-4 rounded-lg shadow-md border ${stat.color} transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1`}
            >
              <p className="text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.amount}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex space-x-4 items-center">
          <input
            type="text"
            placeholder="Search invoices..."
            className="p-2 flex-grow border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
          />
          <select className="p-2 border border-gray-300 rounded-md shadow-sm text-gray-900 cursor-pointer">
            <option>All Status</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>
          <button className="bg-white border border-blue-600 text-gray-800 font-medium py-2 px-4 rounded-md shadow-sm hover:bg-blue-50 transition-colors duration-200 flex items-center cursor-pointer">
            Export
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-gradient-to-b from-gray-50 to-white shadow-2xl rounded-xl overflow-auto border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-300">
              <tr>
                {["Invoice ID", "Client", "Amount", "Issue Date", "Due Date", "Status", "Actions"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {invoiceData.map((invoice, index) => (
                <tr
                  key={invoice.id}
                  className={`group transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50  ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{invoice.client}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{invoice.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{invoice.issue}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{invoice.due}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === "Paid"
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : invoice.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                          : "bg-red-100 text-red-800 border border-red-300"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-3 text-gray-500">
                      
                      {/* PENCIL ICON: OPEN FORM (EDIT) */}
                      <button 
                        onClick={() => handleEdit(invoice)} 
                        className="hover:text-blue-600 transform hover:scale-110 transition-all duration-200"
                        title="Edit Invoice"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* DOWNLOAD ICON: DOWNLOAD INVOICE */}
                      {/* Note: Changed to Green so it doesn't conflict with Delete (Red) */}
                      <button 
                        onClick={() => handleDownload(invoice)}
                        className="hover:text-green-600 transform hover:scale-110 transition-all duration-200"
                        title="Download Invoice"
                      >
                        <Download size={16} />
                      </button>
                      
                      {/* DELETE ICON: MOVE TO TRASH */}
                      <button 
                        onClick={() => handleSoftDelete(invoice)}
                        className="hover:text-red-600 transform hover:scale-110 transition-all duration-200"
                        title="Move to Trash"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ------------------------------------------------- */}
        {/*                  TRASH POPUP                      */}
        {/* ------------------------------------------------- */}
        {showTrash && (
          <div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-50 animate-fadeIn">
            <div className="bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 p-[3px] rounded-2xl shadow-2xl w-[90%] md:w-[800px] animate-scaleIn relative">
              <div className="bg-white rounded-2xl p-6 shadow-inner border border-gray-100 relative min-h-[400px]">
                <button onClick={() => setShowTrash(false)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition-colors"><X size={24} /></button>
                <div className="flex items-center gap-3 mb-6  pb-4">
                  <div className="p-2 bg-red-100 rounded-full text-red-600"><FaTrashAlt size={24} /></div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800">Soft-Deleted Invoices</h3>
                    <p className="text-sm text-gray-500">Restore items or permanently remove them.</p>
                  </div>
                </div>
                {trashItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <FaTrashAlt size={48} className="mb-4 opacity-20" />
                    <p>Trash is empty</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-sm text-gray-500 uppercase">
                          <th className="py-3 px-4 font-medium">Invoice ID</th>
                          <th className="py-3 px-4 font-medium">Client</th>
                          <th className="py-3 px-4 font-medium">Amount</th>
                          <th className="py-3 px-4 font-medium">Deleted Date</th>
                          <th className="py-3 px-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {trashItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.id}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{item.client}</td>
                            <td className="py-3 px-4 text-sm font-bold text-gray-800">{item.amount}</td>
                            <td className="py-3 px-4 text-sm text-gray-500">{item.deletedDate}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button onClick={() => handleRestore(item.id)} className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 border border-green-200"><RotateCcw size={14} className="mr-1.5" /> Restore</button>
                              <button onClick={() => handlePermanentDelete(item.id)} className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 shadow-sm"><Trash2 size={14} className="mr-1.5" /> Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------- */}
        {/*               TEMPLATE STORE POPUP                */}
        {/* ------------------------------------------------- */}
        {showTemplates && (
          <div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-50 animate-fadeIn">
            {/* Wider container for Preview + Options */}
            <div className="bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 p-[3px] rounded-2xl shadow-2xl w-[95%] md:w-[900px] h-[90vh] md:h-auto animate-scaleIn relative">
              <div className="bg-white rounded-2xl p-0 shadow-inner border border-gray-100 relative h-full flex flex-col md:flex-row overflow-hidden">
                
                {/* Close Button */}
                <button
                  onClick={() => setShowTemplates(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-10 bg-white/80 rounded-full p-1"
                >
                  <X size={24} />
                </button>

                {/* Left Side: Template Grid */}
                <div className="w-full md:w-7/12 p-6 bg-gray-50 overflow-y-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-100 rounded-full bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600  ">
                      <LayoutTemplate size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Template Store</h3>
                      <p className="text-sm text-gray-500">2 free templates per company. Pro unlocks all.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {templatesData.map((template) => (
                      <div 
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`relative rounded-xl border-2 cursor-pointer transition-all duration-200 overflow-hidden group
                          ${selectedTemplate === template.id 
                            ? "border-blue-500 ring-2 ring-purple-200 ring-offset-2" 
                            : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                          }
                        `}
                      >
                        {/* Mock Preview Area */}
                        <div className={`h-32 ${template.color} flex flex-col p-3`}>
                          <div className="w-1/3 h-2 bg-current opacity-20 rounded mb-2"></div>
                          <div className="w-1/2 h-2 bg-current opacity-10 rounded mb-4"></div>
                          <div className="mt-auto w-full h-8 bg-current opacity-5 rounded-md border border-current border-opacity-10"></div>
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-white flex justify-between items-center">
                          <span className="font-semibold text-gray-700">{template.name}</span>
                          {template.type === "Pro" ? (
                            <span className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                              <Lock size={12} className="mr-1" /> PRO
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              FREE
                            </span>
                          )}
                        </div>

                        {/* Selection Checkmark */}
                        {selectedTemplate === template.id && (
                          <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1 shadow-sm">
                            <Check size={14} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Options & Customization */}
                <div className="w-full md:w-5/12 p-6 flex flex-col bg-white border-l border-gray-100">
                  
                  {/* Placeholders Info */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3 flex items-center">
                      <Code size={16} className="mr-2 text-blue-500" />
                      Dynamic Placeholders
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">Use these tags to auto-fill invoice data.</p>
                    <div className="flex flex-wrap gap-2">
                      {["{{company_name}}", "{{client_name}}", "{{total}}", "{{due_date}}", "{{id}}"].map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-mono rounded border border-blue-100 select-all">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Custom CSS (Pro Only) */}
                  <div className="mb-6 flex-grow relative">
                     <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                          Custom CSS
                        </h4>
                        {!isPro && <span className="text-[10px] font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 px-2 py-0.5 rounded-full">PRO ONLY</span>}
                     </div>
                     
                     <div className="relative h-full">
                       <textarea 
                          disabled={!isPro}
                          className={`w-full h-40 md:h-full p-3 text-sm font-mono border rounded-lg resize-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                            ${!isPro ? "bg-gray-50 text-gray-400" : "bg-gray-800 text-green-400"}
                          `}
                          placeholder={isPro ? ".invoice-header { background: #000; }" : "/* Upgrade to Pro to unlock custom CSS styling for your invoices. */"}
                       ></textarea>
                       
                       {/* Lock Overlay if not Pro */}
                       {!isPro && (
                         <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-[1px]">
                           <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 text-center max-w-[200px]">
                             <Lock size={24} className="mx-auto text-indigo-500 mb-2" />
                             <p className="text-xs text-gray-600 font-medium">Unlock full customization with Pro Plan.</p>
                           </div>
                         </div>
                       )}
                     </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 mt-auto border-t border-gray-100">
                    <button 
                      onClick={() => setShowTemplates(false)}
                      className="w-full  bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg shadow-md transition-all duration-300 font-bold flex justify-center items-center"
                    >
                      Apply Template
                    </button>
                    {!isPro && (
                       <p className="text-center text-xs text-gray-400 mt-3">
                         You are using 1 of 2 free templates.
                       </p>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

      {/* ------------------------------------------------- */}
      {/*          CREATE / EDIT INVOICE FORM             */}
      {/* ------------------------------------------------- */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          
          {/* GRADIENT BORDER CONTAINER */}
          <div className="bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 p-[3px] rounded-2xl shadow-2xl w-full max-w-4xl animate-scaleIn relative flex flex-col max-h-[90vh]">
            
            {/* WHITE CONTENT AREA */}
            <div className="bg-white rounded-xl shadow-inner border border-gray-100 flex flex-col h-full overflow-hidden">
              
              {/* HEADER - Sticky */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {editingInvoice ? "Edit Invoice" : "Create Invoice"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {editingInvoice ? `Updating details for ${editingInvoice.id}` : "Fill in the details below"}
                  </p>
                </div>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              {/* SCROLLABLE FORM BODY */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form className="space-y-6">
                  
                  {/* ROW 1: Client & Invoice Meta */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Client Dropdown */}
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700">Client <span className="text-red-500">*</span></label>
                      <select 
                        defaultValue={editingInvoice ? "custom" : ""}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                      >
                        <option value="">Select existing client</option>
                        <option value="1">John Doe - Acme Corp</option>
                        <option value="2">Sarah Smith - Wayne Ent</option>
                        {editingInvoice && <option value="custom" selected>{editingInvoice.client}</option>}
                      </select>
                    </div>

                    {/* Invoice Number (Auto-gen) */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Invoice Number</label>
                      <div className="relative mt-1">
                        <input 
                          type="text" 
                          value={editingInvoice ? editingInvoice.id : `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-001`}
                          readOnly 
                          className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed font-mono" 
                        />
                        <div className="absolute right-3 top-3 text-green-500">
                          {editingInvoice ? <Lock size={20} /> : <Check size={20} />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ROW 2: Dates & Currency */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Issue Date <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        defaultValue={editingInvoice ? editingInvoice.issue : new Date().toISOString().split("T")[0]}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Due Date <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        defaultValue={editingInvoice && editingInvoice.due !== "TBD" ? editingInvoice.due : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Currency <span className="text-red-500">*</span></label>
                      <select 
                         defaultValue={editingInvoice ? editingInvoice.currency : "USD"}
                         className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* ROW 3: Line Items Table */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Line Items <span className="text-red-500">*</span></label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left bg-gray-50">
                        <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-3 w-5/12">Description</th>
                            <th className="px-4 py-3 w-2/12">Qty</th>
                            <th className="px-4 py-3 w-2/12">Rate</th>
                            <th className="px-4 py-3 w-2/12">Tax %</th>
                            <th className="px-4 py-3 w-1/12 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {[1].map((item, i) => (
                            <tr key={i}>
                              <td className="p-2">
                                <input 
                                  type="text" 
                                  placeholder="Item Name" 
                                  defaultValue={editingInvoice ? "Consulting Services" : ""}
                                  className="w-full p-2 border border-transparent hover:border-gray-300 rounded focus:border-blue-400 outline-none" 
                                />
                              </td>
                              <td className="p-2">
                                <input 
                                  type="number" 
                                  placeholder="1" 
                                  defaultValue="1"
                                  className="w-full p-2 border border-transparent hover:border-gray-300 rounded focus:border-blue-400 outline-none" 
                                />
                              </td>
                              <td className="p-2">
                                <input 
                                  type="number" 
                                  placeholder="0.00" 
                                  defaultValue={editingInvoice ? editingInvoice.amount : ""}
                                  className="w-full p-2 border border-transparent hover:border-gray-300 rounded focus:border-blue-400 outline-none" 
                                />
                              </td>
                              <td className="p-2">
                                <select className="w-full p-2 border border-transparent hover:border-gray-300 rounded focus:border-blue-400 outline-none text-sm">
                                  <option>None</option>
                                  <option>GST (18%)</option>
                                  <option>VAT (20%)</option>
                                </select>
                              </td>
                              <td className="p-2 text-right font-medium text-gray-700">
                                {editingInvoice ? `$${editingInvoice.amount}` : "$0.00"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button type="button" className="w-full py-2 bg-gray-50 text-blue-600 text-sm font-semibold hover:bg-gray-100 transition-colors border-t border-gray-200">
                        + Add New Item
                      </button>
                    </div>
                  </div>

                  {/* ROW 4: Financials & Options */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left: Notes, Template, Files */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Notes</label>
                        <textarea 
                          rows={3} 
                          className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                          placeholder="Internal or customer notes..."
                          defaultValue={editingInvoice ? "Thank you for your business." : ""}
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-sm font-semibold text-gray-700">Template</label>
                            <select className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none text-sm">
                              <option>Standard (Free)</option>
                              <option>Modern (Free)</option>
                              <option disabled>Professional (Pro Only)</option>
                            </select>
                         </div>
                         <div>
                            <label className="text-sm font-semibold text-gray-700">Attachments</label>
                            <input 
                              type="file" 
                              className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-white text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                         </div>
                      </div>
                    </div>

                    {/* Right: Calculations & Recurring */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                         <div className="flex justify-between mb-2 text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">{editingInvoice ? `$${editingInvoice.amount}` : "$0.00"}</span>
                         </div>
                         <div className="flex justify-between mb-2 text-sm items-center">
                            <span className="text-gray-600">Discount</span>
                            <input type="number" placeholder="0" className="w-20 p-1 text-right text-sm border rounded bg-white" />
                         </div>
                         <div className="flex justify-between mb-3 text-sm">
                            <span className="text-gray-600">Tax</span>
                            <span className="font-medium">$0.00</span>
                         </div>
                         <div className="flex justify-between pt-3 border-t border-gray-200 text-lg font-bold text-gray-800">
                            <span>Total</span>
                            <span className="text-blue-600">{editingInvoice ? `$${editingInvoice.amount}` : "$0.00"}</span>
                         </div>
                      </div>

                      {/* Recurring Section */}
                      <div className="border border-blue-100 bg-blue-50/50 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                            Recurring Invoice
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <select className="p-2 border border-gray-200 rounded text-sm bg-white"><option>Monthly</option><option>Weekly</option></select>
                           <div className="flex items-center gap-2 text-xs text-gray-600">
                              <input type="checkbox" /> Auto-charge
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </form>
              </div>

              {/* FOOTER - Fixed at bottom */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end items-center gap-3">
                
                {/* CANCEL BUTTON */}
                <button 
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 transition-colors"
                >
                  Cancel
                </button>

                {/* CREATE/UPDATE INVOICE BUTTON */}
                <button 
                  type="submit" 
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-base shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {editingInvoice ? "Update Invoice" : "Create Invoice"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

        {/* RECURRING INVOICE POPUP */}
        {showRecurring && (
          <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50 animate-fadeIn">
            <div className="bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 p-[3px] rounded-2xl shadow-2xl w-96 animate-scaleIn relative">
              <div className="bg-white rounded-2xl p-6 shadow-inner border border-gray-100 relative">
                <button onClick={() => setShowRecurring(false)} className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 transition-colors"><X size={20} /></button>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Recurring Invoice Settings</h3>
                <form className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Frequency</label>
                    <select className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                      <option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option><option>Yearly</option><option>Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Options</label>
                    <div className="mt-2 space-y-2">
                      {["Auto-send", "Auto-charge", "Pause", "Skip", "Modify"].map((option) => (
                        <label key={option} className="flex items-center gap-3 text-gray-700"><input type="checkbox" className="w-4 h-4" />{option}</label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 bg-gray-100 p-2 rounded-md border">Scheduler triggers daily via cron with queue & idempotency.</p>
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-purple-600 text-white py-2.5 rounded-lg shadow-md transition-all duration-300 font-medium">Save Settings</button>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
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
//   Eye, 
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

// // Mock Templates Data
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

//   // Edit State
//   const [editingInvoice, setEditingInvoice] = useState(null);

//   // Template State
//   const [selectedTemplate, setSelectedTemplate] = useState(1);
//   const isPro = false; // Toggle this to true to test Pro features

//   // --- Handlers ---

//   const handleRestore = (id) => {
//     const isUnique = !invoiceData.some(inv => inv.id === id);
//     if (!isUnique) {
//       alert(`Error: Invoice ID ${id} already exists in the active list.`);
//       return;
//     }
//     const itemToRestore = trashItems.find((item) => item.id === id);
//     if (itemToRestore) {
//       setInvoiceData((prev) => [
//         ...prev, 
//         { ...itemToRestore, issue: itemToRestore.deletedDate, due: "TBD", status: "Draft" }
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

//   // Open the form in Edit Mode
//   const handleEdit = (invoice) => {
//     setEditingInvoice(invoice);
//     setShowForm(true);
//   };

//   // Close form and reset edit state
//   const handleCloseForm = () => {
//     setShowForm(false);
//     setEditingInvoice(null);
//   };

//   // Form Submit (Mock)
//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     if (editingInvoice) {
//         // Logic to update existing invoice would go here
//         alert(`Invoice ${editingInvoice.id} updated!`);
//     } else {
//         // Logic to create new invoice would go here
//         alert("New invoice created!");
//     }
//     handleCloseForm();
//   };

//   return (
//     <Layout>

//       <div className="bg-white shadow-sm rounded-md mb-19"></div>

//       <div className="space-y-6">

//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
//           <div>
//             <h2 className="text-2xl text-gray-800">Invoice Management</h2>
//             <p className="text-gray-500">Create, track, and manage your invoices</p>
//           </div>

//           {/* Buttons */}
//           <div className="flex flex-wrap gap-3">
            
//             {/* All Invoice */}
//             <button className="relative inline-flex items-center justify-center p-[2px] rounded-md bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 shadow-lg hover:shadow-[0_0_25px_rgba(66,133,244,0.7)] transition-all duration-300">
//               <span className="flex items-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-md">
//                 <PiInvoiceDuotone size={18} className="mr-2 text-[#4285F4]" />
//                 All Invoice
//               </span>
//             </button>

//             {/* Create Invoice */}
//             <button
//               onClick={() => {
//                 setEditingInvoice(null);
//                 setShowForm(true);
//               }}
//               className="relative inline-flex items-center justify-center p-[2px] rounded-md bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 shadow-lg hover:shadow-[0_0_25px_rgba(66,133,244,0.7)] transition-all duration-300"
//             >
//               <span className="flex items-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-md">
//                 <PlusCircle size={18} className="mr-2 text-[#4285F4]" />
//                 Create Invoice
//               </span>
//             </button>

//             {/* Recurring Invoice */}
//             <button
//               onClick={() => setShowRecurring(true)}
//               className="relative inline-flex items-center justify-center p-[2px] rounded-md bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 shadow-lg hover:shadow-[0_0_25px_rgba(66,133,244,0.7)] transition-all duration-300"
//             >
//               <span className="flex items-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-md">
//                 <FaFileInvoice size={18} className="mr-2 text-[#4285F4]" />
//                 Recurring Invoice
//               </span>
//             </button>

//             {/* Trash Button */}
//             <button 
//               onClick={() => setShowTrash(true)}
//               className="relative inline-flex items-center justify-center p-[2px] rounded-md bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 shadow-lg hover:shadow-[0_0_25px_rgba(66,133,244,0.7)] transition-all duration-300">
//               <span className="flex items-center bg-white text-gray-800 font-semibold py-2 px-4 rounded-md">
//                 <FaTrashAlt size={18} className="mr-2 text-[#4285F4]" />
//                 Trash
//               </span>
//             </button>

//             {/* Template Store Button */}
//             <button 
//               onClick={() => setShowTemplates(true)}
//               className="relative inline-flex items-center justify-center p-[2px] rounded-md bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 shadow-lg hover:shadow-[0_0_25px_rgba(66,133,244,0.7)] transition-all duration-300">
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
//           <select className="p-2 border border-gray-300 rounded-md shadow-sm text-gray-700">
//             <option>All Status</option>
//             <option>Paid</option>
//             <option>Pending</option>
//             <option>Overdue</option>
//           </select>
//           <button className="bg-white border border-blue-600 text-gray-800 font-medium py-2 px-4 rounded-md shadow-sm hover:bg-blue-50 transition-colors duration-200 flex items-center">
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
//                       <button className="hover:text-blue-600 transform hover:scale-110 transition-all duration-200"><Eye size={16} /></button>
//                       {/* PENCIL / EDIT BUTTON */}
//                       <button 
//                         onClick={() => handleEdit(invoice)}
//                         className="hover:text-blue-600 transform hover:scale-110 transition-all duration-200"
//                       >
//                         <Pencil size={16} />
//                       </button>
//                       <button className="hover:text-red-600 transform hover:scale-110 transition-all duration-200"><Download size={16} /></button>
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

//       {/* CREATE / EDIT INVOICE FORM */}
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
//                     {editingInvoice ? `Updating invoice details for ${editingInvoice.id}` : "Fill in the details below"}
//                   </p>
//                 </div>
//                 <button 
//                   onClick={handleCloseForm} 
//                   className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
//                 >
//                   <X size={24} />
//                 </button>
//               </div>

//               {/* SCROLLABLE FORM BODY */}
//               <div className="p-6 overflow-y-auto custom-scrollbar">
//                 <form className="space-y-6" onSubmit={handleFormSubmit}>
                  
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
//                         {/* Mock option to simulate the editing client being selected */}
//                         {editingInvoice && <option value="custom" selected>{editingInvoice.client}</option>}
//                       </select>
//                     </div>

//                     {/* Invoice Number (Auto-gen or Edit) */}
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
//                         defaultValue={editingInvoice ? editingInvoice.currency : "USD"}
//                         className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
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
//                         <div>
//                             <label className="text-sm font-semibold text-gray-700">Template</label>
//                             <select className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none text-sm">
//                               <option>Standard (Free)</option>
//                               <option>Modern (Free)</option>
//                               <option disabled>Professional (Pro Only)</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className="text-sm font-semibold text-gray-700">Attachments</label>
//                             <input 
//                               type="file" 
//                               className="w-full mt-1 p-2 border border-gray-300 rounded-lg bg-white text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                             />
//                         </div>
//                       </div>
//                     </div>

//                     {/* Right: Calculations & Recurring */}
//                     <div className="space-y-4">
//                       <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
//                         <div className="flex justify-between mb-2 text-sm">
//                             <span className="text-gray-600">Subtotal</span>
//                             <span className="font-medium">{editingInvoice ? `$${editingInvoice.amount}` : "$0.00"}</span>
//                         </div>
//                         <div className="flex justify-between mb-2 text-sm items-center">
//                             <span className="text-gray-600">Discount</span>
//                             <input type="number" placeholder="0" className="w-20 p-1 text-right text-sm border rounded bg-white" />
//                         </div>
//                         <div className="flex justify-between mb-3 text-sm">
//                             <span className="text-gray-600">Tax</span>
//                             <span className="font-medium">$0.00</span>
//                         </div>
//                         <div className="flex justify-between pt-3 border-t border-gray-200 text-lg font-bold text-gray-800">
//                             <span>Total</span>
//                             <span className="text-blue-600">{editingInvoice ? `$${editingInvoice.amount}` : "$0.00"}</span>
//                         </div>
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
//                           <select className="p-2 border border-gray-200 rounded text-sm bg-white"><option>Monthly</option><option>Weekly</option></select>
//                           <div className="flex items-center gap-2 text-xs text-gray-600">
//                               <input type="checkbox" /> Auto-charge
//                           </div>
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
//                   onClick={handleCloseForm}
//                   className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 transition-colors"
//                 >
//                   Cancel
//                 </button>

//                 {/* CREATE/UPDATE INVOICE BUTTON */}
//                 <button 
//                   onClick={handleFormSubmit}
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