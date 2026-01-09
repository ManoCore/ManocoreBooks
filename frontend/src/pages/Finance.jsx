import React, { useState, useEffect, useMemo, useCallback } from "react";
import Layout from "../components/Layout";
import {
  getFinanceKPI,
  getTransactions,
  exportTransactionsCSV,
  exportTransactionsPDF,
  getCategorySummary,
} from "../api/finance.api";

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  Filter,
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity,
} from "lucide-react";

const Finance = () => {
  /* =========================
     FILTERS & PAGINATION
  ========================= */
  const [filterType, setFilterType] = useState("All");
  const [filterCurrency, setFilterCurrency] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const limit = 20;

  /* =========================
     DATA STATES
  ========================= */
  const [transactions, setTransactions] = useState([]);
  const [kpis, setKpis] = useState({ income: 0, expenses: 0, net: 0 });
  const [categories, setCategories] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  /* =========================
     QUERY PARAMS (MEMOIZED)
  ========================= */
  const queryParams = useMemo(() => {
    const params = { page, limit };

    if (filterType !== "All") params.type = filterType.toLowerCase();
    if (filterCurrency !== "All") params.currency = filterCurrency;
    if (filterDate) {
      params.startDate = filterDate;
      params.endDate = filterDate;
    }

    return params;
  }, [filterType, filterCurrency, filterDate, page]);

  /* =========================
     DATA FETCHING
  ========================= */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [kpiRes, txnRes, catRes] = await Promise.all([
        getFinanceKPI(queryParams),
        getTransactions(queryParams),
        getCategorySummary(queryParams),
      ]);

      setKpis({
        income: kpiRes.data.totalIncome,
        expenses: kpiRes.data.totalExpenses,
        net: kpiRes.data.netProfit,
      });

      setTransactions(txnRes.data.transactions);
      setTotalRecords(txnRes.data.pagination.total);
      setCategories(catRes.data);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =========================
     CLIENT-SIDE SEARCH (NO API HIT)
  ========================= */
  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;

    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  /* =========================
     EXPORT HANDLERS
  ========================= */
  const handleExportCSV = useCallback(async () => {
    const res = await exportTransactionsCSV(queryParams);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
  }, [queryParams]);

const handleExportPDF = useCallback(async () => {
  try {
    const res = await exportTransactionsPDF(queryParams);

    const blob = new Blob([res.data], { type: "application/pdf" });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.pdf";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("PDF export failed", err);
  }
}, [queryParams]);


  return (
    <Layout>
      <div className="bg-gray-50/50 min-h-screen pb-10 mt-19">
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl text-gray-800">Financial Overview</h2>
            <p className="text-gray-500">Real-time insights into your finances</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="btn-secondary">
              <FileText size={16} /> Export CSV
            </button>
            <button onClick={handleExportPDF} className="btn-primary">
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <KpiCard
            title="Total Income"
            value={kpis.income}
            icon={<TrendingUp />}
            color="green"
          />
          <KpiCard
            title="Total Expenses"
            value={kpis.expenses}
            icon={<TrendingDown />}
            color="red"
          />
          <KpiCard
            title="Net Profit"
            value={kpis.net}
            icon={<DollarSign />}
            color="blue"
          />
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <FilterBar
            filterType={filterType}
            setFilterType={setFilterType}
            filterCurrency={filterCurrency}
            setFilterCurrency={setFilterCurrency}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <TransactionTable
            transactions={filteredTransactions}
            loading={loading}
          />

          <Pagination
            page={page}
            setPage={setPage}
            total={totalRecords}
            limit={limit}
          />
        </div>
      </div>
    </Layout>
  );
};

/* =========================
   MEMOIZED SUB-COMPONENTS
========================= */

const KpiCard = React.memo(({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow border">
    <div className={`text-${color}-600 mb-2`}>{icon}</div>
    <p className="text-sm text-gray-500">{title}</p>
    <h3 className="text-3xl font-bold">${value.toLocaleString()}</h3>
  </div>
));

const FilterBar = React.memo(
  ({
    filterType,
    setFilterType,
    filterCurrency,
    setFilterCurrency,
    filterDate,
    setFilterDate,
    searchQuery,
    setSearchQuery,
  }) => (
    <div className="p-4 border-b flex flex-wrap gap-3 bg-gray-50">
      <input
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input"
      />
      <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
        <option>All</option>
        <option>Income</option>
        <option>Expense</option>
      </select>
      <select
        value={filterCurrency}
        onChange={(e) => setFilterCurrency(e.target.value)}
      >
        <option>All</option>
        <option>USD</option>
        <option>EUR</option>
        <option>GBP</option>
      </select>
      <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
    </div>
  )
);

const TransactionTable = React.memo(({ transactions, loading }) => {
  if (loading)
    return <div className="p-10 text-center text-gray-400">Loading...</div>;

  if (!transactions.length)
    return <div className="p-10 text-center text-gray-400">No data</div>;

  return (
    <table className="w-full">
      <tbody>
        {transactions.map((t) => (
          <tr key={t._id} className="border-b hover:bg-gray-50">
            <td className="p-4">{t.description}</td>
            <td className="p-4">{t.category}</td>
            <td className="p-4">{t.type}</td>
            <td className="p-4 font-bold">
              {t.amount} {t.currency}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});

const Pagination = React.memo(({ page, setPage, total, limit }) => {
  const totalPages = Math.ceil(total / limit);
  return (
    <div className="p-4 flex justify-between text-sm">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          Prev
        </button>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
});

export default Finance;


// import React, { useState, useMemo } from "react";
// import Layout from "../components/Layout";
// import { 
//   DollarSign, 
//   TrendingUp, 
//   TrendingDown, 
//   Download, 
//   FileText, 
//   Filter, 
//   Search, 
//   Calendar, 
//   ArrowUpRight, 
//   ArrowDownRight, 
//   Wallet,
//   PieChart,
//   Activity
// } from "lucide-react";

// // --- Mock Data ---
// const initialTransactions = [
//   { id: "TXN-1001", date: "2024-03-15", description: "Client Payment - Acme Corp", category: "Sales", type: "Income", amount: 12500.00, currency: "USD", status: "Completed" },
//   { id: "TXN-1002", date: "2024-03-14", description: "AWS Server Costs", category: "Technology", type: "Expense", amount: 450.00, currency: "USD", status: "Completed" },
//   { id: "TXN-1003", date: "2024-03-12", description: "Office Rent (Q1)", category: "Operations", type: "Expense", amount: 3200.00, currency: "EUR", status: "Pending" },
//   { id: "TXN-1004", date: "2024-03-10", description: "Consulting Fee", category: "Services", type: "Income", amount: 5000.00, currency: "USD", status: "Completed" },
//   { id: "TXN-1005", date: "2024-03-08", description: "Staff Payroll", category: "Payroll", type: "Expense", amount: 18500.00, currency: "USD", status: "Completed" },
//   { id: "TXN-1006", date: "2024-03-05", description: "Software License", category: "Technology", type: "Expense", amount: 299.00, currency: "USD", status: "Completed" },
//   { id: "TXN-1007", date: "2024-03-01", description: "Marketing Campaign", category: "Marketing", type: "Expense", amount: 1200.00, currency: "GBP", status: "Pending" },
//   { id: "TXN-1008", date: "2024-02-28", description: "New Project Deposit", category: "Sales", type: "Income", amount: 8500.00, currency: "USD", status: "Completed" },
//   { id: "TXN-1009", date: "2024-02-25", description: "Office Supplies", category: "Operations", type: "Expense", amount: 150.00, currency: "USD", status: "Completed" },
//   { id: "TXN-1010", date: "2024-02-20", description: "Refund Processed", category: "Refund", type: "Expense", amount: 500.00, currency: "USD", status: "Completed" },
// ];

// const expenseCategories = [
//   { category: "Payroll", amount: 486234, totalMax: 600000, color: "bg-blue-500" },
//   { category: "Operations", amount: 178920, totalMax: 600000, color: "bg-indigo-500" },
//   { category: "Technology", amount: 125680, totalMax: 600000, color: "bg-purple-500" },
//   { category: "Marketing", amount: 89340, totalMax: 600000, color: "bg-pink-500" },
// ];

// const Finance = () => {
//   // State for Filters
//   const [transactions, ] = useState(initialTransactions);
//   const [filterType, setFilterType] = useState("All");
//   const [filterCurrency, setFilterCurrency] = useState("All");
//   const [filterDate, setFilterDate] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");

//   // --- Dynamic Calculations ---
  
//   // Filter Logic
//   const filteredTransactions = useMemo(() => {
//     return transactions.filter(t => {
//       const matchType = filterType === "All" || t.type === filterType;
//       const matchCurrency = filterCurrency === "All" || t.currency === filterCurrency;
//       const matchDate = filterDate === "" || t.date === filterDate;
//       const matchSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                           t.category.toLowerCase().includes(searchQuery.toLowerCase());
      
//       return matchType && matchCurrency && matchDate && matchSearch;
//     });
//   }, [transactions, filterType, filterCurrency, filterDate, searchQuery]);

//   // KPI Calculations based on filtered data (Simplified for demo, assumes 1:1 currency conversion or USD view)
//   const kpis = useMemo(() => {
//     const income = filteredTransactions
//       .filter(t => t.type === "Income")
//       .reduce((acc, curr) => acc + curr.amount, 0);
    
//     const expenses = filteredTransactions
//       .filter(t => t.type === "Expense")
//       .reduce((acc, curr) => acc + curr.amount, 0);

//     return {
//       income,
//       expenses,
//       net: income - expenses
//     };
//   }, [filteredTransactions]);

//   // --- Handlers ---

//   const handleExportCSV = () => {
//     // 1. Convert JSON to CSV string
//     const headers = ["ID", "Date", "Description", "Category", "Type", "Amount", "Currency", "Status"];
//     const rows = filteredTransactions.map(t => 
//       [t.id, t.date, `"${t.description}"`, t.category, t.type, t.amount, t.currency, t.status].join(",")
//     );
//     const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");

//     // 2. Create download link
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", "financial_report.csv");
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleExportPDF = () => {
//     // Note: Real PDF generation requires libraries like jsPDF. 
//     // This is a UI simulation.
//     alert("Generating PDF Report... (Download started)");
//   };

//   return (
//     <Layout>
//       <div className="bg-gray-50/50 min-h-screen pb-10 mt-19">
        
//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
//           <div>
//             <h2 className="text-2xl  text-gray-800 tracking-tight flex items-center gap-2">
//              Financial Overview
//             </h2>
//             <p className="text-gray-500 mt-1">Real-time insights into your financial performance.</p>
//           </div>
          
//           <div className="flex gap-2">
//              <button 
//                onClick={handleExportCSV}
//                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm cursor-pointer"
//              >
//                <FileText size={16} /> Export CSV
//              </button>
//              <button 
//                onClick={handleExportPDF}
//                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 hover:scale-3d text-black rounded-lg font-medium  hover:scale-[1.03] transition-all duration-300 shadow-md shadow-blue-200 cursor-pointer"
//              >
//                <Download size={16} /> Download PDF
//              </button>
//           </div>
//         </div>

//         {/* KPI Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 cursor-pointer">
          
//           {/* Income Card */}
//           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
//             <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
//             <div className="relative z-10">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="p-2 bg-green-100 rounded-lg text-green-600">
//                   <TrendingUp size={24} />
//                 </div>
//                 <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
//                   +18.5% <span className="text-gray-400 ml-1 font-normal">vs last month</span>
//                 </span>
//               </div>
//               <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Income</p>
//               <h3 className="text-3xl font-bold text-gray-800 mt-1">${kpis.income.toLocaleString()}</h3>
//             </div>
//           </div>

//           {/* Expense Card */}
//           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer">
//             <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
//             <div className="relative z-10">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="p-2 bg-red-100 rounded-lg text-red-600">
//                   <TrendingDown size={24} />
//                 </div>
//                 <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
//                   +4.2% <span className="text-gray-400 ml-1 font-normal">vs last month</span>
//                 </span>
//               </div>
//               <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Expenses</p>
//               <h3 className="text-3xl font-bold text-gray-800 mt-1">${kpis.expenses.toLocaleString()}</h3>
//             </div>
//           </div>

//           {/* Net Profit Card */}
//           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
//             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
//             <div className="relative z-10">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
//                   <DollarSign size={24} />
//                 </div>
//                 <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
//                   Healthy
//                 </span>
//               </div>
//               <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Net Profit</p>
//               <h3 className={`text-3xl font-bold mt-1 ${kpis.net >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
//                 ${kpis.net.toLocaleString()}
//               </h3>
//             </div>
//           </div>
//         </div>

//         {/* Middle Section: Breakdown & Charts */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
//           {/* Expense Breakdown */}
//           <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
//                 <PieChart size={18} className="text-gray-400" /> Expense Breakdown
//               </h3>
//               <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Report</button>
//             </div>
            
//             <div className="space-y-5">
//               {expenseCategories.map((item) => (
//                 <div key={item.category} className="group">
//                   <div className="flex justify-between text-sm font-medium text-gray-700 mb-1.5">
//                     <span className="flex items-center gap-2">
//                       <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
//                       {item.category}
//                     </span>
//                     <span className="font-bold text-gray-900">${item.amount.toLocaleString()}</span>
//                   </div>
//                   <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
//                     <div 
//                       className={`${item.color} h-2.5 rounded-full transition-all duration-500 ease-out group-hover:opacity-80`} 
//                       style={{ width: `${(item.amount / item.totalMax) * 100}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Mini Cash Flow / Activity */}
//           <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white cursor-pointer">
//             <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
//               <Activity size={18} className="text-blue-400" /> Cash Flow
//             </h3>
//             <p className="text-gray-400 text-sm mb-6">Recent movement summary</p>
            
//             <div className="space-y-4">
//                {/* Decorative Bar Chart Simulation */}
//                <div className="flex items-end justify-between h-32 gap-2 mb-6 px-2">
//                   {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
//                     <div key={i} className="w-full bg-gray-700 rounded-t-md hover:bg-blue-500 transition-colors cursor-pointer relative group" style={{ height: `${h}%` }}>
//                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
//                          ${h}k
//                        </div>
//                     </div>
//                   ))}
//                </div>
               
//                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
//                   <div className="flex justify-between items-center mb-1">
//                     <span className="text-sm text-gray-300">Net Cash Flow</span>
//                     <span className="text-sm font-bold text-green-400">+24.5%</span>
//                   </div>
//                   <div className="text-2xl font-bold">$45,200</div>
//                </div>
//             </div>
//           </div>
//         </div>

//         {/* Transaction Drill-Down Section */}
//         <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 overflow-hidden cursor-pointer">
          
//           {/* Filters Header */}
//           <div className="p-5 border-b border-gray-100 bg-gray-50/50">
//             <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
//               <h3 className="text-lg font-bold text-gray-800">Transactions</h3>
              
//               <div className="flex flex-wrap items-center gap-3">
//                 {/* Search */}
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//                   <input 
//                     type="text" 
//                     placeholder="Search transaction..." 
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full md:w-64"
//                   />
//                 </div>

//                 {/* Type Filter */}
//                 <div className="relative">
//                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//                    <select 
//                      value={filterType}
//                      onChange={(e) => setFilterType(e.target.value)}
//                      className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
//                    >
//                      <option value="All">All Types</option>
//                      <option value="Income">Income</option>
//                      <option value="Expense">Expense</option>
//                    </select>
//                 </div>

//                 {/* Currency Filter */}
//                 <select 
//                    value={filterCurrency}
//                    onChange={(e) => setFilterCurrency(e.target.value)}
//                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
//                  >
//                    <option value="All">All Currency</option>
//                    <option value="USD">USD ($)</option>
//                    <option value="EUR">EUR (€)</option>
//                    <option value="GBP">GBP (£)</option>
//                  </select>

//                 {/* Date Filter */}
//                 <div className="relative">
//                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//                   <input 
//                     type="date" 
//                     value={filterDate}
//                     onChange={(e) => setFilterDate(e.target.value)}
//                     className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-600"
//                   />
//                 </div>
                
//                 {/* Reset Filters */}
//                 {(filterType !== "All" || filterCurrency !== "All" || filterDate !== "" || searchQuery !== "") && (
//                   <button 
//                     onClick={() => { setFilterType("All"); setFilterCurrency("All"); setFilterDate(""); setSearchQuery(""); }}
//                     className="text-sm text-red-500 hover:text-red-700 font-medium px-2"
//                   >
//                     Reset
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
//                   <th className="px-6 py-4 font-semibold">Transaction ID</th>
//                   <th className="px-6 py-4 font-semibold">Date</th>
//                   <th className="px-6 py-4 font-semibold">Description</th>
//                   <th className="px-6 py-4 font-semibold">Category</th>
//                   <th className="px-6 py-4 font-semibold">Type</th>
//                   <th className="px-6 py-4 font-semibold">Amount</th>
//                   <th className="px-6 py-4 font-semibold">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100 bg-white">
//                 {filteredTransactions.length > 0 ? (
//                   filteredTransactions.map((txn) => (
//                     <tr key={txn.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
//                       <td className="px-6 py-4 text-sm font-medium text-gray-900 group-hover:text-blue-600">
//                         {txn.id}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-500">
//                         {txn.date}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-700 font-medium">
//                         {txn.description}
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-500">
//                         <span className="px-2 py-1 bg-gray-100 rounded text-xs">{txn.category}</span>
//                       </td>
//                       <td className="px-6 py-4 text-sm">
//                         <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
//                           txn.type === "Income" 
//                             ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
//                             : "bg-rose-100 text-rose-700 border border-rose-200"
//                         }`}>
//                           {txn.type === "Income" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
//                           {txn.type}
//                         </span>
//                       </td>
//                       <td className={`px-6 py-4 text-sm font-bold font-mono ${
//                         txn.type === "Income" ? "text-emerald-600" : "text-gray-800"
//                       }`}>
//                         {txn.type === "Income" ? "+" : "-"}{txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-gray-400 text-xs font-normal">{txn.currency}</span>
//                       </td>
//                       <td className="px-6 py-4 text-sm">
//                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                            txn.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
//                          }`}>
//                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
//                              txn.status === "Completed" ? "bg-green-500" : "bg-yellow-500"
//                            }`}></span>
//                            {txn.status}
//                          </span>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
//                       <div className="flex flex-col items-center justify-center">
//                         <Filter size={48} className="mb-2 opacity-20" />
//                         <p>No transactions found matching your filters.</p>
//                         <button 
//                           onClick={() => { setFilterType("All"); setFilterCurrency("All"); setFilterDate(""); setSearchQuery(""); }}
//                           className="mt-2 text-blue-600 hover:underline text-sm"
//                         >
//                           Clear all filters
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
          
//           {/* Pagination Footer (Static for demo) */}
//           <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 text-sm text-gray-500">
//              <span>Showing {filteredTransactions.length} of {initialTransactions.length} results</span>
//              <div className="flex gap-2">
//                 <button className="px-3 py-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50" disabled>Previous</button>
//                 <button className="px-3 py-1 border border-gray-300 rounded hover:bg-white">Next</button>
//              </div>
//           </div>
//         </div>

//       </div>
//     </Layout>
//   );
// };

// export default Finance;