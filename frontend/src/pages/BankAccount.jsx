import React, { useState } from 'react';
import Layout from '../components/Layout'; // Ensure this path matches your folder structure
import { 
  Building2, 
  CreditCard, 
  Globe, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Save, 
  X,
  AlertCircle,
  FileText // Added icon for the text area section
} from 'lucide-react';

// --- Reusable UI Components (Defined OUTSIDE the main component to prevent focus loss) ---

const Label = ({ children, required }) => (
  <label className="block text-sm font-medium text-slate-700 mb-1">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const Input = ({ name, type = "text", placeholder, value, onChange, error, icon: Icon, ...props }) => (
  <div className="relative">
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-slate-400" />
        </div>
      )}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-lg border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'} ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm transition duration-200 focus:outline-none focus:ring-2 focus:border-transparent shadow-sm placeholder:text-slate-400`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> {error}</p>}
  </div>
);

const TextArea = ({ name, placeholder, value, onChange, error, rows = 3, ...props }) => (
  <div className="relative">
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full rounded-lg border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600'} px-4 py-2.5 text-sm transition duration-200 focus:outline-none focus:ring-2 focus:border-transparent shadow-sm placeholder:text-slate-400 resize-y`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> {error}</p>}
  </div>
);

const Select = ({ name, value, onChange, options, error, ...props }) => (
  <div className="relative">
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full rounded-lg border ${error ? 'border-red-500' : 'border-slate-300'} bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm appearance-none`}
      {...props}
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {/* Custom arrow pointer to ensure UI consistency */}
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
    </div>
  </div>
);

// --- Main Page Component ---

const BankAccountPage = () => {
  // --- State Management ---
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolderName: '',
    accountType: 'Savings',
    currency: 'USD',
    country: 'USA', 
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    swiftCode: '',
    ibanCode: '',
    branchAddress: '', // Added for TextArea
    notes: '',         // Added for TextArea
    ledger: 'Unmapped',
  });

  const [customFields, setCustomFields] = useState([]);
  const [showAccountNo, setShowAccountNo] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Options ---
  const accountTypes = ['Savings', 'Current', 'Checking', 'Overdraft'];
  const currencies = ['USD', 'INR', 'EUR', 'GBP', 'AUD', 'CAD'];
  const countries = ['USA', 'India', 'United Kingdom', 'Germany', 'Canada'];

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { id: Date.now(), label: '', value: '' }]);
  };

  const removeCustomField = (id) => {
    setCustomFields(customFields.filter(field => field.id !== id));
  };

  const handleCustomFieldChange = (id, key, value) => {
    const updatedFields = customFields.map(field => 
      field.id === id ? { ...field, [key]: value } : field
    );
    setCustomFields(updatedFields);
  };

  // --- Validation Logic ---
  const validate = () => {
    const newErrors = {};
    
    if (!formData.bankName) newErrors.bankName = "Bank Name is required";
    if (!formData.accountHolderName) newErrors.accountHolderName = "Account Holder Name is required";
    
    if (!formData.accountNumber) {
      newErrors.accountNumber = "Account Number is required";
    } else if (!/^\d+$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account Number must be numeric";
    }

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers do not match";
    }

    if (formData.country === 'India' && !formData.ifscCode) {
      newErrors.ifscCode = "IFSC Code is required for Indian banks";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate API call
      console.log("Submitting Data:", { ...formData, customFields });
      setTimeout(() => {
        alert("Bank Account Saved Successfully!");
        setIsSubmitting(false);
      }, 1500);
    }
  };

  // --- RENDER ---
  return (
    <Layout>
      <div className="flex justify-center items-start pb-12">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 mt-13">
          
          {/* Header */}
          <div className="bg-white border-b border-slate-100 px-8 py-6">
            <h1 className="text-2xl font-bold text-slate-800">Add Bank Account</h1>
            <p className="text-slate-500 text-sm mt-1">Fill in the details below to link a new company bank account.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            
            {/* Section 1: Basic Information */}
            <section>
              <div className="flex items-center gap-2 mb-5 text-blue-700">
                <Building2 className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label required>Bank Name</Label>
                  <Input 
                    name="bankName" 
                    placeholder="e.g. Chase, HDFC, Citibank" 
                    value={formData.bankName} 
                    onChange={handleChange}
                    error={errors.bankName} 
                  />
                </div>
                <div>
                  <Label required>Account Holder Name</Label>
                  <Input 
                    name="accountHolderName" 
                    placeholder="Company or Person Name" 
                    value={formData.accountHolderName} 
                    onChange={handleChange}
                    error={errors.accountHolderName} 
                  />
                </div>
                <div>
                  <Label required>Account Type</Label>
                  <Select 
                    name="accountType" 
                    value={formData.accountType} 
                    onChange={handleChange}
                    options={accountTypes} 
                  />
                </div>
                <div>
                  <Label required>Currency</Label>
                  <Select 
                    name="currency" 
                    value={formData.currency} 
                    onChange={handleChange}
                    options={currencies} 
                  />
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 2: Account Credentials */}
            <section>
              <div className="flex items-center gap-2 mb-5 text-blue-700">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Account Credentials</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Account Number with Mask Toggle */}
                <div>
                  <Label required>Account Number</Label>
                  <div className="relative">
                    <Input 
                      name="accountNumber" 
                      type={showAccountNo ? "text" : "password"} 
                      placeholder="Enter account number" 
                      value={formData.accountNumber} 
                      onChange={handleChange}
                      error={errors.accountNumber}
                      maxLength={20}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccountNo(!showAccountNo)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showAccountNo ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label required>Confirm Account Number</Label>
                  <Input 
                    name="confirmAccountNumber" 
                    type={showAccountNo ? "text" : "password"} 
                    placeholder="Re-enter account number" 
                    value={formData.confirmAccountNumber} 
                    onChange={handleChange}
                    error={errors.confirmAccountNumber}
                    maxLength={20}
                  />
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 3: Routing & Location */}
            <section>
              <div className="flex items-center gap-2 mb-5 text-blue-700">
                <Globe className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Routing & Location</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div>
                  <Label required>Bank Country</Label>
                  <Select 
                    name="country" 
                    value={formData.country} 
                    onChange={handleChange}
                    options={countries} 
                  />
                </div>

                {formData.country === 'India' && (
                  <div className="animate-fade-in">
                    <Label required>IFSC Code</Label>
                    <Input 
                      name="ifscCode" 
                      placeholder="e.g. HDFC0001234" 
                      value={formData.ifscCode} 
                      onChange={handleChange}
                      error={errors.ifscCode}
                      maxLength={11}
                    />
                  </div>
                )}

                <div>
                  <Label>SWIFT / BIC Code</Label>
                  <Input 
                    name="swiftCode" 
                    placeholder="Optional" 
                    value={formData.swiftCode}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label>IBAN</Label>
                  <Input 
                    name="ibanCode" 
                    placeholder="Optional" 
                    value={formData.ibanCode}
                    onChange={handleChange}
                  />
                </div>

                {/* --- NEW TEXT AREA: Branch Address --- */}
                <div className="md:col-span-3">
                  <Label>Branch Address</Label>
                  <TextArea 
                    name="branchAddress"
                    placeholder="Enter the full address of the bank branch..."
                    value={formData.branchAddress}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>

              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 4: Accounting & Extras */}
            <section>
              <div className="flex items-center gap-2 mb-5 text-blue-700">
                <FileText className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Additional Information</h3>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                    <Label>Ledger Account (ERP Mapping)</Label>
                    <Select 
                      name="ledger" 
                      value={formData.ledger} 
                      onChange={handleChange}
                      options={['Unmapped', '1001 - Cash at Bank', '1002 - Petty Cash']} 
                    />
                  </div>
                  
                  {/* --- NEW TEXT AREA: Notes --- */}
                  <div>
                    <Label>Internal Notes</Label>
                    <TextArea 
                      name="notes"
                      placeholder="Any specific instructions for this account..."
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Dynamic Custom Fields */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-slate-700">Custom Fields</h4>
                    <button 
                      type="button" 
                      onClick={addCustomField}
                      className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus className="w-4 h-4" /> Add Field
                    </button>
                  </div>

                  {customFields.length === 0 && (
                    <p className="text-sm text-slate-400 italic">No custom fields added.</p>
                  )}

                  <div className="space-y-3">
                    {customFields.map((field) => (
                      <div key={field.id} className="flex gap-3 items-start animate-fade-in-up">
                        <div className="flex-1">
                          <input 
                            type="text" 
                            placeholder="Label" 
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={field.label}
                            onChange={(e) => handleCustomFieldChange(field.id, 'label', e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <input 
                            type="text" 
                            placeholder="Value" 
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={field.value}
                            onChange={(e) => handleCustomFieldChange(field.id, 'value', e.target.value)}
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeCustomField(field.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button 
                type="button" 
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-gradient-to-br from-indigo-600 via-blue-500 to-purple-600 hover:bg-gradient-to-br from-purple-500 via-blue-400 to-indigo-500 text-black font-medium shadow-lg shadow-blue-600/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : <><Save className="w-4 h-4" /> Save Account</>}
              </button>
            </div>

          </form>
        </div>

        {/* CSS for animations */}
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.2s ease-out forwards;
          }
          .animate-fade-in {
             animation: fadeInUp 0.3s ease-in-out;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default BankAccountPage;