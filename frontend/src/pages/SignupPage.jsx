import React, { useState } from 'react';
import { 
  Eye, EyeOff, AlertCircle, Building2, Globe, Lock, 
  User, Mail, Smartphone, FileText, Check, ArrowRight, Star,
  PieChart, TrendingUp, Receipt, CreditCard, Wallet, CheckCircle2 // <--- Added these
} from 'lucide-react';
import DeskImage from '../assets/bg_logo.jpg';
import booklogo from '../assets/manocore_book_logo.png';

// --- Configuration & Data ---
const COUNTRY_DATA = {
  US: { name: 'United States', states: ['California', 'New York', 'Texas', 'Florida', 'Washington'], currency: 'USD', timezone: 'GMT-5 (Eastern Time)', flag: '🇺🇸' },
  IN: { name: 'India', states: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana'], currency: 'INR', timezone: 'GMT+5:30 (IST)', flag: '🇮🇳' },
  UK: { name: 'United Kingdom', states: ['England', 'Scotland', 'Wales', 'Northern Ireland'], currency: 'GBP', timezone: 'GMT+0 (BST)', flag: '🇬🇧' },
  CA: { name: 'Canada', states: ['Ontario', 'Quebec', 'British Columbia', 'Alberta'], currency: 'CAD', timezone: 'GMT-5 (EST)', flag: '🇨🇦' }
};

const BUSINESS_TYPES = ['SaaS', 'E-commerce', 'Agency', 'Manufacturing', 'Retail', 'Other'];

// --- FIX: Components moved OUTSIDE the main component ---

const FormSection = ({ title, description, step, activeSection, setActiveSection, children }) => (
  <div 
    className={`relative pl-8 border-l-2 pb-10 transition-colors duration-300 ${
      activeSection >= step ? 'border-indigo-600' : 'border-gray-200'
    }`}
    onMouseEnter={() => setActiveSection(step)}
  >
    <span className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white transition-colors duration-300 ${
      activeSection >= step ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
    }`} />
    
    <div className="mb-6">
      <h3 className={`text-lg font-bold transition-colors ${activeSection === step ? 'text-gray-900' : 'text-gray-500'}`}>
        {title}
      </h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {children}
    </div>
  </div>
);

const InputField = ({ 
  label, name, type = "text", placeholder, icon: Icon, 
  required, options, disabled, spanFull, 
  value, onChange, error, showPassword, togglePassword 
}) => (
  <div className={`col-span-1 ${spanFull ? 'md:col-span-2' : ''}`}>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
      {label} {required && <span className="text-indigo-500">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {Icon && <Icon className={`h-5 w-5 transition-colors duration-200 ${
          error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-indigo-500'
        }`} />}
      </div>

      {options ? (
        <select
          name={name}
          value={value} // Controlled input
          onChange={onChange}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-4 py-3 text-sm rounded-xl border appearance-none
            transition-all duration-200 ease-in-out bg-gray-50 focus:bg-white
            ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}
            ${error 
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50/50' 
              : 'border-gray-200 text-gray-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-gray-300'
            }
          `}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value} // Controlled input
          onChange={onChange}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-4 py-3 text-sm rounded-xl border
            transition-all duration-200 ease-in-out bg-gray-50 focus:bg-white
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50' 
              : 'border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-gray-300'
            }
          `}
        />
      )}
      
      {name.includes('assword') && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
    {error && (
      <p className="mt-1.5 text-xs text-red-500 flex items-center animate-pulse">
        <AlertCircle size={12} className="mr-1" /> {error}
      </p>
    )}
  </div>
);

// --- Main Component ---

export default function SignupPage() {
  const [formData, setFormData] = useState({
    companyName: '', contactName: '', email: '', password: '', confirmPassword: '',
    country: '', state: '', currency: '', phone: '', timezone: '', taxId: '',
    businessType: '', termsAccepted: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [availableStates, setAvailableStates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(1); 

  // --- Logic Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    const countryInfo = COUNTRY_DATA[countryCode];

    if (countryInfo) {
      setAvailableStates(countryInfo.states);
      setFormData(prev => ({
        ...prev,
        country: countryCode, state: '',
        currency: countryInfo.currency,
        timezone: countryInfo.timezone
      }));
    } else {
      setAvailableStates([]);
      setFormData(prev => ({ ...prev, country: '', state: '', currency: '', timezone: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    
    if (!formData.companyName.trim()) newErrors.companyName = "Company Name is required";
    if (!formData.contactName.trim()) newErrors.contactName = "Full Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (!passwordRegex.test(formData.password)) newErrors.password = "Min 8 chars, 1 Upper, 1 Number";
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.country) newErrors.country = "Country is required";
    if (availableStates.length > 0 && !formData.state) newErrors.state = "State is required";
    if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        console.log("Payload:", formData);
        alert("Success! Redirecting to onboarding...");
      }, 1500);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-indigo-100">
      
{/* --- LEFT SIDE: Finance/Invoice Image Area --- */}
<div className="hidden lg:flex relative w-0 flex-1 bg-slate-900 overflow-hidden order-1 flex-col">

  {/* Background Layer Group */}
  <div className="absolute inset-0 z-0">
    {/* Background Image */}
    <img 
      src={DeskImage}
      alt="Workspace desk"
      className="w-full h-full object-cover opacity-30 mix-blend-overlay"
    />
    {/* Gradient Overlay: Ensures text at the bottom is readable */}
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
  </div>

  {/* Animated Background Blobs */}
  {/* Blob 1 (Top Right) */}
  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] 
        bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
  
  {/* Blob 2 (Bottom Left - Added for balance) */}
  <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] 
        bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

  {/* --- Centered Icon Area --- */}
  <div className="relative z-10 flex-1 flex items-center justify-center">
    {/* Added a subtle glassmorphism card effect behind the logo */}
    <div className="relative flex items-center justify-center w-64 h-64 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 shadow-2xl animate-[fadeInScale_1.2s_ease-out]">
      <img
        src={booklogo}
        alt="Invoice Icon"
        className="w-32 h-32 drop-shadow-xl"
      />
    </div>
  </div>

  {/* --- Bottom Text Content --- */}
  <div className="relative z-10 p-12 text-white">
    <blockquote className="space-y-2">
      <p className="text-lg font-medium text-indigo-200">
        &ldquo;Simplifying finance for modern businesses.&rdquo;
      </p>
      <footer className="text-sm text-slate-400">
        Manage invoices, track expenses, and grow faster.
      </footer>
    </blockquote>
  </div>
</div>



     {/* --- RIGHT SIDE: Form Area --- */}
<div className="flex-1 order-2 bg-gray-200 h-screen overflow-y-auto relative">
  
  {/* Inner Wrapper: uses min-h-full to allow scrolling without clipping the top */}
  <div className="flex flex-col justify-center min-h-full py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
    
    <div className="mx-auto w-full max-w-lg">
      
      {/* Mobile Logo (Visible only on small screens) */}
      <div className="lg:hidden mb-8">
        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <PieChart size={24} />
        </div>
      </div>

      {/* Header Section - Fixed Position & Spacing */}
      <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Create your account
          </h2>
        
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        
        {/* 1. Account Details */}
        <FormSection 
          step={1} 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          title="Administrator" 
          description="Who will manage this account?"
        >
          <InputField 
            label="Full Name" 
            name="contactName" 
            value={formData.contactName} 
            onChange={handleChange}
            icon={User} 
            required 
            placeholder="John Doe"
            error={errors.contactName} 
          />
          <InputField 
            label="Work Email" 
            name="email" 
            type="email" 
            value={formData.email}
            onChange={handleChange}
            icon={Mail} 
            required 
            placeholder="name@work.com" 
            error={errors.email}
          />
          <InputField 
            label="Password" 
            name="password" 
            type={showPassword ? "text" : "password"} 
            value={formData.password}
            onChange={handleChange}
            icon={Lock} 
            required 
            placeholder="Min 8 chars" 
            error={errors.password}
            showPassword={showPassword}
            togglePassword={() => setShowPassword(!showPassword)}
          />
          <InputField 
            label="Confirm" 
            name="confirmPassword" 
            type={showPassword ? "text" : "password"} 
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={Lock} 
            required 
            placeholder="Repeat password" 
            error={errors.confirmPassword}
            showPassword={showPassword}
            togglePassword={() => setShowPassword(!showPassword)}
          />
        </FormSection>

        {/* 2. Company Details */}
        <FormSection 
          step={2} 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          title="Organization" 
          description="Tell us about your company"
        >
          <InputField 
            label="Legal Company Name" 
            name="companyName" 
            value={formData.companyName}
            onChange={handleChange}
            icon={Building2} 
            required 
            placeholder="Acme Inc." 
            spanFull
            error={errors.companyName} 
          />
          <InputField 
            label="Industry" 
            name="businessType" 
            value={formData.businessType}
            onChange={handleChange}
            icon={FileText} 
            options={BUSINESS_TYPES} 
          />
          <InputField 
            label="Tax ID / GST" 
            name="taxId" 
            value={formData.taxId}
            onChange={handleChange}
            icon={FileText} 
            placeholder="Optional" 
          />
          <InputField 
            label="Phone" 
            name="phone" 
            type="tel" 
            value={formData.phone}
            onChange={handleChange}
            icon={Smartphone} 
            placeholder="+1 (555) 000-0000" 
            spanFull 
          />
        </FormSection>

        {/* 3. Regional Details */}
        <FormSection 
          step={3} 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          title="Localization" 
          description="Set your default currency & region"
        >
          <InputField 
            label="Country" 
            name="country" 
            value={formData.country}
            onChange={handleCountryChange}
            icon={Globe} 
            required 
            options={Object.keys(COUNTRY_DATA).map(k => ({ value: k, label: `${COUNTRY_DATA[k].flag} ${COUNTRY_DATA[k].name}` }))} 
            error={errors.country}
          />
          <InputField 
            label="State" 
            name="state" 
            value={formData.state}
            onChange={handleChange}
            icon={Globe} 
            required={availableStates.length > 0} 
            disabled={!formData.country || availableStates.length === 0}
            options={availableStates.length > 0 ? availableStates : null}
            placeholder={availableStates.length === 0 ? "Select Country" : "Select State"}
            error={errors.state}
          />
          <InputField 
            label="Currency" 
            name="currency" 
            value={formData.currency}
            onChange={handleChange}
            icon={FileText} 
            required 
            placeholder="Auto-set" 
          />
          <InputField 
            label="Timezone" 
            name="timezone" 
            value={formData.timezone}
            onChange={handleChange}
            icon={Globe} 
            required 
            options={formData.timezone ? [formData.timezone] : null}
            placeholder="Auto-set"
          />
        </FormSection>

        {/* Footer / Submit */}
        <div className="pt-2 pl-8">
          <div className="flex items-center mb-6">
            <input
              id="terms"
              name="termsAccepted"
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I agree to the <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 underline decoration-indigo-200 underline-offset-2">Terms</a> and <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 underline decoration-indigo-200 underline-offset-2">Privacy Policy</a>
            </label>
          </div>
          {errors.termsAccepted && <p className="text-xs text-red-500 mb-4 -mt-4">{errors.termsAccepted}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-shine" />
            {isSubmitting ? 'Setting up environment...' : (
              <span className="flex items-center gap-2">
                Create Account <ArrowRight size={16} />
              </span>
            )}
          </button>
          
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Log in</a>
          </p>
        </div>

      </form>
    </div>
  </div>
</div>
    </div>
  );
}