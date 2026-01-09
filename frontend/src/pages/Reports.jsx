import React, { useState, useMemo, useCallback } from "react";
import Layout from "../components/Layout";
import {
  LineChart,
  Scale,
  DollarSign,
  Download,
  Filter,
  FileText,
  FileSpreadsheet,
} from "lucide-react";

import {
  getProfitLoss,
  exportProfitLossCSV,
  exportProfitLossPDF,
  getBalanceSheet,
  exportBalanceSheetPDF,
  getCashFlow,
  exportCashFlowCSV,
  exportCashFlowPDF,
} from "../api/report.api";

/* =========================
   REPORT CONFIG (STATIC)
========================= */
const REPORTS = [
  {
    key: "profit-loss",
    title: "Profit & Loss",
    subtitle: "Revenue vs Expenses",
    icon: LineChart,
  },
  {
    key: "balance-sheet",
    title: "Balance Sheet",
    subtitle: "Assets & Liabilities",
    icon: Scale,
  },
  {
    key: "cash-flow",
    title: "Cash Flow",
    subtitle: "Inflows & Outflows",
    icon: DollarSign,
  },
];

const Reports = () => {
  /* =========================
     FILTER STATE (SINGLE SOURCE)
  ========================= */
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    currency: "USD",
    clientId: "",
  });

  const queryParams = useMemo(() => {
    const p = {};
    if (filters.startDate) p.startDate = filters.startDate;
    if (filters.endDate) p.endDate = filters.endDate;
    if (filters.currency) p.currency = filters.currency;
    if (filters.clientId) p.clientId = filters.clientId;
    return p;
  }, [filters]);

  /* =========================
     DOWNLOAD HELPERS
  ========================= */
  const downloadBlob = useCallback((data, filename, type) => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }, []);

  /* =========================
     REPORT HANDLERS (NO RERENDERS)
  ========================= */
  const handleGenerate = useCallback(
    async (key) => {
      switch (key) {
        case "profit-loss":
          await getProfitLoss(queryParams);
          break;
        case "balance-sheet":
          await getBalanceSheet(queryParams);
          break;
        case "cash-flow":
          await getCashFlow(queryParams);
          break;
        default:
          break;
      }
    },
    [queryParams]
  );

  const handleExportCSV = useCallback(
    async (key) => {
      let res;
      if (key === "profit-loss") {
        res = await exportProfitLossCSV(queryParams);
        downloadBlob(res.data, "profit-loss.csv", "text/csv");
      }
      if (key === "cash-flow") {
        res = await exportCashFlowCSV(queryParams);
        downloadBlob(res.data, "cash-flow.csv", "text/csv");
      }
    },
    [queryParams, downloadBlob]
  );

  const handleExportPDF = useCallback(
    async (key) => {
      let res;
      if (key === "profit-loss") {
        res = await exportProfitLossPDF(queryParams);
        downloadBlob(res.data, "profit-loss.pdf", "application/pdf");
      }
      if (key === "balance-sheet") {
        res = await exportBalanceSheetPDF(queryParams);
        downloadBlob(res.data, "balance-sheet.pdf", "application/pdf");
      }
      if (key === "cash-flow") {
        res = await exportCashFlowPDF(queryParams);
        downloadBlob(res.data, "cash-flow.pdf", "application/pdf");
      }
    },
    [queryParams, downloadBlob]
  );

  /* =========================
     RENDER
  ========================= */
  return (
    <Layout>
      <div className="space-y-10 mt-20">

        {/* HEADER */}
        <div>
          <h2 className="text-2xl text-gray-800">Financial Reports</h2>
          <p className="text-gray-500">
            Generate professional accounting reports
          </p>
        </div>

        {/* REPORT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REPORTS.map((r) => (
            <div
              key={r.key}
              className="bg-gray-800 rounded-2xl p-6 border shadow-md"
            >
              <div className="flex flex-col items-center mb-6">
                <div className="p-4 rounded-xl bg-blue-100 mb-4">
                  <r.icon size={34} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-200">
                  {r.title}
                </h3>
                <p className="text-sm text-gray-400">{r.subtitle}</p>
              </div>

              <button
                onClick={() => handleGenerate(r.key)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-md
                bg-linear-to-r from-blue-500 to-indigo-600 text-white"
              >
                <Download size={16} />
                Generate
              </button>

              <div className="flex gap-2 mt-4">
                {(r.key !== "balance-sheet") && (
                  <button
                    onClick={() => handleExportCSV(r.key)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md bg-gray-200"
                  >
                    <FileSpreadsheet size={14} /> CSV
                  </button>
                )}

                <button
                  onClick={() => handleExportPDF(r.key)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md bg-gray-200"
                >
                  <FileText size={14} /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="flex items-center gap-2 font-semibold mb-4">
            <Filter size={18} /> Filters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="date"
              onChange={(e) =>
                setFilters((f) => ({ ...f, startDate: e.target.value }))
              }
              className="border p-2 rounded"
            />
            <input
              type="date"
              onChange={(e) =>
                setFilters((f) => ({ ...f, endDate: e.target.value }))
              }
              className="border p-2 rounded"
            />
            <select
              onChange={(e) =>
                setFilters((f) => ({ ...f, currency: e.target.value }))
              }
              className="border p-2 rounded"
            >
              <option>USD</option>
              <option>EUR</option>
              <option>INR</option>
              <option>GBP</option>
            </select>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Reports;





// import React from "react";
// import Layout from "../components/Layout";
// import { LineChart, Scale, DollarSign, Download, Filter, FileText, FileSpreadsheet } from "lucide-react";
// import {getProfitLoss} from "../api/report.api";``
// const ReportCards = [
//   {
//     title: "Profit & Loss",
//     subtitle: "Detailed P&L statement",
//     icon: LineChart,
//     mapping: "Revenue – Expenses per category",
//   },
//   {
//     title: "Balance Sheet",
//     subtitle: "Assets and liabilities",
//     icon: Scale,
//     mapping: "Assets, Liabilities, Equity",
//   },
//   {
//     title: "Cash Flow",
//     subtitle: "Cash flow analysis",
//     icon: DollarSign,
//     mapping: "Inflows and Outflows",
//   },
// ];

// const Reports = () => {
//   return (
//     <Layout>
//       {/* REPORT CARDS */}
//       <div className="space-y-9 mt-20">
//         <div>
//           <h2 className="text-2xl text-gray-800">Financial Reports</h2>
//           <p className="text-gray-500">
//             Generate comprehensive financial reports and analytics
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
//           {ReportCards.map((report, index) => (
//             <div
//               key={index}
//               className="group relative bg-gray-800 rounded-2xl border border-gray-200 p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
//             >
//               {/* Top Accent Bar */}
//               <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl opacity-70 group-hover:opacity-100 transition-opacity"></div>

//               {/* Icon Section */}
//               <div className="flex flex-col items-center mb-6 mt-2">
//                 <div className="p-4 rounded-xl bg-gradient-to-r from-orange-100 to-orange-200 shadow-inner mb-4 group-hover:scale-110 transition-transform duration-300">
//                   <report.icon size={36} className="text-blue-600" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-200 mb-1">
//                   {report.title}
//                 </h3>
//                 <p className="text-sm text-gray-500 text-center">
//                   {report.subtitle}
//                 </p>

//                 {/* Mapping Information */}
//                 <p className="text-xs text-gray-400 mt-2 italic">
//                   Mapping: {report.mapping}
//                 </p>
//               </div>

//               {/* Button */}
//               <button
//                 className="relative w-full flex items-center justify-center font-medium py-2 rounded-md
//                 bg-gradient-to-r from-[#2f7af3] via-[#55c1e8] to-[#ce27f3] text-white shadow-md hover:shadow-lg transition-all"
//               >
//                 <Download size={18} className="mr-2" />
//                 Generate
//               </button>
//             </div>
//           ))}
//         </div>

//           {/* FILTERS SECTION */}
//       <div className="bg-white shadow-lg rounded-md mb-8 p-6 border border-gray-100 ">
//         <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
//           <Filter size={18} /> Filters
//         </h3>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {/* Date Range */}
//           <div className="flex flex-col">
//             <label className="text-sm text-gray-600 mb-1">Date Range</label>
//             <input
//               type="date"
//               className="border rounded-md border-gray-300 p-2 text-sm text-gray-700"
//             />
//           </div>

//           {/* Currency */}
//           <div className="flex flex-col">
//             <label className="text-sm text-gray-600 mb-1">Currency</label>
//             <select className="border rounded-md border-gray-300 p-2 text-sm text-gray-700">
//               <option>USD</option>
//               <option>EUR</option>
//               <option>GBP</option>
//               <option>INR</option>
//             </select>
//           </div>

//           {/* Client */}
//           <div className="flex flex-col">
//             <label className="text-sm text-gray-600 mb-1">Client</label>
//             <select className="border border-gray-300 rounded-md p-2 text-sm text-gray-700">
//               <option>All Clients</option>
//               <option>Client A</option>
//               <option>Client B</option>
//               <option>Client C</option>
//             </select>
//           </div>
//         </div>

//         {/* Export Buttons */}
//         <div className="flex gap-3 mt-6">
//           <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-400 text-black hover:bg-blue-200 transition cursor-pointer">
//             <FileSpreadsheet size={18} /> Export CSV
//           </button>

//           <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-400 text-black hover:bg-red-200 transition cursor-pointer">
//             <FileText size={18} /> Export PDF
//           </button>
//         </div>
//       </div>

//         {/* RECENTLY GENERATED */}
//         <div className="pt-8">
//           <h3 className="text-xl font-semibold mb-4 text-gray-800">
//             Recently Generated
//           </h3>
//           <div className="bg-white p-4 rounded-lg shadow-sm text-gray-400 text-center border border-gray-100">
//             No reports have been generated this period.
//           </div>
//         </div>
//       </div>
      
//     </Layout>
//   );
// };

// export default Reports;
