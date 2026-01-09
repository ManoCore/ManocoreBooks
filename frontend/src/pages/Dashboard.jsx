






import React from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard"; // Assuming this component exists
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon, // Used for Pending/Overdue
  CheckCircleIcon, // Used for Paid
} from "@heroicons/react/24/solid";
import { Filter, ChevronDown, Search, ArrowUpDown, Plus } from "lucide-react"; // Added Search, ArrowUpDown, Plus
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";

// --- 1. Top Stat Cards Data ---
const statsData = [
  {
    title: "Total Revenue",
    value: "$2,48,74",
    percentage: "7.6%",
    icon: CurrencyDollarIcon,
    color: "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-gray-900", // Dark icon for contrast
    trend: "positive", // Trend is inferred from the percentage color in the image
  },
  {
    title: "Invoices Sent",
    value: "245",
    percentage: "1.5%",
    icon: DocumentTextIcon,
    color: "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-gray-900",
    trend: "negative", // Color is pinkish/red in the image
  },
  {
    title: "Paid Invoices",
    value: "173",
    percentage: "1.41%",
    icon: CheckCircleIcon,
    color: "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-gray-900",
    trend: "negative", // Color is pinkish/red in the image
  },
  {
    title: "Pending Payments",
    value: "$37,479",
    percentage: "2.61%",
    icon: ClockIcon,
    color: "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-gray-900",
    trend: "positive", // Color is green in the image
  },
];

// --- 2. Invoices Insight Bar Chart Data ---
// Recharts needs data in a specific format for the stacked/grouped bar chart
const invoicesInsightData = [
  { day: "12", invoice: 50, payment: 40 },
  { day: "13", invoice: 65, payment: 55 },
  { day: "14", invoice: 85, payment: 70 },
  { day: "15", invoice: 70, payment: 60 },
  { day: "16", invoice: 80, payment: 65 },
  { day: "17", invoice: 90, payment: 75 },
  { day: "18", invoice: 94, payment: 80, tooltipLabel: "15th April" }, // Highlighted bar
  { day: "19", invoice: 80, payment: 68 },
  { day: "20", invoice: 75, payment: 60 },
  { day: "21", invoice: 55, payment: 45 },
];

// --- 3. Payment Status Radial Chart Data ---
const totalPaid = 41754.0;
const totalUnpaid = 14740.2;
const totalOverdue = 11475.41;
const total = totalPaid + totalUnpaid + totalOverdue;
const paidPercent = ((totalPaid / total) * 100).toFixed(2);

const paymentStatusData = [
  {
    name: "Paid",
    value: totalPaid,
    fill: "#3B82F6", // Blue
    percent: totalPaid / total,
  },
  {
    name: "Unpaid",
    value: totalUnpaid,
    fill: "#FACC15", // Yellow/Gold - approximating the image color
    percent: totalUnpaid / total,
  },
  {
    name: "Overdue",
    value: totalOverdue,
    fill: "#EF4444", // Red - approximating the image color
    percent: totalOverdue / total,
  },
];

// --- 4. Top Clients Data ---
const topClientsData = [
  {
    name: "Infinite Arts",
    description: "Architecture Firm and Studio",
    status: "Paid",
    amount: "Last Billed: $4,4741.80",
    date: "14/04/2025",
    color: "bg-blue-500",
  },
  {
    name: "Hexagon LLC",
    description: "Digital Design Agency",
    status: null,
    amount: null,
    date: null,
    color: "bg-orange-500",
  },
  {
    name: "Global Ventures",
    description: "Architecture Firm and Studio",
    status: "Paid",
    amount: "Last Billed: $4,4741.80",
    date: "14/04/2025",
    color: "bg-red-500",
  },
];

// --- 5. Invoice Summary Data ---
const invoiceSummaryData = [
  { label: "Sent", value: 745, color: "#3B82F6" }, // Blue
  { label: "Paid", value: 173, color: "#10B981" }, // Green
  { label: "Overdue", value: 287, color: "#EF4444" }, // Red
  { label: "In Draft", value: 241, color: "#9CA3AF" }, // Gray/Lighter color
];

// -------------------- NEW: Recent Transactions (static demo data) --------------------
const recentTransactions = [
  { id: "#TXN001", client: "Infinite Arts", amount: "$4,280.00", status: "Paid", date: "14 April 2025" },
  { id: "#TXN002", client: "Hexagon LLC", amount: "$2,740.00", status: "Pending", date: "13 April 2025" },
  { id: "#TXN003", client: "Global Ventures", amount: "$6,120.00", status: "Overdue", date: "11 April 2025" },
];

// Custom Tooltip for Invoices Insight Chart to show the highlighted date
const InvoicesTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const tooltipData = invoicesInsightData.find((d) => d.day === label);
    const invoice = payload.find((p) => p.dataKey === "invoice");
    const payment = payload.find((p) => p.dataKey === "payment");

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md text-sm cursor-pointer ">
        {tooltipData?.tooltipLabel && (
          <p className="font-bold text-xs text-purple-600 mb-1">{tooltipData.tooltipLabel}</p>
        )}
        <p className="text-gray-700">Day: {label}</p>
        <p className="text-purple-500">Invoice: {invoice?.value}</p>
        <p className="text-blue-500">Payment: {payment?.value}</p>
      </div>
    );
  }
  return null;
};

// Custom Radial Bar Label (for the image's center text)
const CustomRadialBarLabel = ({ viewBox }) => {
  const { cx, cy } = viewBox;
  return (
    <>
      <text
        x={cx}
        y={cy - 10}
        fill="#10B981" // Green color
        textAnchor="middle"
        dominantBaseline="central"
        className="text-2xl font-bold"
      >
        +{paidPercent}%
      </text>
      <text
        x={cx}
        y={cy + 10}
        fill="#4B5563"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs"
      >
        Average payment
      </text>
    </>
  );
};

const Dashboard = () => {
  return (
    // Assuming Layout component provides the sidebar/header/main content wrapper
    <Layout>
      {/* Dashboard Title - Matches the image */}
      <h1 className="text-2xl font-bold text-gray-900 mb-19 cursor-pointer"></h1>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-2">
        {/* --- Top Row: Stat Cards and Invoices Insight Chart --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section 1: Stat Cards (2 columns on mobile, 1 on desktop) */}
          <div className="lg:col-span-1 grid grid-cols-2 gap-4">
            {statsData.slice(0, 4).map((s, idx) => (
              <div key={idx} className="bg-gray-300 p-1 rounded-lg shadow-sm">
                <StatCard
                  title={s.title}
                  value={s.value}
                  percentage={s.percentage}
                  icon={s.icon}
                  colorClass={s.color}
                  trendType={s.trend}
                  mini={true} // A prop to style it as a smaller card like in the image
                />
              </div>
            ))}
          </div>

          {/* Section 2: Invoices Insight Bar Chart (1 column on mobile, 2 on desktop) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm ">
            <div className="flex justify-between items-center mb-4 ">
              <h2 className="text-lg font-semibold text-gray-900">Invoices Insight</h2>
              <div className="flex items-center text-sm text-gray-600">
                <span className="flex items-center mr-4">
                  <span className="w-2 h-2 rounded-full bg-purple-500 mr-1"></span>Invoice
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>Payment
                </span>
              </div>
            </div>

            <div className="w-full h-72 cursor-pointer ">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={invoicesInsightData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    domain={[0, 100]} // Match Y-axis range from the image
                  />
                  <Tooltip content={<InvoicesTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="invoice" fill="#A855F7" radius={[4, 4, 0, 0]} barSize={10} />
                  <Bar dataKey="payment" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- Bottom Row: Payment Status, Top Clients, Invoice Summary --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
          {/* Section 3: Payment Status Radial Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm cursor-pointer">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h2>
            <div className="flex flex-col items-center">
              <div className="w-full h-56 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    barSize={10}
                    data={paymentStatusData}
                    startAngle={90} // To align paid section at the top like in the image
                    endAngle={-270}
                  >
                    <RadialBar minAngle={15} label={<CustomRadialBarLabel />} background clockWise dataKey="percent" />
                    {/* Tooltip for hover functionality */}
                    <Tooltip
                      contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #E5E7EB" }}
                      formatter={(value, name, props) => [`$${(value * total).toFixed(2)}`, props.payload.name]}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              {/* Radial Chart Legend/Summary */}
              <p className="text-3xl font-bold text-gray-900 mt-4">${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              <div className="grid grid-cols-2 gap-4 text-sm mt-4 w-full">
                <div className="flex items-center justify-between p-2 rounded-lg border border-gray-100">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: "#FACC15" }}></span>
                    <span className="text-gray-600">Unpaid</span>
                  </span>
                  <span className="font-semibold text-gray-900">${totalUnpaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg border border-gray-100">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: "#EF4444" }}></span>
                    <span className="text-gray-600">Overdue</span>
                  </span>
                  <span className="font-semibold text-gray-900">${totalOverdue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Top Clients */}
          <div className="bg-white p-6 rounded-lg shadow-sm cursor-pointer">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top Clients</h2>
              <button className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-800">
                <Filter size={16} className="mr-1" />
                Filter
              </button>
            </div>

            <div className="space-y-4">
              {topClientsData.map((client, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg ${client.color} mr-3`}>
                      {client.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <button className="text-gray-400 hover:text-gray-600">
                      <ChevronDown size={18} />
                    </button>
                    {client.status && (
                      <p
                        className={`text-xs mt-1 px-2 py-0.5 rounded-full font-medium ${
                          client.status === "Paid" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {client.status}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Invoice Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm cursor-pointer">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h2>
            <p className="text-4xl font-bold text-gray-900 mb-6">1245</p>

            {/* Simple Bar/Progress style summary */}
            <div className="space-y-2">
              <div className="flex">
                {/* Visual bar approximated with a flex layout */}
                <div className="h-2 rounded-full w-full flex overflow-hidden">
                  {invoiceSummaryData.map((item, index) => (
                    <div
                      key={index}
                      style={{ width: `${(item.value / 1245) * 100}%`, backgroundColor: item.color }}
                      className="h-full"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Legend/Details */}
              <div className="divide-y divide-gray-100">
                {invoiceSummaryData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                      {item.label}
                    </span>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------- NEW: Recent Transactions ----------------------- */}
       <div className="bg-white p-6 rounded-lg shadow-lg">

  {/* Header */}
  <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
    <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>

    <div className="flex flex-wrap items-center gap-3">

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          className="border rounded-lg px-3 py-1 pl-8 text-sm w-full shadow-lg"
        />
        <Search size={14} className="absolute left-2 top-2.5 text-gray-500" />
      </div>

      {/* Sort */}
      <button className="flex items-center text-sm px-3 py-1 border rounded-lg hover:bg-gray-100 shadow-lg cursor-pointer">
        <ArrowUpDown size={14} className="mr-1" /> Sort
      </button>

      {/* Filter */}
      <button className="flex items-center text-sm px-3 py-1 border rounded-lg hover:bg-gray-100 shadow-lg cursor-pointer">
        <Filter size={14} className="mr-1" /> Filter
      </button>
    </div>
  </div>

  {/* Responsive Scroll Wrapper */}
  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
    <table className="w-full text-sm min-w-[600px]">
      <thead>
        <tr className="text-black border-b border-gray-900">
          <th className="py-2 text-left">ID</th>
          <th className="py-2 text-left">Client</th>
          <th className="py-2 text-left">Amount</th>
          <th className="py-2 text-left">Status</th>
          <th className="py-2 text-left">Date</th>
        </tr>
      </thead>

      <tbody>
        {recentTransactions.map((t, i) => (
          <tr key={i} className="border-b border-gray-300 last:border-b-0">
            <td className="py-3">{t.id}</td>
            <td>{t.client}</td>
            <td className="font-semibold">{t.amount}</td>
            <td>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  t.status === "Paid"
                    ? "bg-green-100 text-green-700"
                    : t.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {t.status}
              </span>
            </td>
            <td>{t.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

</div>


        {/* ----------------------- NEW: Quick Actions ----------------------- */}
        <div className="bg-white p-6 rounded-lg shadow-lg mt-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex items-center justify-center gap-2 p-4 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500
 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400
           transition-all duration-300 rounded-xl border border-blue-200 text-black font-medium">
              <Plus size={18} /> Create Invoice
            </button>

            <button className="flex items-center justify-center gap-2 p-4 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500
 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400
           transition-all duration-300 rounded-xl border border-purple-200 text-black font-medium">
              <Plus size={18} /> Add Client
            </button>

            <button className="flex items-center justify-center gap-2 p-4 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500
 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400
           transition-all duration-300 rounded-xl border border-green-200 text-black font-medium">
              <Plus size={18} /> Add Bank Account
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;



// import React, { useEffect, useState, useMemo, memo } from "react";
// import Layout from "../components/Layout";
// import {getDashboardStats} from "../api/dashboard.api.js";
// import {
//   CurrencyDollarIcon,
//   DocumentTextIcon,
//   ClockIcon,
//   CheckCircleIcon,
//   ArrowTrendingUpIcon,
//   EllipsisHorizontalIcon,
// } from "@heroicons/react/24/outline";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";

// /* -------------------- UTILS & CONFIG -------------------- */
// const COLORS = ["#10B981", "#F59E0B", "#EF4444"]; // Emerald, Amber, Red

// const formatCurrency = (value) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "USD",
//     maximumSignificantDigits: 3,
//   }).format(value);

// const shortenId = (id) => `#${id.slice(-6).toUpperCase()}`;

// // Dummy aggregation if revenueTrends is empty (UX Fallback)
// const aggregateTransactionsToChart = (transactions = []) => {
//   if (!transactions.length) return [];
//   // Simple grouping by index for demo purposes since dates aren't in the ID
//   // In a real app, you'd group by createdAt date
//   return transactions.map((t, i) => ({
//     name: `Tx ${i + 1}`,
//     amount: t.amount,
//     status: t.status,
//   }));
// };

// /* -------------------- SUB-COMPONENTS -------------------- */

// // 1. Skeleton Loader (Prevents Layout Shift)
// const DashboardSkeleton = () => (
//   <div className="animate-pulse space-y-6">
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//       {[...Array(4)].map((_, i) => (
//         <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
//       ))}
//     </div>
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl"></div>
//       <div className="h-96 bg-gray-200 rounded-2xl"></div>
//     </div>
//   </div>
// );

// // 2. Stat Card (Memoized)
// const StatCard = memo(({ title, value, icon: Icon, trend, color }) => (
//   <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
//     <div className="flex items-start justify-between">
//       <div>
//         <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
//         <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
//           {value}
//         </h3>
//       </div>
//       <div className={`p-3 rounded-xl ${color}`}>
//         <Icon className="w-6 h-6 text-white" />
//       </div>
//     </div>
//     {trend && (
//       <div className="mt-4 flex items-center text-sm">
//         <span className="text-emerald-600 font-medium flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
//           <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
//           {trend}
//         </span>
//         <span className="text-gray-400 ml-2">vs last month</span>
//       </div>
//     )}
//   </div>
// ));

// // 3. Custom Chart Tooltip
// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-slate-800 text-white p-3 rounded-lg shadow-xl text-xs">
//         <p className="font-semibold mb-1">{label}</p>
//         <p className="text-emerald-400">
//           Revenue: {formatCurrency(payload[0].value)}
//         </p>
//       </div>
//     );
//   }
//   return null;
// };

// // 4. Transactions Table (Memoized)
// const RecentTransactions = memo(({ transactions }) => (
//   <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
//     <div className="p-6 border-b border-gray-50 flex justify-between items-center">
//       <h2 className="text-lg font-bold text-gray-800">Recent Transactions</h2>
//       <button className="text-gray-400 hover:text-indigo-600">
//         <EllipsisHorizontalIcon className="w-6 h-6" />
//       </button>
//     </div>
//     <div className="overflow-x-auto flex-1">
//       <table className="w-full text-left border-collapse">
//         <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold tracking-wider">
//           <tr>
//             <th className="px-6 py-4">Client</th>
//             <th className="px-6 py-4">Amount</th>
//             <th className="px-6 py-4">Status</th>
//             <th className="px-6 py-4 text-right">Action</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-50">
//           {transactions?.map((t) => (
//             <tr
//               key={t._id}
//               className="hover:bg-gray-50/50 transition-colors duration-200 group"
//             >
//               <td className="px-6 py-4">
//                 <div className="flex items-center">
//                   <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs mr-3">
//                     TX
//                   </div>
//                   <span className="font-mono text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
//                     {t.clientId?.clientName || "Unknown Client"}
//                   </span>
//                 </div>
//               </td>
//               <td className="px-6 py-4 text-sm font-semibold text-gray-900">
//                 {formatCurrency(t.amount)}
//               </td>
//               <td className="px-6 py-4">
//                 <span
//                   className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
//                     t.status === "paid"
//                       ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
//                       : "bg-amber-100 text-amber-800 border border-amber-200"
//                   }`}
//                 >
//                   <span
//                     className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
//                       t.status === "paid" ? "bg-emerald-500" : "bg-amber-500"
//                     }`}
//                   ></span>
//                   {t.status}
//                 </span>
//               </td>
//               <td className="px-6 py-4 text-right">
//                 <button className="text-gray-400 hover:text-gray-600 text-xs font-medium">
//                   View
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// ));

// /* -------------------- MAIN DASHBOARD -------------------- */
// const Dashboard = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     let mounted = true;
//     const loadDashboard = async () => {
//       try {
//         const res = await getDashboardStats();
//         if (mounted) {
//           setData(res.data);
//           setLoading(false);
          
//         }
//       } catch (err) {
//         console.error("Dashboard API error:", err);
//         if (mounted) {
//           setError(true);
//           setLoading(false);
//         }
//       }
//     };
//     loadDashboard();
//     return () => (mounted = false);
//   }, []);

//   // Memoize Stats to avoid recalculation on unrelated renders
//   const stats = useMemo(() => {
//     if (!data?.KPIs) return [];
//     const { totalRevenue, paid, pending, outstanding } = data.KPIs;
//     return [
//       {
//         title: "Total Revenue",
//         value: formatCurrency(totalRevenue),
//         icon: CurrencyDollarIcon,
//         color: "bg-indigo-500",
//         trend: "12%",
//       },
//       {
//         title: "Invoices Sent",
//         value: (paid || 0) + (pending || 0),
//         icon: DocumentTextIcon,
//         color: "bg-blue-500",
//         trend: null,
//       },
//       {
//         title: "Paid Invoices",
//         value: paid || 0,
//         icon: CheckCircleIcon,
//         color: "bg-emerald-500",
//         trend: "5%",
//       },
//       {
//         title: "Pending Invoices",
//         value: pending || 0,
//         icon: ClockIcon,
//         color: "bg-amber-500",
//         trend: null,
//       },
//     ];
//   }, [data]);

//   // Memoize Chart Data
//   const chartData = useMemo(() => {
//     if (!data) return [];
//     // Fallback: If revenueTrends is empty, generate visual data from transactions
//     if (!data.revenueTrends || data.revenueTrends.length === 0) {
//       return aggregateTransactionsToChart(data.recentTransactions);
//     }
//     return data.revenueTrends;
//   }, [data]);

//   // Memoize Pie Data
//   const pieData = useMemo(() => {
//     if (!data?.KPIs) return [];
//     return [
//       { name: "Paid", value: data.KPIs.paid || 0 },
//       { name: "Pending", value: data.KPIs.pending || 0 },
//     ];
//   }, [data]);

//   if (loading)
//     return (
//       <Layout>
//         <DashboardSkeleton />
//       </Layout>
//     );

//   if (error)
//     return (
//       <Layout>
//         <div className="text-center py-20 text-red-500">
//           Failed to load dashboard data.
//         </div>
//       </Layout>
//     );

//   return (
//     <Layout>
//       <div className="space-y-6 animate-fade-in-up pt-10">
//         {/* Header */}
//         <div className="flex justify-between items-end">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
//             <p className="text-sm text-gray-500 mt-1">
//               Welcome back, here is your financial overview.
//             </p>
//           </div>
//           {/* <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
//             Download Report
//           </button> */}
//         </div>

//         {/* KPI Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {stats.map((stat, i) => (
//             <StatCard key={i} {...stat} />
//           ))}
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
//           {/* Main Trend Chart */}
//           <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-lg font-bold text-gray-800">
//                 Revenue Analytics
//               </h2>
//               <select className="text-sm border-gray-200 rounded-md text-gray-500 focus:ring-indigo-500 focus:border-indigo-500">
//                 <option>This Week</option>
//                 <option>Last Month</option>
//               </select>
//             </div>
            
//             <div className="h-[300px] w-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart
//                   data={chartData}
//                   margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
//                 >
//                   <defs>
//                     <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
//                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid
//                     strokeDasharray="3 3"
//                     vertical={false}
//                     stroke="#F3F4F6"
//                   />
//                   <XAxis
//                     dataKey="name"
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fill: "#9CA3AF", fontSize: 12 }}
//                     dy={10}
//                   />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fill: "#9CA3AF", fontSize: 12 }}
//                     tickFormatter={(value) => `$${value / 1000}k`}
//                   />
//                   <Tooltip content={<CustomTooltip />} cursor={false} />
//                   <Area
//                     type="monotone"
//                     dataKey="amount"
//                     stroke="#6366f1"
//                     strokeWidth={3}
//                     fillOpacity={1}
//                     fill="url(#colorRev)"
//                     activeDot={{ r: 6, strokeWidth: 0 }}
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Donut Chart (Status) */}
//           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
//             <h2 className="text-lg font-bold text-gray-800 mb-2">
//               Payment Status
//             </h2>
//             <div className="flex-1 min-h-[250px] relative">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={pieData}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={60}
//                     outerRadius={80}
//                     paddingAngle={5}
//                     dataKey="value"
//                   >
//                     {pieData.map((entry, index) => (
//                       <Cell
//                         key={`cell-${index}`}
//                         fill={COLORS[index % COLORS.length]}
//                         strokeWidth={0}
//                       />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//               {/* Center Text in Donut */}
//               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
//                 <span className="text-3xl font-bold text-gray-800">
//                   {data?.KPIs?.paid + data?.KPIs?.pending}
//                 </span>
//                 <span className="text-xs text-gray-400 uppercase tracking-wider">
//                   Total
//                 </span>
//               </div>
//             </div>
            
//             {/* Legend */}
//             <div className="flex justify-center space-x-6 mt-4">
//               <div className="flex items-center">
//                 <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
//                 <span className="text-sm text-gray-600">Paid</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
//                 <span className="text-sm text-gray-600">Pending</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Transactions Table */}
//         <div className="min-h-[300px]">
//           <RecentTransactions transactions={data?.recentTransactions} />
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default Dashboard;

