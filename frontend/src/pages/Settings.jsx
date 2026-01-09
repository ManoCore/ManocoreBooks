import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  Mail,
  Building2,
  Save,
  UploadCloud,
  ShieldCheck,
  Eye,
  EyeOff,
  Pencil, // Import Pencil icon
  X,      // Import X icon for cancel
} from "lucide-react";
import {
  getCompanyDetails,
  updateCompanyDetails,
  updateCompanyLogo,
} from "../api/settings.api";
import { useSelector } from "react-redux";
import {toast } from 'react-hot-toast';


/* -------------------- UI Helpers -------------------- */

// Updated Input component to handle "View" vs "Edit" styles
const Input = ({ disabled, ...props }) => (
  <input
    {...props}
    disabled={disabled}
    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all
      ${
        disabled
          ? "bg-transparent border border-transparent text-slate-600 cursor-default"
          : "bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
      }
    `}
  />
);

const Section = ({ title, subtitle, children }) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);

/* -------------------- Main Page -------------------- */

const SettingsPage = () => {
  const user = useSelector((state) => state.auth.user);
  const orgId = user?.organizationId;

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 1. New State for Editing Mode
  const [isEditing, setIsEditing] = useState(false); 
  const [showPass, setShowPass] = useState(false);

  /* ---------- Company State ---------- */
  const [company, setCompany] = useState({
    name: "",
    country: "",
    state: "",
    currency: "",
    timezone: "",
    taxId: "",
    businessType: "",
    invoicePrefix: "",
    logo: null,
  });

  // 2. Backup State (for Cancel functionality)
  const [backupCompany, setBackupCompany] = useState({});

  /* ---------- SMTP State ---------- */
  const [smtp, setSmtp] = useState({
    host: "",
    username: "",
    password: "",
  });
  const [backupSmtp, setBackupSmtp] = useState({});

  /* ---------- Load Company ---------- */
  useEffect(() => {
    if (!orgId) return;

    const load = async () => {
      try {
        const res = await getCompanyDetails(orgId);
        const org = res.data.organization;

        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        const logoUrl = org.logo ? `${baseUrl}${org.logo}` : null;

        const loadedData = {
          name: org.name || "",
          country: org.country || "",
          state: org.state || "",
          currency: org.currency || "",
          timezone: org.timezone || "",
          taxId: org.taxId || "",
          businessType: org.businessType || "",
          invoicePrefix: org.invoicePrefix || "",
          logo: logoUrl,
        };

        setCompany(loadedData);
        setBackupCompany(loadedData); // Save initial state
        
        // Mock loading SMTP or fetch if available
        const loadedSmtp = { host: "", username: "", password: "" }; // Replace with API data
        setSmtp(loadedSmtp);
        setBackupSmtp(loadedSmtp);

      } catch (e) {
        console.error("Failed to load company", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orgId]);

  /* ---------- Handlers ---------- */

  // Enable Edit Mode
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Cancel Edit - Revert data
  const handleCancel = () => {
    setCompany(backupCompany);
    setSmtp(backupSmtp);
    setIsEditing(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setCompany((p) => ({ ...p, logo: reader.result }));
    reader.readAsDataURL(file);

    try {
      await updateCompanyLogo(orgId, file);
    } catch {
      toast.error("Logo upload failed");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCompanyDetails(orgId, {
        name: company.name,
        country: company.country,
        state: company.state,
        currency: company.currency,
        timezone: company.timezone,
        taxId: company.taxId,
        businessType: company.businessType,
        invoicePrefix: company.invoicePrefix,
        // Add SMTP save logic here if needed
      });
      
      // Update the backup to the new saved state
      setBackupCompany(company);
      setBackupSmtp(smtp);
      setIsEditing(false); // Exit edit mode
      
      toast.success("Company settings updated");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto mt-20 text-center text-slate-500">
          Loading settings…
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-12">
        
        {/* Header & Main Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-500 mt-1">
              Manage company preferences & communication.
            </p>
          </div>

          {/* Action Buttons (Edit vs Save/Cancel) */}
          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-all shadow-sm"
              >
                <Pencil className="w-4 h-4" />
                Edit Settings
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-medium shadow-lg hover:opacity-90 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: "profile", label: "Company Profile", icon: Building2 },
            { id: "email", label: "Email & SMTP", icon: Mail },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                ${
                  activeTab === t.id
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white border text-slate-600 hover:bg-slate-50"
                }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ---------------- PROFILE ---------------- */}
        {activeTab === "profile" && (
          <>
            {/* Logo */}
            <Section
              title="Brand Identity"
              subtitle="Your logo appears on invoices & emails"
            >
              <div className="flex items-center gap-6">
                <div className={`w-28 h-28 rounded-2xl flex items-center justify-center overflow-hidden transition-all
                  ${isEditing ? "bg-slate-50 border border-slate-200" : "bg-transparent border-0"}`}>
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt="Logo"
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <UploadCloud className="text-slate-400 w-10 h-10" />
                  )}
                </div>

                {/* Only show upload button in Edit Mode */}
                {isEditing && (
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm hover:bg-slate-50 shadow-sm bg-white">
                    <UploadCloud className="w-4 h-4" />
                    Change Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </Section>

            {/* Company Info */}
            <Section title="Company Information">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Company Name</label>
                  <Input
                    value={company.name}
                    disabled={!isEditing}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Business Type</label>
                  <Input
                    value={company.businessType}
                    disabled={!isEditing}
                    onChange={(e) => setCompany({ ...company, businessType: e.target.value })}
                  />
                </div>
              </div>
            </Section>

            {/* Location */}
            <Section title="Location & Region">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Country</label>
                  <Input
                    value={company.country}
                    disabled={!isEditing}
                    onChange={(e) => setCompany({ ...company, country: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">State</label>
                  <Input
                    value={company.state}
                    disabled={!isEditing}
                    onChange={(e) => setCompany({ ...company, state: e.target.value })}
                  />
                </div>
              </div>
            </Section>

            {/* Finance */}
            <Section title="Financial Settings">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Currency</label>
                  <Input
                    value={company.currency}
                    disabled={!isEditing}
                    onChange={(e) => setCompany({ ...company, currency: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Timezone</label>
                  <Input
                    value={company.timezone}
                    disabled={!isEditing}
                    onChange={(e) => setCompany({ ...company, timezone: e.target.value })}
                  />
                </div>
              </div>
            </Section>

            {/* Tax & Invoice */}
            <Section title="Tax & Invoice">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Tax ID</label>
                  <Input
                    value={company.taxId}
                    disabled={!isEditing}
                    onChange={(e) => setCompany({ ...company, taxId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Invoice Prefix</label>
                  <Input
                    value={company.invoicePrefix}
                    disabled={!isEditing}
                    onChange={(e) => setCompany({ ...company, invoicePrefix: e.target.value })}
                  />
                </div>
              </div>
            </Section>
          </>
        )}

        {/* ---------------- EMAIL ---------------- */}
        {activeTab === "email" && (
          <Section
            title="Email & SMTP"
            subtitle="Used for invoices & notifications"
          >
            <div className="flex gap-3 items-start bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <ShieldCheck className="text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-700">
                SMTP credentials are encrypted at rest.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">SMTP Host</label>
                <Input
                  value={smtp.host}
                  disabled={!isEditing}
                  onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Username</label>
                <Input
                  value={smtp.username}
                  disabled={!isEditing}
                  onChange={(e) => setSmtp({ ...smtp, username: e.target.value })}
                />
              </div>
              <div className="relative md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Password</label>
                <Input
                  type={showPass ? "text" : "password"}
                  value={smtp.password}
                  disabled={!isEditing}
                  onChange={(e) => setSmtp({ ...smtp, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  disabled={!isEditing}
                  className={`absolute right-3 top-8 ${!isEditing ? 'text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </Section>
        )}
      </div>
    </Layout>
  );
};

export default SettingsPage;




// import React, { useState,  } from 'react';
// // CHECK PATH: Ensure Layout is imported correctly based on your folder structure
// import Layout from '../components/Layout'; 
// import { 
//   Mail, 
//   Building, 
//   Save, 
//   Upload, 
//   Shield, 
//   Send, 
//   Eye, 
//   EyeOff, 
//   FileText,
//   Hash,
//   Calendar,
//   CheckCircle,
//   AlertCircle
// } from 'lucide-react';

// // --- Helper Components ---

// const TabButton = ({ id, label, icon:Icon , activeTab, onClick }) => (
//   <button
//     type="button"
//     onClick={() => onClick(id)}
//     className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 ${
//       activeTab === id 
//         ? 'border-blue-200 text-black bg-blue-200' 
//         : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
//     }`}
//   >
//     <Icon className="w-4 h-4" />
//     {label}
//   </button>
// );

// const FormGroup = ({ label, children, subLabel }) => (
//   <div className="mb-5">
//     <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
//     {children}
//     {subLabel && <p className="text-xs text-slate-400 mt-1">{subLabel}</p>}
//   </div>
// );

// // --- Main Component ---

// const SettingsPage = () => {
//   const [activeTab, setActiveTab] = useState('email');
//   const [isSaving, setIsSaving] = useState(false);
//   const [isTestingEmail, setIsTestingEmail] = useState(false);
  
//   // Password Visibility State
//   const [showSmtpPass, setShowSmtpPass] = useState(false);

//   // -- State: Email / SMTP --
//   const [smtpConfig, setSmtpConfig] = useState({
//     host: 'smtp.office365.com',
//     port: '587',
//     username: 'notifications@company.com',
//     password: 'password123',
//     useTls: true,
//   });

//   // -- State: Company Profile --
//   const [companyProfile, setCompanyProfile] = useState({
//     logoPreview: null, // URL for preview
//     fiscalYear: 'Apr-Mar',
//     taxName: 'GST',
//     taxNumber: '22AAAAA0000A1Z5',
//     invoicePrefix: 'INV-',
//     nextInvoiceNumber: '1001',
//     defaultTerms: 'Payment due within 15 days. Late fees apply beyond 30 days.',
//   });

//   // -- Handlers --

//   const handleSmtpChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setSmtpConfig(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleProfileChange = (e) => {
//     const { name, value } = e.target;
//     setCompanyProfile(prev => ({ ...prev, [name]: value }));
//   };

//   const handleLogoUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setCompanyProfile(prev => ({ ...prev, logoPreview: reader.result }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleTestEmail = () => {
//     setIsTestingEmail(true);
//     // Simulate network request
//     setTimeout(() => {
//       setIsTestingEmail(false);
//       alert("Test email sent successfully to admin!");
//     }, 2000);
//   };

//   const handleSave = (e) => {
//     e.preventDefault();
//     setIsSaving(true);
//     // Simulate Save
//     setTimeout(() => {
//       setIsSaving(false);
//       alert("Settings saved successfully.");
//     }, 1500);
//   };

//   return (
//     <Layout>
//       <div className="flex justify-center items-start pb-12">
//         <div className="w-full max-w-5xl">
          
//           {/* Header */}
//           <div className="mb-8 mt-15">
//             <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
//             <p className="text-slate-500 text-sm mt-1">Configure system-wide preferences and communication channels.</p>
//           </div>

//           {/* Tab Navigation */}
//           <div className="bg-white rounded-t-xl border-b border-slate-200 flex overflow-x-auto">
//             <TabButton 
//               id="email" 
//               label="Email & SMTP" 
//               icon={Mail} 
//               activeTab={activeTab} 
//               onClick={setActiveTab} 
//             />
//             <TabButton 
//               id="profile" 
//               label="Company Profile" 
//               icon={Building} 
//               activeTab={activeTab} 
//               onClick={setActiveTab} 
//             />
//           </div>

//           {/* Main Content Area */}
//           <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-slate-200 p-8 min-h-[500px]">
//             <form onSubmit={handleSave}>

//               {/* ================= TAB: EMAIL / SMTP ================= */}
//               {activeTab === 'email' && (
//                 <div className="animate-fade-in max-w-3xl">
//                   <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 flex gap-3 items-start">
//                     <Shield className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
//                     <div>
//                       <h4 className="text-sm font-bold text-blue-800">Secure Configuration</h4>
//                       <p className="text-xs text-blue-600 mt-1">
//                         SMTP credentials are encrypted at rest. Use a dedicated app password if you are using Gmail or Outlook.
//                       </p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
//                     <div className="md:col-span-8">
//                       <FormGroup label="SMTP Host">
//                         <input 
//                           type="text" 
//                           name="host"
//                           value={smtpConfig.host}
//                           onChange={handleSmtpChange}
//                           className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
//                           placeholder="e.g. smtp.gmail.com"
//                         />
//                       </FormGroup>
//                     </div>
//                     <div className="md:col-span-4">
//                       <FormGroup label="Port">
//                         <input 
//                           type="number" 
//                           name="port"
//                           value={smtpConfig.port}
//                           onChange={handleSmtpChange}
//                           className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
//                           placeholder="587"
//                         />
//                       </FormGroup>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <FormGroup label="Username / Email">
//                       <input 
//                         type="email" 
//                         name="username"
//                         value={smtpConfig.username}
//                         onChange={handleSmtpChange}
//                         className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
//                       />
//                     </FormGroup>

//                     <FormGroup label="Password">
//                       <div className="relative">
//                         <input 
//                           type={showSmtpPass ? "text" : "password"} 
//                           name="password"
//                           value={smtpConfig.password}
//                           onChange={handleSmtpChange}
//                           className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none pr-10"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowSmtpPass(!showSmtpPass)}
//                           className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
//                         >
//                           {showSmtpPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
//                         </button>
//                       </div>
//                     </FormGroup>
//                   </div>

//                   <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
//                     <label className="flex items-center gap-3 cursor-pointer">
//                       <div className="relative inline-flex items-center">
//                         <input 
//                           type="checkbox" 
//                           name="useTls"
//                           checked={smtpConfig.useTls}
//                           onChange={handleSmtpChange}
//                           className="sr-only peer" 
//                         />
//                         <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                       </div>
//                       <span className="text-sm font-medium text-slate-700">Use TLS / SSL</span>
//                     </label>

//                     <button
//                       type="button"
//                       onClick={handleTestEmail}
//                       disabled={isTestingEmail}
//                       className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors disabled:opacity-50"
//                     >
//                       {isTestingEmail ? 'Sending...' : <><Send className="w-4 h-4" /> Test Connection</>}
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* ================= TAB: COMPANY PROFILE ================= */}
//               {activeTab === 'profile' && (
//                 <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-10">
                  
//                   {/* Left Col: Logo */}
//                   <div className="col-span-1">
//                     <h3 className="text-sm font-bold text-slate-800 mb-4">Company Logo</h3>
//                     <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors group relative overflow-hidden bg-slate-50">
                      
//                       {companyProfile.logoPreview ? (
//                         <img 
//                           src={companyProfile.logoPreview} 
//                           alt="Logo Preview" 
//                           className="w-32 h-32 object-contain mb-2" 
//                         />
//                       ) : (
//                         <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-3 text-slate-400">
//                           <Upload className="w-8 h-8" />
//                         </div>
//                       )}
                      
//                       <div className="z-10">
//                         <p className="text-sm font-medium text-slate-700">
//                           {companyProfile.logoPreview ? 'Change Logo' : 'Upload Logo'}
//                         </p>
//                         <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB</p>
//                       </div>
                      
//                       <input 
//                         type="file" 
//                         accept="image/*"
//                         onChange={handleLogoUpload}
//                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                       />
//                     </div>
//                   </div>

//                   {/* Right Col: Details */}
//                   <div className="lg:col-span-2 space-y-6">
                    
//                     {/* Fiscal & Tax */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <FormGroup label="Fiscal Year" subLabel="Determines reporting periods">
//                         <div className="relative">
//                           <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
//                           <select 
//                             name="fiscalYear"
//                             value={companyProfile.fiscalYear}
//                             onChange={handleProfileChange}
//                             className="w-full pl-10 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white"
//                           >
//                             <option value="Jan-Dec">January - December</option>
//                             <option value="Apr-Mar">April - March</option>
//                             <option value="Jul-Jun">July - June</option>
//                           </select>
//                         </div>
//                       </FormGroup>

//                       <FormGroup label="Tax ID / GSTIN">
//                         <input 
//                           type="text"
//                           name="taxNumber"
//                           value={companyProfile.taxNumber}
//                           onChange={handleProfileChange}
//                           className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none uppercase"
//                         />
//                       </FormGroup>
//                     </div>

//                     <hr className="border-slate-100" />

//                     {/* Numbering Format */}
//                     <div>
//                       <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
//                         <Hash className="w-4 h-4" /> Numbering Format
//                       </h3>
//                       <div className="grid grid-cols-2 gap-6">
//                         <FormGroup label="Prefix">
//                           <input 
//                             type="text"
//                             name="invoicePrefix"
//                             value={companyProfile.invoicePrefix}
//                             onChange={handleProfileChange}
//                             className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none font-mono"
//                           />
//                         </FormGroup>
//                         <FormGroup label="Next Number">
//                           <input 
//                             type="number"
//                             name="nextInvoiceNumber"
//                             value={companyProfile.nextInvoiceNumber}
//                             onChange={handleProfileChange}
//                             className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none font-mono"
//                           />
//                         </FormGroup>
//                       </div>
//                       <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600 font-mono">
//                         Preview: {companyProfile.invoicePrefix}{companyProfile.nextInvoiceNumber}
//                       </div>
//                     </div>

//                     <hr className="border-slate-100" />

//                     {/* Terms */}
//                     <FormGroup label="Default Invoice Terms">
//                       <div className="relative">
//                         <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
//                         <textarea 
//                           name="defaultTerms"
//                           value={companyProfile.defaultTerms}
//                           onChange={handleProfileChange}
//                           rows="3"
//                           className="w-full pl-10 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none resize-none"
//                         ></textarea>
//                       </div>
//                     </FormGroup>

//                   </div>
//                 </div>
//               )}

//               {/* Footer: Save Button */}
//               <div className="mt-10 flex justify-end pt-6 border-t border-slate-100">
//                 <button 
//                   type="submit" 
//                   disabled={isSaving}
//                   className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 hover:bg-blue-700 text-black font-medium shadow-lg shadow-blue-600/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
//                 >
//                   {isSaving ? 'Saving Changes...' : <><Save className="w-4 h-4" /> Save Settings</>}
//                 </button>
//               </div>

//             </form>
//           </div>
//         </div>

//         {/* Animation CSS */}
//         <style>{`
//           @keyframes fadeIn {
//             from { opacity: 0; transform: translateY(5px); }
//             to { opacity: 1; transform: translateY(0); }
//           }
//           .animate-fade-in {
//             animation: fadeIn 0.3s ease-out forwards;
//           }
//         `}</style>
//       </div>
//     </Layout>
//   );
// };

// export default SettingsPage;