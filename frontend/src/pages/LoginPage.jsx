import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import DeskImage from '../assets/signupimg.jpg';
import booklogo from '../assets/manocore_book_logo.png';
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";

export default function LoginPage() {
  const navigate = useNavigate();
  
  const dispatch = useDispatch();
const { isLoading, error } = useSelector((state) => state.auth);
  // --- State Management ---
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors when user types
    if (error) setError('');
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.email || !formData.password) {
    return;
  }

  const result = await dispatch(
    login({
      email: formData.email,
      password: formData.password,
    })
  );

  // Navigate only if login succeeds
  if (login.fulfilled.match(result)) {
    navigate("/dashboard");
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
       <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/20 to-transparent" />
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

      {/* --- RIGHT SIDE: Login Form --- */}
<div className="flex-1 order-2 bg-gray-200 h-screen overflow-y-auto relative">
        <div className="mx-auto w-full max-w-sm lg:w-96 mt-30">
          
          <div className="text-center lg:text-left">
             <h2 className="text-3xl font-bold text-gray-900">Sign in</h2>
             
          </div>

          <div className="mt-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Error Message Display */}
              {error && (
  <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
    {error}
  </div>
)}
              {/* Submit Button */}
              <div>
                <button
  type="submit"
  disabled={isLoading}
  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70"
>
  {isLoading ? (
    <div className="flex items-center">
      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
      Authenticating...
    </div>
  ) : (
    <div className="flex items-center">
      Sign in <ArrowRight className="ml-2 h-4 w-4" />
    </div>
  )}
</button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">
                    Don't have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Create new account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}