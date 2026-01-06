import React, { useState,  } from 'react';
// CHECK PATH: Ensure Layout is imported correctly based on your folder structure
import Layout from '../components/Layout'; 
import { 
  Mail, 
  Building, 
  Save, 
  Upload, 
  Shield, 
  Send, 
  Eye, 
  EyeOff, 
  FileText,
  Hash,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// --- Helper Components ---

const TabButton = ({ id, label, icon:Icon , activeTab, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 ${
      activeTab === id 
        ? 'border-blue-200 text-black bg-blue-200' 
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const FormGroup = ({ label, children, subLabel }) => (
  <div className="mb-5">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    {children}
    {subLabel && <p className="text-xs text-slate-400 mt-1">{subLabel}</p>}
  </div>
);

// --- Main Component ---

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  
  // Password Visibility State
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  // -- State: Email / SMTP --
  const [smtpConfig, setSmtpConfig] = useState({
    host: 'smtp.office365.com',
    port: '587',
    username: 'notifications@company.com',
    password: 'password123',
    useTls: true,
  });

  // -- State: Company Profile --
  const [companyProfile, setCompanyProfile] = useState({
    logoPreview: null, // URL for preview
    fiscalYear: 'Apr-Mar',
    taxName: 'GST',
    taxNumber: '22AAAAA0000A1Z5',
    invoicePrefix: 'INV-',
    nextInvoiceNumber: '1001',
    defaultTerms: 'Payment due within 15 days. Late fees apply beyond 30 days.',
  });

  // -- Handlers --

  const handleSmtpChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSmtpConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setCompanyProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyProfile(prev => ({ ...prev, logoPreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestEmail = () => {
    setIsTestingEmail(true);
    // Simulate network request
    setTimeout(() => {
      setIsTestingEmail(false);
      alert("Test email sent successfully to admin!");
    }, 2000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate Save
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully.");
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex justify-center items-start pb-12">
        <div className="w-full max-w-5xl">
          
          {/* Header */}
          <div className="mb-8 mt-15">
            <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
            <p className="text-slate-500 text-sm mt-1">Configure system-wide preferences and communication channels.</p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-t-xl border-b border-slate-200 flex overflow-x-auto">
            <TabButton 
              id="email" 
              label="Email & SMTP" 
              icon={Mail} 
              activeTab={activeTab} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="profile" 
              label="Company Profile" 
              icon={Building} 
              activeTab={activeTab} 
              onClick={setActiveTab} 
            />
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-slate-200 p-8 min-h-[500px]">
            <form onSubmit={handleSave}>

              {/* ================= TAB: EMAIL / SMTP ================= */}
              {activeTab === 'email' && (
                <div className="animate-fade-in max-w-3xl">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 flex gap-3 items-start">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-blue-800">Secure Configuration</h4>
                      <p className="text-xs text-blue-600 mt-1">
                        SMTP credentials are encrypted at rest. Use a dedicated app password if you are using Gmail or Outlook.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-8">
                      <FormGroup label="SMTP Host">
                        <input 
                          type="text" 
                          name="host"
                          value={smtpConfig.host}
                          onChange={handleSmtpChange}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                          placeholder="e.g. smtp.gmail.com"
                        />
                      </FormGroup>
                    </div>
                    <div className="md:col-span-4">
                      <FormGroup label="Port">
                        <input 
                          type="number" 
                          name="port"
                          value={smtpConfig.port}
                          onChange={handleSmtpChange}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                          placeholder="587"
                        />
                      </FormGroup>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormGroup label="Username / Email">
                      <input 
                        type="email" 
                        name="username"
                        value={smtpConfig.username}
                        onChange={handleSmtpChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </FormGroup>

                    <FormGroup label="Password">
                      <div className="relative">
                        <input 
                          type={showSmtpPass ? "text" : "password"} 
                          name="password"
                          value={smtpConfig.password}
                          onChange={handleSmtpChange}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSmtpPass(!showSmtpPass)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showSmtpPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        </button>
                      </div>
                    </FormGroup>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative inline-flex items-center">
                        <input 
                          type="checkbox" 
                          name="useTls"
                          checked={smtpConfig.useTls}
                          onChange={handleSmtpChange}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                      <span className="text-sm font-medium text-slate-700">Use TLS / SSL</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleTestEmail}
                      disabled={isTestingEmail}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isTestingEmail ? 'Sending...' : <><Send className="w-4 h-4" /> Test Connection</>}
                    </button>
                  </div>
                </div>
              )}

              {/* ================= TAB: COMPANY PROFILE ================= */}
              {activeTab === 'profile' && (
                <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-10">
                  
                  {/* Left Col: Logo */}
                  <div className="col-span-1">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Company Logo</h3>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors group relative overflow-hidden bg-slate-50">
                      
                      {companyProfile.logoPreview ? (
                        <img 
                          src={companyProfile.logoPreview} 
                          alt="Logo Preview" 
                          className="w-32 h-32 object-contain mb-2" 
                        />
                      ) : (
                        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-3 text-slate-400">
                          <Upload className="w-8 h-8" />
                        </div>
                      )}
                      
                      <div className="z-10">
                        <p className="text-sm font-medium text-slate-700">
                          {companyProfile.logoPreview ? 'Change Logo' : 'Upload Logo'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB</p>
                      </div>
                      
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Right Col: Details */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Fiscal & Tax */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormGroup label="Fiscal Year" subLabel="Determines reporting periods">
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <select 
                            name="fiscalYear"
                            value={companyProfile.fiscalYear}
                            onChange={handleProfileChange}
                            className="w-full pl-10 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white"
                          >
                            <option value="Jan-Dec">January - December</option>
                            <option value="Apr-Mar">April - March</option>
                            <option value="Jul-Jun">July - June</option>
                          </select>
                        </div>
                      </FormGroup>

                      <FormGroup label="Tax ID / GSTIN">
                        <input 
                          type="text"
                          name="taxNumber"
                          value={companyProfile.taxNumber}
                          onChange={handleProfileChange}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none uppercase"
                        />
                      </FormGroup>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Numbering Format */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Hash className="w-4 h-4" /> Numbering Format
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <FormGroup label="Prefix">
                          <input 
                            type="text"
                            name="invoicePrefix"
                            value={companyProfile.invoicePrefix}
                            onChange={handleProfileChange}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                          />
                        </FormGroup>
                        <FormGroup label="Next Number">
                          <input 
                            type="number"
                            name="nextInvoiceNumber"
                            value={companyProfile.nextInvoiceNumber}
                            onChange={handleProfileChange}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                          />
                        </FormGroup>
                      </div>
                      <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600 font-mono">
                        Preview: {companyProfile.invoicePrefix}{companyProfile.nextInvoiceNumber}
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Terms */}
                    <FormGroup label="Default Invoice Terms">
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <textarea 
                          name="defaultTerms"
                          value={companyProfile.defaultTerms}
                          onChange={handleProfileChange}
                          rows="3"
                          className="w-full pl-10 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                        ></textarea>
                      </div>
                    </FormGroup>

                  </div>
                </div>
              )}

              {/* Footer: Save Button */}
              <div className="mt-10 flex justify-end pt-6 border-t border-slate-100">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-600 hover:bg-blue-700 text-black font-medium shadow-lg shadow-blue-600/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving Changes...' : <><Save className="w-4 h-4" /> Save Settings</>}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Animation CSS */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default SettingsPage;