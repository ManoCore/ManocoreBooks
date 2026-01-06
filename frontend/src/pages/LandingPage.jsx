// LandingPage.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/MainNavbar";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Receipt,
  BarChart2,
  Users,
  CheckCircle,
  Clock,
  CloudLightning,
  DollarSign,
  PieChart,
  Zap,
  Menu,
  Star,
  ChevronDown,
  ArrowRight,
  Bell,        // Added
  Briefcase,Check, X, Sparkles,  Shield, HelpCircle , Minus ,ShieldCheck,   // Added
} from "lucide-react";
import booklogo from "../assets/manocore_book_logo.png";
import dashboard from "../assets/Dashboard.png.png";
import invoice from "../assets/Invoice.png.png";
import clients from "../assets/Clients.png.png";
import finance from "../assets/Finance.png.png";
import reports from "../assets/Reports.png.png";

/* ---------------------------
   Small helper components
   ---------------------------*/


/* ---------------------------
   1) Ultra-Premium Hero
   ---------------------------*/
const MiniSparkline = ({ width = 220, height = 60 }) => {
  const points = "0,40 30,20 60,30 90,18 120,30 150,12 180,22 210,8";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" className="rounded">
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <polyline points={points} stroke="url(#g1)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="210" cy="8" r="4" fill="#fff" />
    </svg>
  );
};

/* --- 1. Reusable UI Components --- */
const Pill = ({ children }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.3)]">
    <Sparkles className="w-3 h-3 text-indigo-400" />
    {children}
  </div>
);

const GlassCard = ({ children, className = "" }) => (
  <div className={`relative bg-gray-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden ${className}`}>
    {/* Noise Texture Overlay */}
    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
    {/* Top Highlight Line */}
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    {children}
  </div>
);

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0B0F19]">
      
      {/* --- Background Effects --- */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Perspective Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        {/* Aurora Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 rounded-[100%] blur-[100px] opacity-50 mix-blend-screen animate-pulse" />
        <div className="absolute top-20 left-1/4 w-[600px] h-[400px] bg-purple-600/10 rounded-[100%] blur-[80px] opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* --- Left Column: Content --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex flex-col items-start">
              <Pill>Powered by manocore</Pill>
              
              <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                Master your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300">
                  cashflow logic.
                </span>
              </h1>
              
              <p className="mt-6 text-lg text-gray-400 max-w-xl leading-relaxed">
              Manocore simplifies your financial operations with AI-driven invoicing, automated tracking, and real-time insights-so you can focus on growing your business, not managing paperwork.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button className="group relative px-8 py-4 rounded-full bg-white text-gray-900 font-bold text-sm transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-[1.02]">
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free Trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                
                <button className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors flex items-center gap-2 backdrop-blur-sm">
                  <PieChart className="w-4 h-4 text-gray-400" /> View Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 pt-8 border-t border-white/5 flex gap-8">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">4.9/5</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">G2 Rating</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">10k+</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Businesses</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">$2B+</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">Processed</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* --- Right Column: Visual Dashboard --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }} 
            animate={{ opacity: 1, scale: 1, rotateX: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative perspective-1000"
          >
            {/* Main Dashboard Card */}
            <GlassCard className="p-6 relative z-10 w-full max-w-lg mx-auto aspect-[4/3] flex flex-col">
              {/* Fake UI Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="text-xs font-mono text-gray-500">Invoice & finance</div>
              </div>

              {/* Chart Content */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Balance</p>
                    <h3 className="text-4xl font-mono text-white tracking-tight">₹42,093.00</h3>
                  </div>
                  <div className="flex items-center gap-1 text-green-400 text-sm bg-green-400/10 px-2 py-1 rounded">
                    <TrendingUp className="w-3 h-3" /> +14.2%
                  </div>
                </div>

                {/* Custom SVG Wave Chart */}
                <div className="relative h-32 w-full mt-6">
                  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible preserve-3d">
                    {/* Gradient Definition */}
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Area */}
                    <path 
                      d="M0 35 C 20 35, 30 15, 50 20 C 70 25, 80 5, 100 10 V 40 H 0 Z" 
                      fill="url(#chartGradient)" 
                    />
                    {/* Line */}
                    <path 
                      d="M0 35 C 20 35, 30 15, 50 20 C 70 25, 80 5, 100 10" 
                      fill="none" 
                      stroke="#818cf8" 
                      strokeWidth="0.8" 
                      strokeLinecap="round" 
                    />
                    {/* Glowing Dots */}
                    <circle cx="50" cy="20" r="1.5" className="fill-white animate-pulse" />
                    <circle cx="100" cy="10" r="1.5" className="fill-white" />
                  </svg>
                </div>

                {/* Bottom Row stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Monthly Burn</div>
                    <div className="text-white font-medium">₹12.4k</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Runway</div>
                    <div className="text-white font-medium">18 Months</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Floating Elements (Parallax effect) */}
            
            {/* 1. AI Insight Notification */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 top-10 z-20"
            >
              <GlassCard className="p-4 flex items-center gap-3 bg-gray-800/80 !border-indigo-500/30">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-300">AI Insight</p>
                  <p className="text-xs text-gray-300 w-32">Spending projected to drop by 8%.</p>
                </div>
              </GlassCard>
            </motion.div>

            {/* 2. Security Badge */}
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -left-6 bottom-20 z-20"
            >
              <GlassCard className="px-4 py-2 flex items-center gap-2 bg-gray-800/90">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span className="text-xs font-semibold text-gray-200">GST Compliant</span>
              </GlassCard>
            </motion.div>

            {/* Background Glow behind Dashboard */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/20 blur-[100px] -z-10 pointer-events-none" />
            
          </motion.div>

        </div>
      </div>
    </section>
  );
};

const ThreeDShowcaseSection = () => {
  const images = [dashboard, invoice, clients, finance, reports];

  // Duplicate for seamless continuous loop
  const loopImages = [...images, ...images];

  return (
    <section className="py-32 bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-6 text-center">

        <h2 className="text-5xl font-bold tracking-wide">
          Smart dashboards, invoices, reports & financial insights.
        </h2>

        {/* FIXED RESPONSIVE INFINITE SLIDER */}
        <div className="relative w-full overflow-hidden mt-20">
          <motion.div
            className="flex gap-10 items-center whitespace-nowrap"
            animate={{ x: ["0%", "-200%"] }}   // smoother & correct loop
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {loopImages.map((img, i) => (
              <motion.div
                key={i}
                className="
                  w-[600px] md:w-[580px] sm:w-[460px]  // decreased ~3%
                  h-[300px] md:h-[280px] sm:h-[240px]
                  rounded-xl overflow-hidden 
                  bg-white/10 border border-white/20 
                  shadow-[0_25px_70px_rgba(0,0,0,0.6)]
                  backdrop-blur-2xl flex-shrink-0
                  transform-gpu
                "
                whileHover={{
                  scale: 1.02,
                  rotateY: 0,
                  rotateX: 0,
                  transition: { type: "spring", stiffness: 50, damping: 10 },
                }}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover select-none"
                  draggable="false"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* GRADIENT EDGES */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0f172a] to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0f172a] to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

/* ---------------------------
   2) 3D Feature Cards (tilt)
   ---------------------------*/
const FeatureCard3D = ({ title, description, icon: Icon, gradientFrom = "from-blue-400", gradientTo = "to-purple-500" }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, rotateX: 2 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="relative rounded-3xl p-6 shadow-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/3"
      style={{ perspective: 1200 }}
    >
      <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-indigo-600/10 to-pink-400/6 blur-[40px] opacity-60 pointer-events-none" />
      <div className="relative z-10 flex items-start gap-4">
        <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white drop-shadow-lg`}>
          {Icon ? <Icon className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-100">{title}</h4>
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Features3DSection = () => {
  const list = [
    { title: "Auto Ledger Sync", desc: "Sync bank transactions and ledgers automatically", icon: BarChart2, f: "from-blue-500", t: "to-indigo-500" },
    { title: "Receipt Scanner (AI OCR)", desc: "Scan receipts and auto-categorize expenses", icon: Receipt, f: "from-indigo-500", t: "to-pink-500" },
    { title: "Auto Reconciliation", desc: "Match payments to invoices automatically", icon: CheckCircle, f: "from-purple-500", t: "to-blue-500" },
    { title: "Subscription Billing", desc: "Recurring invoices & automated retries", icon: Clock, f: "from-blue-600", t: "to-teal-500" },
    { title: "Inventory & PO", desc: "Manage stock, POs and supplier bills", icon: TrendingUp, f: "from-green-500", t: "to-emerald-600" },
    { title: "AI Cashflow Predictor", desc: "Forecast runway and suggest actions", icon: PieChart, f: "from-pink-500", t: "to-purple-600" },
  ];

  return (
    <section id="features" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white">Features built for finance teams</h2>
        <p className="mt-2 text-gray-500">Everything you need to run finance operations — faster and smarter.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
          {list.map((f, i) => (
            <FeatureCard3D
              key={i}
              title={f.title}
              description={f.desc}
              icon={f.icon}
              gradientFrom={f.f}
              gradientTo={f.t}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------------------------
/* ---------------------------
   3) KPI Analytics Strip (Upgraded)
   ---------------------------*/

const KPIItem = ({ label, value, change }) => (
  <div
    className="
      p-5 rounded-2xl 
      bg-white/10 backdrop-blur-xl 
      border border-white/10 
      shadow-lg 
      hover:-translate-y-1 hover:shadow-2xl 
      transition-all duration-300
      text-center cursor-pointer
    "
  >
    <p className="text-sm text-gray-300 tracking-wide">{label}</p>

    <p className="text-3xl font-extrabold mt-1 bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
      {value}
    </p>

    <p
      className={`text-sm mt-2 font-semibold ${
        change.startsWith("+")
          ? "text-green-400"
          : "text-red-400"
      }`}
    >
      {change}
    </p>
  </div>
);

const KPIAnalytics = () => {
  return (
    <section className="py-14 bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          Business Performance Overview
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <KPIItem label="Total Revenue" value="₹12.4L" change="+12% MoM" />
          <KPIItem label="Monthly Growth" value="12%" change="+2.4%" />
          <KPIItem label="Expenses" value="₹8.3L" change="-4.2%" />
          <KPIItem label="Clients" value="850+" change="+24" />
        </div>
      </div>
    </section>
  );
};


/* ---------------------------
   4) Advantages Section (Upgraded)
   ---------------------------*/

const advantageFeatures = [
  { icon: CheckCircle, title: 'Eliminate manual bookkeeping', description: 'Automate your accounting tasks with AI.' },
  { icon: BarChart2, title: 'Get instant reports and predictions', description: 'Gain insights with real-time data.' },
  { icon: Bell, title: 'Improve cash flow with reminders', description: 'Stay on top of your finances.' },
  { icon: Briefcase, title: 'Manage all finances in one place', description: 'Consolidate your financial management.' },
];

const AdvantagesSection = () => (
  <section className="py-20 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#2e1065] cursor-pointer">
    <div className="max-w-6xl mx-auto px-6 text-center">

      {/* Title */}
      <h2 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
        Everything You Need, Nothing You Don't
      </h2>
      <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
        Experience powerful automation & smart financial insights.
      </p>

      {/* Feature Cards */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10 text-left">
        {advantageFeatures.map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="
              flex gap-4 p-6 rounded-2xl 
              bg-white/10 backdrop-blur-xl
              border border-white/20 
              shadow-lg hover:shadow-2xl 
              transition-all duration-300
            "
          >
            {/* Icon */}
            <div
              className="
                flex items-center justify-center 
                w-12 h-12 rounded-xl 
                bg-gradient-to-br from-indigo-500 to-purple-600 
                shadow-md
              "
            >
              <feature.icon className="h-6 w-6 text-white" />
            </div>

            {/* Text Content */}
            <div>
              <h3 className="text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-1 text-gray-300">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  </section>
);

/* ---------------------------
   5) Integrations Carousel (Upgraded)
   ---------------------------*/

const IntegrationLogo = ({ name }) => (
  <div
    className="
      flex flex-col items-center gap-2 p-6 
      rounded-2xl 
      bg-white/10 backdrop-blur-xl 
      border border-white/20 
      hover:bg-white/20
      hover:border-white/40
      transition-all duration-300
      shadow-lg hover:shadow-2xl
      cursor-pointer
    "
  >
    <div
      className="
        w-14 h-14 
        rounded-full 
        bg-gradient-to-br from-indigo-500/40 to-purple-500/40 
        flex items-center justify-center 
        text-lg font-semibold text-white 
        ring-1 ring-white/20
      "
    >
      {name[0]}
    </div>

    <div className="text-sm font-medium text-gray-200 tracking-wide">
      {name}
    </div>
  </div>
);

const Integrations = () => {
  const names = [
    "Razorpay",
    "Stripe/PayPal",
    "Paytm",
    "Currency Exchange",
    "Accounting Export",
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#2e1065]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        
        <h3 className="text-4xl font-extrabold text-white tracking-tight">
          Integrations
        </h3>

        <p className="mt-3 text-gray-300 max-w-xl mx-auto">
          Connect your favorite tools and automate your financial workflows.
        </p>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {names.map((n) => (
            <motion.div
              key={n}
              whileHover={{ scale: 1.06, y: -4 }}
              transition={{ type: "spring", stiffness: 250 }}
            >
              <IntegrationLogo name={n} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


/* --- Components --- */

const Pricing = () => {
  const [billing, setBilling] = useState("monthly");

  return (
    <section id="pricing" className="py-24 bg-slate-50 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* 1. Sophisticated Background: Technical Grid + Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Ambient Gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* 2. Header & Toggle Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" /> Flexible Pricing
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Plans that scale with your <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">growth story.</span>
          </h2>
          
          <p className="text-lg text-slate-600 mb-10">
            Simple, transparent pricing. No hidden fees. <br className="hidden md:block" />
            Start for free and upgrade as you grow.
          </p>

          {/* Animated Toggle Switch */}
          <div className="relative inline-flex bg-white p-1.5 rounded-full border border-slate-200 shadow-sm cursor-pointer">
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full bg-slate-900 transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] shadow-md ${
                billing === 'monthly' ? 'translate-x-0' : 'translate-x-[calc(100%+6px)]'
              }`} 
            />
            <button 
              onClick={() => setBilling("monthly")}
              className={`relative z-10 w-32 py-2.5 text-sm font-semibold rounded-full transition-colors duration-300 ${
                billing === "monthly" ? "text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBilling("yearly")}
              className={`relative z-10 w-32 py-2.5 text-sm font-semibold rounded-full transition-colors duration-300 flex items-center justify-center gap-2 ${
                billing === "yearly" ? "text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Yearly
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide transition-colors ${
                billing === "yearly" ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
              }`}>
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* 3. Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24 items-start">
          <PriceCard
            plan="Starter"
            icon={Sparkles}
            description="Essential tools for freelancers."
            price="₹0"
            billing={billing}
            features={["1 User seat", "Basic invoices", "Email support", "1GB Storage"]}
            cta="Start Free"
          />
          
          <PriceCard
            plan="Business"
            icon={Zap}
            description="Perfect for growing teams."
            price={billing === "monthly" ? "₹499" : "₹399"}
            billing={billing}
            features={["Up to 10 users", "GST Automation", "Priority Support", "API Access", "Custom Branding"]}
            featured={true}
            cta="Get Started"
          />
          
          <PriceCard
            plan="Enterprise"
            icon={Shield}
            description="For large scale organizations."
            price="Custom"
            billing={billing}
            features={["Unlimited users", "Dedicated Manager", "Custom SLAs", "SSO & Security", "Audit Logs"]}
            cta="Contact Sales"
          />
        </div>

        {/* 4. Comparison Table (Glassmorphic) */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900">Compare features</h3>
            <p className="text-slate-500 mt-2">A detailed look at what is included.</p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr>
                    <th className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md p-6 text-sm font-bold text-slate-900 w-1/3 border-b border-slate-200">Feature</th>
                    <th className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md p-6 text-sm font-bold text-slate-900 text-center border-b border-slate-200">Starter</th>
                    <th className="sticky top-0 z-10 bg-indigo-50/90 backdrop-blur-md p-6 text-sm font-bold text-indigo-700 text-center border-b border-indigo-100">Business</th>
                    <th className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md p-6 text-sm font-bold text-slate-900 text-center border-b border-slate-200">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <TableRow feature="Invoicing & Estimates" starter={true} business={true} enterprise={true} />
                  <TableRow feature="GST Filing Automation" starter={false} business={true} enterprise={true} />
                  <TableRow feature="Multi-Currency" starter={false} business={true} enterprise={true} />
                  <TableRow feature="API Access" starter={false} business={true} enterprise={true} />
                  <TableRow feature="Bulk Data Export" starter={false} business={true} enterprise={true} />
                  <TableRow feature="Dedicated Account Manager" starter={false} business={false} enterprise={true} />
                  <TableRow feature="Single Sign-On (SSO)" starter={false} business={false} enterprise={true} />
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

/* --- Sub-Components --- */

const PriceCard = ({ plan, price, description, features, featured = false, cta, icon: Icon, billing }) => {
  return (
    <div className={`relative group flex flex-col h-full ${featured ? 'md:-mt-4 md:mb-4' : ''}`}>
      
      {/* Featured Background Glow */}
      {featured && (
        <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] opacity-40 blur-md group-hover:opacity-80 transition-opacity duration-500" />
      )}

      <div className={`relative flex flex-col h-full p-8 bg-white rounded-[1.8rem] transition-all duration-300 ${featured ? 'border border-transparent' : 'border border-slate-200 hover:border-indigo-300 hover:shadow-xl'}`}>
        
        {/* Most Popular Badge */}
        {featured && (
          <div className="absolute top-0 right-0 bg-gradient-to-bl from-indigo-600 to-purple-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-[1.5rem] uppercase tracking-wider shadow-sm">
            Most Popular
          </div>
        )}

        {/* Card Header */}
        <div className="mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${featured ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
            <Icon className="w-6 h-6" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">{plan}</h4>
          <p className="text-sm text-slate-500 mt-2">{description}</p>
        </div>

        {/* Pricing */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{price}</span>
            {price !== "Custom" && <span className="text-slate-500 font-medium">/mo</span>}
          </div>
          {/* Savings Tooltip */}
          {billing === "yearly" && price !== "Custom" && price !== "₹0" && (
             <p className="text-xs font-semibold text-green-600 mt-2 flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               Save ₹1,200/year
             </p>
          )}
        </div>

        {/* Features List */}
        <div className="flex-1">
          <div className="h-px bg-slate-100 mb-6" />
          <ul className="space-y-4 mb-8">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                <Check className={`w-5 h-5 shrink-0 ${featured ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="leading-tight">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <button className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group-hover:gap-3 ${
          featured 
            ? "bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-indigo-200/50" 
            : "bg-white text-slate-900 border border-slate-200 hover:border-slate-900 hover:bg-slate-50"
        }`}>
          {cta} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* Table Helper Components */
const TableRow = ({ feature, starter, business, enterprise }) => (
  <tr className="hover:bg-slate-50 transition-colors group">
    <td className="p-6 text-sm font-medium text-slate-700">{feature}</td>
    <td className="p-6 text-center">
      {starter ? <CheckIcon /> : <DashIcon />}
    </td>
    <td className="p-6 text-center bg-indigo-50/30 group-hover:bg-indigo-50/60 transition-colors">
      {business ? <CheckIcon active /> : <DashIcon />}
    </td>
    <td className="p-6 text-center">
      {enterprise ? <CheckIcon /> : <DashIcon />}
    </td>
  </tr>
);

const CheckIcon = ({ active }) => (
  <div className={`mx-auto w-6 h-6 rounded-full flex items-center justify-center transition-all ${active ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-110" : "bg-slate-200 text-slate-600"}`}>
    <Check className="w-3.5 h-3.5" strokeWidth={3} />
  </div>
);

const DashIcon = () => (
  <div className="flex justify-center opacity-50">
    <Minus className="w-4 h-4 text-slate-300" />
  </div>
);

/* ---------------------------
   7) Testimonials
   ---------------------------*/
const TestimonialCard = ({ name, role, quote, rating = 5 }) => (
  <div className="p-6 bg-gray-100 rounded-2xl shadow-xl cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-700">{name[0]}</div>
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
    <p className="mt-4 text-gray-700">"{quote}"</p>
    <div className="mt-4 flex items-center gap-1 text-yellow-400">
      {Array.from({ length: rating }).map((_, i) => <Star key={i} className="w-4 h-4" />)}
    </div>
  </div>
);

const Testimonials = () => {
  const data = [
    { name: "Aditi Sharma", role: "Owner - Cafe Byte", quote: "ManoCore simplified our invoices and cut reconciliation time in half." },
    { name: "Rohit Verma", role: "CFO - ScaleUp", quote: "The AI predictor gave us critical runway insights — saved a hiring round." },
    { name: "Nisha Rao", role: "Accounts Lead - ShopZ", quote: "GST automation reduced our monthly errors dramatically." },
  ];
  return (
    <section className="py-20 bg-gray-200">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h3 className="text-3xl font-bold">What customers say</h3>
        <p className="mt-2 text-gray-600">Real companies, real growth.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map((d, i) => <TestimonialCard key={i} {...d} />)}
        </div>
      </div>
    </section>
  );
};

/* ---------------------------
   8) FAQ Accordion
   ---------------------------*/
const FAQItem = ({ q, a, openByDefault = false }) => {
  const [open, setOpen] = useState(openByDefault);
  return (
    <div className="border-b py-4 cursor-pointer">
      <button className="w-full flex items-center justify-between text-left" onClick={() => setOpen((s) => !s)}>
        <div>
          <p className="font-semibold text-gray-800">{q}</p>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${open ? "rotate-180" : "rotate-0"}`} />
      </button>
      {open && <div className="mt-3 text-gray-600">{a}</div>}
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    { q: "Does it support GST invoicing?", a: "Yes — built-in GST fields, HSN/SAC codes, and e-invoice support for eligible taxpayers." },
    { q: "Can I import past invoices?", a: "Yes — import via CSV or connect bank feeds for reconciliation." },
    { q: "Do you offer enterprise SLAs?", a: "Yes — contact sales for custom SLAs and dedicated support." },
  ];
  return (
    <section className="py-16 bg-white ">
      <div className="max-w-4xl mx-auto px-6 ">
        <h3 className="text-2xl font-bold text-center">Frequently asked questions</h3>
        <div className="mt-6 rounded-xl border overflow-hidden ">
          {faqs.map((f, i) => <FAQItem key={i} {...f} />)}
        </div>
      </div>
    </section>
  );
};

/* ---------------------------
   9) CTA Banner
   ---------------------------*/
const CTA = () => {
  return (
    <section className="py-12 bg-gradient-to-br from-indigo-600 to-pink-600 text-white">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold">Start free. Upgrade anytime.</h3>
          <p className="mt-1 text-white/90">No credit card required — onboard in minutes.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-full bg-white text-indigo-600 font-semibold shadow cursor-pointer">Start Free</button>
          <button className="px-6 py-3 cursor-pointer rounded-full border border-white/30 text-white">Book demo</button>
        </div>
      </div>
    </section>
  );
};

/* ---------------------------
   10) Footer
   ---------------------------*/
const Footer = () => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
    <div className="flex items-center gap-3">
  {/* Logo */}
  <img 
    src={booklogo} 
    alt="Manocore Books Logo" 
    className="h-10 w-auto" 
  />

  {/* Text Content */}
  <div>
    <h4 className="font-bold text-lg">ManoCore Books</h4>
    <p className="text-sm text-gray-400">AI-first finance book for modern businesses.</p>

    <div className="mt-2 flex gap-3 text-sm text-gray-400">
      <span>© {new Date().getFullYear()}</span>
      <span>•</span>
      <span>Privacy</span>
    </div>
  </div>
</div>


      <div>
        <h5 className="font-semibold">Product</h5>
        <ul className="mt-3 text-sm text-gray-400 space-y-2">
          <li>Features</li>
          <li>Pricing</li>
          <li>Integrations</li>
        </ul>
      </div>

      <div>
        <h5 className="font-semibold">Resources</h5>
        <ul className="mt-3 text-sm text-gray-400 space-y-2">
          <li>Docs</li>
          <li>Blog</li>
          <li>Support</li>
        </ul>
      </div>

      <div>
        <h5 className="font-semibold">Company</h5>
        <ul className="mt-3 text-sm text-gray-400 space-y-2">
          <li>About</li>
          <li>Careers</li>
          <li>Contact</li>
        </ul>
      </div>
    </div>
  </footer>
);

/* ---------------------------
   MAIN PAGE EXPORT
   ---------------------------*/
export default function LandingPage() {
  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <div className="font-sans antialiased bg-white">
      <Navbar />

      <main className="mt-2">
        <Hero />
        <ThreeDShowcaseSection />
        <Features3DSection />
        <KPIAnalytics />
        <AdvantagesSection /> {/* Inserted the new section here */}
        <Integrations />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}