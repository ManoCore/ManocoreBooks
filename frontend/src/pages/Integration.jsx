import React, { useState } from 'react';
import Layout from '../components/Layout';
import { 
  CreditCard, 
  Globe, 
  FileSpreadsheet, 
  ShieldAlert, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Lock,
  Server,
  FileText // Icon for notes/text area
} from 'lucide-react';

// --- Reusable Components (Moved OUTSIDE to fix focus bug) ---

const SectionHeader = ({ icon: Icon, title, description, badge }) => (
  <div className="flex items-start justify-between mb-6">
    <div className="flex gap-3">
      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          {title}
          {badge && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-slate-100 text-slate-500 border border-slate-200">{badge}</span>}
        </h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  </div>
);

const ToggleSwitch = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  </div>
);

const SecretInput = ({ label, value, onChange, isVisible, onToggle }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-sm font-mono"
          placeholder="sk_live_..."
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

// Added a generic TextArea component just in case you need multi-line input
const TextArea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-sm"
    />
  </div>
);

// --- Main Page Component ---

const IntegrationsPage = () => {
  // --- State Management ---
  
  // State for visibility of sensitive fields (fieldId -> boolean)
  const [visibleFields, setVisibleFields] = useState({});
  
  // Loading state for saving
  const [isSaving, setIsSaving] = useState(false);

  // Main Form Data
  const [config, setConfig] = useState({
    razorpay: {
      enabled: true,
      mode: 'test', // 'test' or 'live'
      keyId: 'rzp_test_1DP5mmOlF5G5ag',
      keySecret: '****************',
    },
    stripe: {
      enabled: false,
      publishableKey: '',
      secretKey: '',
    },
    currency: {
      enabled: true,
      provider: 'OpenExchangeRates',
      apiKey: 'oe_123456789abc',
      baseCurrency: 'USD'
    },
    accounting: {
      exportFormat: 'CSV', // CSV or Excel
      autoSchedule: true,
      emailRecipient: 'finance@company.com',
      notes: '' // Added notes field
    }
  });

  // --- Handlers ---

  // Generic handler to update nested state
  const handleConfigChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Toggle visibility of a specific password field
  const toggleVisibility = (fieldId) => {
    setVisibleFields(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate Secure API Call
    setTimeout(() => {
      setIsSaving(false);
      alert("Integration settings encrypted and saved successfully.");
    }, 1500);
  };

  return (
    <Layout>
      <div className="flex justify-center items-start pb-12 mt-19">
        <div className="w-full max-w-5xl space-y-6">
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 ">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Integrations</h1>
              <p className="text-slate-500 text-sm mt-1">Manage payment gateways, exchange rates, and data export configurations.</p>
            </div>
            
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 text-sm font-medium">
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Access Only: Sensitive keys are masked.</span>
            </div>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* --- RAZORPAY SECTION (India) --- */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <SectionHeader 
                  icon={CreditCard} 
                  title="Razorpay" 
                  description="Indian Payment Gateway Integration"
                  badge="Primary"
                />
                <ToggleSwitch 
                  checked={config.razorpay.enabled} 
                  onChange={(val) => handleConfigChange('razorpay', 'enabled', val)}
                  label=""
                />
              </div>

              {config.razorpay.enabled && (
                <div className="animate-fade-in-up space-y-4">
                  {/* Test/Live Mode Toggle */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Server className="w-4 h-4 text-slate-400" /> Environment
                    </span>
                    <div className="flex bg-white rounded-md p-1 border border-slate-200 shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleConfigChange('razorpay', 'mode', 'test')}
                        className={`px-3 py-1 text-xs font-bold rounded ${config.razorpay.mode === 'test' ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        TEST
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfigChange('razorpay', 'mode', 'live')}
                        className={`px-3 py-1 text-xs font-bold rounded ${config.razorpay.mode === 'live' ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:bg-slate-50'}`}
                      >
                        LIVE
                      </button>
                    </div>
                  </div>

                  <SecretInput 
                    label="Key ID" 
                    value={config.razorpay.keyId} 
                    onChange={(v) => handleConfigChange('razorpay', 'keyId', v)}
                    isVisible={visibleFields['rzp_key']}
                    onToggle={() => toggleVisibility('rzp_key')}
                  />
                  <SecretInput 
                    label="Key Secret" 
                    value={config.razorpay.keySecret} 
                    onChange={(v) => handleConfigChange('razorpay', 'keySecret', v)} 
                    isVisible={visibleFields['rzp_secret']}
                    onToggle={() => toggleVisibility('rzp_secret')}
                  />
                </div>
              )}
            </div>

            {/* --- STRIPE / PAYPAL SECTION (Global) --- */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <div className="flex justify-between items-start mb-4">
                <SectionHeader 
                  icon={Globe} 
                  title="Stripe / PayPal" 
                  description="Global Payment Processing"
                  badge="Optional"
                />
                 <ToggleSwitch 
                  checked={config.stripe.enabled} 
                  onChange={(val) => handleConfigChange('stripe', 'enabled', val)}
                  label=""
                />
              </div>

              {config.stripe.enabled ? (
                <div className="animate-fade-in-up space-y-4">
                  <SecretInput 
                    label="Publishable Key" 
                    value={config.stripe.publishableKey} 
                    onChange={(v) => handleConfigChange('stripe', 'publishableKey', v)} 
                    isVisible={visibleFields['stripe_pub']}
                    onToggle={() => toggleVisibility('stripe_pub')}
                  />
                  <SecretInput 
                    label="Secret Key" 
                    value={config.stripe.secretKey} 
                    onChange={(v) => handleConfigChange('stripe', 'secretKey', v)} 
                    isVisible={visibleFields['stripe_secret']}
                    onToggle={() => toggleVisibility('stripe_secret')}
                  />
                  <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Webhooks will be automatically configured when you save these credentials.</p>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                  <Globe className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Global payments are currently disabled.</p>
                </div>
              )}
            </div>

            {/* --- CURRENCY EXCHANGE API --- */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionHeader 
                icon={RefreshCw} 
                title="Currency Exchange" 
                description="Real-time multi-currency reporting"
              />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
                  <select 
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                    value={config.currency.provider}
                    onChange={(e) => handleConfigChange('currency', 'provider', e.target.value)}
                  >
                    <option value="OpenExchangeRates">Open Exchange Rates</option>
                    <option value="FixerIO">Fixer.io</option>
                    <option value="Currencylayer">Currencylayer</option>
                  </select>
                </div>
                <SecretInput 
                  label="API Key" 
                  value={config.currency.apiKey} 
                  onChange={(v) => handleConfigChange('currency', 'apiKey', v)} 
                  isVisible={visibleFields['currency_api']}
                  onToggle={() => toggleVisibility('currency_api')}
                />
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Rates update daily at 00:00 UTC
                </div>
              </div>
            </div>

            {/* --- ACCOUNTING EXPORT --- */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <SectionHeader 
                icon={FileSpreadsheet} 
                title="Accounting Export" 
                description="Automated report generation"
              />
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Export Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['CSV', 'Excel'].map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => handleConfigChange('accounting', 'exportFormat', fmt)}
                        className={`py-2 text-sm font-medium rounded-lg border ${config.accounting.exportFormat === fmt ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <ToggleSwitch 
                    label="Auto-schedule Daily Report" 
                    checked={config.accounting.autoSchedule}
                    onChange={(v) => handleConfigChange('accounting', 'autoSchedule', v)}
                  />
                  {config.accounting.autoSchedule && (
                    <div className="mt-3 animate-fade-in-up space-y-4">
                       <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Recipient Email</label>
                          <input 
                            type="email" 
                            value={config.accounting.emailRecipient}
                            onChange={(e) => handleConfigChange('accounting', 'emailRecipient', e.target.value)}
                            className="w-full text-sm border-b border-slate-300 py-1 focus:border-blue-600 focus:outline-none bg-transparent"
                          />
                       </div>

                       {/* Added Text Area here for Reporting Notes */}
                       <TextArea 
                          label="Custom Report Notes"
                          placeholder="Add any specific instructions for the finance team..."
                          value={config.accounting.notes}
                          onChange={(val) => handleConfigChange('accounting', 'notes', val)}
                       />
                    </div>
                  )}
                </div>
              </div>
            </div>

          </form>

          {/* Footer Action */}
          <div className="flex flex-col md:flex-row items-center justify-between bg-slate-800 text-slate-300 p-6 rounded-xl shadow-lg mt-8">
            <div className="mb-4 md:mb-0">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Lock className="w-4 h-4" /> Security Status
              </h3>
              <p className="text-sm mt-1">All keys are encrypted at rest using AES-256.</p>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/50 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">Processing...</span>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Update Integrations
                </>
              )}
            </button>
          </div>

        </div>

        {/* Animation Styles */}
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.2s ease-out forwards;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default IntegrationsPage;