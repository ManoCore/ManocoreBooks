import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  LockClosedIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  UserIcon,
  LanguageIcon,
  ClockIcon,
  MagnifyingGlassIcon // Added for the search input icon
} from "@heroicons/react/24/outline";
import { FiPlusCircle, FiSend } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import {toast}  from "react-hot-toast";
import { getProfile, updateProfile} from "../api/profile.api";

// Fix your image imports (Ensure these paths are correct in your project)
import manocoreBooksLogo from "../assets/manocore_books_logo_final_without_bg.png.png";
import manocorelogo from "../assets/manocore_ai_logo1.png";

// --- PROFILE SETTINGS MODAL COMPONENT ---
const ProfileSettingsModal = ({ isOpen, onClose }) => {
  const user=useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("account");

  // Mock States for Form Handling
 const [formData, setFormData] = useState({
  name: "",
  email: "",
  currentPassword: "",
  newPassword: "",
  timezone: "",
  language: "",
  emailNotifs: true,
  pushNotifs: false,
});

useEffect(() => {
  if (user) {
    setFormData((prev) => ({
      ...prev,
      name: user.fullName || "",
      email: user.email || "",
      timezone: user.timezone || "IST (UTC+05:30)",
      language: user.language || "English (US)",
      emailNotifs: user.emailNotifs ?? true,
      pushNotifs: user.pushNotifs ?? false,
    }));
  }
}, [user, isOpen]);

useEffect(() => {
  if (!isOpen) return;

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      const u = res.data.user;

      setFormData({
        name: u.fullName || "",
        email: u.email || "",
        currentPassword: "",
        newPassword: "",
        timezone: u.timezone || "IST (UTC+05:30)",
        language: u.language || "English (US)",
        emailNotifs: u.notificationPreferences?.email ?? true,
        pushNotifs: u.notificationPreferences?.inApp ?? false,
      });
    } catch (err) {
      toast.error("Failed to load profile");
    }
  };

  loadProfile();
}, [isOpen]);


  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };



  const handleSave = async () => {
  try {
    await updateProfile({
      fullName: formData.name,
      timezone: formData.timezone,
      language: formData.language,
      notificationPreferences: {
        email: formData.emailNotifs,
        inApp: formData.pushNotifs,
      },
    });

    toast.success("Profile updated successfully");
    onClose();
  } catch (err) {
    toast.error(err.response?.data?.message || "Update failed");
  }
};

  if (!isOpen) return null;

  return (
   <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 10 }}
    className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
  >
    
    {/* SIDEBAR */}
<div className="w-full md:w-1/4 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-2 overflow-y-auto max-h-40 md:max-h-none custom-scroll">

      <h2 className="text-lg font-bold text-gray-700 px-4 mb-4 mt-2">Settings</h2>

      <button
        onClick={() => setActiveTab("account")}
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
          activeTab === "account" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <UserIcon className="w-5 h-5" /> Account
      </button>

      <button
        onClick={() => setActiveTab("preferences")}
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
          activeTab === "preferences" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <GlobeAltIcon className="w-5 h-5" /> Preferences
      </button>

      <button
        onClick={() => setActiveTab("notifications")}
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
          activeTab === "notifications" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <BellIcon className="w-5 h-5" /> Notifications
      </button>
    </div>

    {/* MAIN CONTENT */}
    <div className="flex-1 flex flex-col relative overflow-hidden">

      {/* CLOSE BUTTON */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-all z-20"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <div className="p-6 md:p-8 overflow-y-auto flex-1">

        {/* ACCOUNT TAB */}
        {activeTab === "account" && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800">Profile & Security</h3>
            <p className="text-gray-500 text-sm -mt-4">Manage your personal details and password.</p>

            {/* PROFILE DETAILS */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                G
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Gladson</h4>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
              <button className="sm:ml-auto text-sm text-blue-600 hover:underline">Change Photo</button>
            </div>

            {/* INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* PASSWORD */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <LockClosedIcon className="w-4 h-4" /> Change Password
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Current Password"
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === "preferences" && (
          <div className="space-y-8">
            <h3 className="text-2xl font-semibold text-gray-800">Regional Preferences</h3>
            <p className="text-gray-500 text-sm -mt-6">Set your language and timezone settings.</p>

            <div className="space-y-5 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" /> Timezone
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>IST (UTC+05:30)</option>
                  <option>PST (UTC-08:00)</option>
                  <option>EST (UTC-05:00)</option>
                  <option>GMT (UTC+00:00)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <LanguageIcon className="w-4 h-4" /> Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div className="space-y-8">
            <h3 className="text-2xl font-semibold text-gray-800">Notification Settings</h3>
            <p className="text-gray-500 text-sm -mt-6">Choose how you want to be notified.</p>

            <div className="space-y-6">

              {/* EMAIL */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50 hover:border-blue-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <EnvelopeIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Email Notifications</h4>
                    <p className="text-xs text-gray-500">Receive updates and reports via email.</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="emailNotifs" 
                    checked={formData.emailNotifs} 
                    onChange={handleChange} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:h-5 after:w-5 after:bg-white after:rounded-full after:left-0.5 after:top-0.5 peer-checked:after:translate-x-full after:transition-all"></div>
                </label>
              </div>

              {/* PUSH */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50 hover:border-blue-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <BellIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Push Notifications</h4>
                    <p className="text-xs text-gray-500">Get real-time alerts on your dashboard.</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="pushNotifs" 
                    checked={formData.pushNotifs} 
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-purple-600 after:content-[''] after:absolute after:h-5 after:w-5 after:bg-white after:rounded-full after:left-0.5 after:top-0.5 peer-checked:after:translate-x-full after:transition-all"></div>
                </label>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
        <button
          onClick={onClose}
          className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          className="px-5 py-2 bg-linear-to-br from-purple-600 via-blue-500 to-indigo-600 text-black rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
        >
          Save Changes
        </button>
      </div>

    </div>
  </motion.div>
</div>

  );
};

// --- MAIN HEADER COMPONENT ---
const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
const { user } = useSelector((state) => state.auth);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [showSearch, setShowSearch] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const plusMenuRef = useRef(null);
  
  // New input state to handle placeholder visibility logic
  const [inputValue, setInputValue] = useState("");

  // New State for Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Typing animated placeholder
  const placeholders = [
    "Ask MAi to generate reports...",
    "Search invoices...",
    "Generate charts instantly..."
  ];
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [typing, setTyping] = useState(true);

  // Typing Effect
  useEffect(() => {
    let charIndex = 0;
    setDisplayedText("");
    setTyping(true);

    const interval = setInterval(() => {
      if (charIndex < placeholders[index].length) {
        setDisplayedText((prev) => prev + placeholders[index][charIndex]);
        charIndex++;
      } else {
        setTyping(false);
        clearInterval(interval);
        setTimeout(() => {
          setIndex((prev) => (prev + 1) % placeholders.length);
        }, 2000);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [index]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) {
        setPlusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Function to open settings modal
  const openSettings = () => {
    setMenuOpen(false);
    setShowProfileModal(true);
  };


  const handleLogout = () => {
  dispatch(logout());      // Redux clears auth state
  setMenuOpen(false);      // Close dropdown
  navigate("/login");      // Redirect
};

  return (
    <div className="rounded-xl overflow-hidden">
      {/* RENDER MODAL */}
      <AnimatePresence>
        {showProfileModal && (
          <ProfileSettingsModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="fixed top-0 left-0 w-full z-50 bg-linear-to-r 
        from-gray-100 via-gray-200 to-gray-100 text-gray-900 py-3 px-8 
        shadow-lg backdrop-blur-md border-b border-gray-300">

        <div className="flex justify-between items-center">

          {/* LEFT LOGO */}
          <div
            className="flex flex-col cursor-pointer select-none"
            onClick={() => navigate("/")}
          >
            <div className="flex items-center gap-2">
              <img
                src={manocoreBooksLogo}
                alt="manocoreBooksLogo"
                className="h-10 w-10 object-contain"
              />
              <h1 className="text-2xl font-semibold tracking-tight">
                manocore Books
              </h1>
            </div>
           
          </div>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-6">

            {/* AI LOGO → OPEN SEARCH BAR */}
            <motion.img
              src={manocorelogo}
              alt="AI Logo"
              className="h-14 w-20 cursor-pointer"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              onClick={() => setShowSearch((prev) => !prev)}
            />

            {/* NOTIFICATION */}
            <button className="relative p-2 rounded-full bg-linear-to-br 
              from-gray-100 to-gray-200 hover:from-white hover:to-gray-100 
              shadow-sm hover:shadow-md transition-all duration-300 
              transform hover:scale-110"
            >
              <BellIcon className="h-6 w-6 text-gray-700" />
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 
                bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* PROFILE MENU */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`p-2 rounded-full bg-linear-to-br from-gray-100 
                  to-blue-500 hover:from-white hover:to-blue-700 shadow-sm 
                  hover:shadow-md transition-all duration-300 transform ${
                    menuOpen ? "scale-110 rotate-6" : "hover:scale-110"
                  }`}
              >
                <UserCircleIcon className="h-7 w-7 text-gray-700" />
              </button>

              {/* DROPDOWN */}
              <div
                className={`absolute right-0 mt-3 w-56 bg-white border 
                  border-gray-300 rounded-xl shadow-xl overflow-hidden 
                  transition-all duration-300 origin-top-right z-55 ${
                    menuOpen
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                  }`}
              >
                <div className="px-4 py-3 bg-linear-to-br 
                    from-blue-100 via-indigo-300 to-purple-500 border-b">
                  <p className="text-sm font-semibold text-gray-800">
  {user?.fullName || "User"}
</p>
<p className="text-xs text-gray-700">
  {user?.email}
</p>
                </div>

                <ul className="py-1 text-sm text-gray-700">
                  <li
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={openSettings}
                  >
                    Profile Settings
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={openSettings}
                  >
                    Account Settings
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => { navigate("/help"); setMenuOpen(false); }}
                  >
                    Help & Support
                  </li>

                  <li
  onClick={handleLogout}
  className="px-4 py-2 hover:bg-red-100 text-red-600 
    border-t border-gray-100 flex items-center gap-2 cursor-pointer"
>
  <ArrowRightOnRectangleIcon className="h-4 w-4" />
  Logout
</li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* ================= UPGRADED SEARCH BAR ================= */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="fixed top-22 right-10 z-40 flex flex-col items-end"
            >
              <div className="relative group">
                {/* GLOW EFFECT BEHIND */}
                <div className="absolute -inset-0.5 bg-linear-to-r from-blue-400 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

                <motion.div
                  className="relative flex items-center w-[500px] h-[60px] px-5 
                  bg-white/80 backdrop-blur-2xl border border-white/50 
                  rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                  layout
                >
                  
                  {/* LEFT ACTION MENU */}
                  <div className="relative" ref={plusMenuRef}>
                    <motion.button
                      onClick={() => setPlusOpen(!plusOpen)}
                      whileHover={{ scale: 1.1, color: "#2563EB" }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-2 rounded-full transition-colors ${
                        plusOpen ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <FiPlusCircle size={24} />
                    </motion.button>

                    {/* DROPDOWN MENU */}
                    <AnimatePresence>
                      {plusOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute left-0 mt-4 w-52 bg-white/90 backdrop-blur-xl 
                          border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-left"
                        >
                          <div className="px-2 py-2 flex flex-col gap-1">
                             <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all">
                               <div className="w-2 h-2 rounded-full bg-blue-500"></div> New Chat
                             </button>
                             <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all">
                               <div className="w-2 h-2 rounded-full bg-purple-500"></div> Generate Report
                             </button>
                             <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-all">
                               <div className="w-2 h-2 rounded-full bg-green-500"></div> Add KPI
                             </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* DIVIDER */}
                  <div className="h-6 w-px bg-gray-300 mx-3"></div>

                  {/* SEARCH INPUT AREA */}
                  <div className="flex-1 relative h-full flex items-center">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-2" />
                    
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full bg-transparent text-gray-800 text-base font-medium 
                      outline-none placeholder-transparent z-10 h-full"
                      autoFocus
                    />

                    {/* ANIMATED PLACEHOLDER (Only visible when input is empty) */}
                    {!inputValue && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-7 text-gray-400 pointer-events-none text-base"
                      >
                         {typing ? displayedText : placeholders[index]}
                         <span className="animate-pulse text-blue-500">|</span>
                      </motion.span>
                    )}
                  </div>

                  {/* SEND BUTTON */}
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: -10 }}
                    whileTap={{ scale: 0.95 }}
                    className="ml-2 p-2.5 bg-linear-to-r from-blue-600 to-indigo-600 
                    text-white rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 
                    transition-all duration-300 flex items-center justify-center"
                  >
                    <FiSend size={18} />
                  </motion.button>

                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>        
  );
};

export default Header;




// import React, { useState, useRef, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import {
//   BellIcon,
//   UserCircleIcon,
//   ArrowRightOnRectangleIcon,
//   XMarkIcon,
//   LockClosedIcon,
//   GlobeAltIcon,
//   EnvelopeIcon,
//   UserIcon,
//   LanguageIcon,
//   ClockIcon
// } from "@heroicons/react/24/outline";
// import { FiPlusCircle, FiSend, FiSearch } from "react-icons/fi";

// // ✅ Verify these paths match your project structure
// import manocoreBooksLogo from "../assets/manocore_books_logo_final_without_bg.png.png";
// import manocorelogo from "../assets/manocore_ai_logo1.png";

// // --- CUSTOM HOOK: SMOOTH TYPEWRITER EFFECT ---
// const useTypewriter = (words, typingSpeed = 100, deletingSpeed = 50, pauseTime = 1500) => {
//   const [text, setText] = useState("");
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [loopNum, setLoopNum] = useState(0);
//   const [typing, setTyping] = useState(true);

//   useEffect(() => {
//     const i = loopNum % words.length;
//     const fullText = words[i];

//     const handleType = () => {
//       setText(isDeleting 
//         ? fullText.substring(0, text.length - 1) 
//         : fullText.substring(0, text.length + 1)
//       );

//       // Determine typing speed
//       let typeSpeed = isDeleting ? deletingSpeed : typingSpeed;

//       if (!isDeleting && text === fullText) {
//         // Finished typing word, pause before deleting
//         typeSpeed = pauseTime;
//         setIsDeleting(true);
//       } else if (isDeleting && text === "") {
//         // Finished deleting, switch to next word
//         setIsDeleting(false);
//         setLoopNum(loopNum + 1);
//         typeSpeed = 500;
//       }

//       setTyping(true);
//     };

//     const timer = setTimeout(handleType, typing ? 100 : 100);
//     return () => clearTimeout(timer);
//   }, [text, isDeleting, loopNum, words, typingSpeed, deletingSpeed, pauseTime]);

//   return text;
// };

// // --- PROFILE SETTINGS MODAL COMPONENT ---
// const ProfileSettingsModal = ({ isOpen, onClose }) => {
//   const [activeTab, setActiveTab] = useState("account");
//   const [formData, setFormData] = useState({
//     name: "Gladson",
//     email: "gladsonm934@gmail.com",
//     timezone: "IST (UTC+05:30)",
//     language: "English (US)",
//     emailNotifs: true,
//     pushNotifs: false,
//   });

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95, y: 10 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.95, y: 10 }}
//         className="bg-white w-full max-w-4xl h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
//       >
//         {/* SIDEBAR */}
//         <div className="w-full md:w-1/4 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-2">
//           <h2 className="text-lg font-bold text-gray-700 px-4 mb-4 mt-2">Settings</h2>
//           {["account", "preferences", "notifications"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all capitalize ${
//                 activeTab === tab ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
//               }`}
//             >
//               {tab === "account" && <UserIcon className="w-5 h-5" />}
//               {tab === "preferences" && <GlobeAltIcon className="w-5 h-5" />}
//               {tab === "notifications" && <BellIcon className="w-5 h-5" />}
//               {tab}
//             </button>
//           ))}
//         </div>

//         {/* CONTENT */}
//         <div className="flex-1 flex flex-col relative">
//           <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500">
//             <XMarkIcon className="w-6 h-6" />
//           </button>

//           <div className="p-8 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-200">
//             {activeTab === "account" && (
//               <div className="space-y-6">
//                 <h3 className="text-2xl font-semibold text-gray-800">Profile & Security</h3>
//                 <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
//                   <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">G</div>
//                   <div>
//                     <h4 className="font-medium text-gray-800">Gladson</h4>
//                     <p className="text-sm text-gray-500">Administrator</p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-gray-700">Full Name</label>
//                     <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-gray-700">Email</label>
//                     <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
//                   </div>
//                 </div>
//                 <div className="pt-4">
//                   <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><LockClosedIcon className="w-4 h-4" /> Change Password</h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <input type="password" placeholder="Current Password" className="w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
//                     <input type="password" placeholder="New Password" className="w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
//                   </div>
//                 </div>
//               </div>
//             )}
//             {/* Keeping other tabs simplified for brevity as the focus is Search Bar */}
//             {activeTab === "preferences" && <div><h3 className="text-2xl font-semibold">Preferences</h3><p className="text-gray-500 mt-2">Manage language and time settings.</p></div>}
//             {activeTab === "notifications" && <div><h3 className="text-2xl font-semibold">Notifications</h3><p className="text-gray-500 mt-2">Manage email and push alerts.</p></div>}
//           </div>

//           <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
//              <button onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
//              <button onClick={() => { alert("Saved!"); onClose(); }} className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">Save Changes</button>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// // --- MAIN HEADER COMPONENT ---
// const Header = () => {
//   const navigate = useNavigate();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [showSearch, setShowSearch] = useState(false);
//   const [plusOpen, setPlusOpen] = useState(false);
//   const [showProfileModal, setShowProfileModal] = useState(false);
//   const [isInputFocused, setIsInputFocused] = useState(false);

//   const menuRef = useRef(null);
//   const plusMenuRef = useRef(null);
//   const searchContainerRef = useRef(null);

//   // Animated Placeholder Logic
//   const placeholderText = useTypewriter([
//     "Ask MAi to generate reports...",
//     "Analyze Q3 profit margins...",
//     "Create a new invoice...",
//     "Search for client details..."
//   ]);

//   // Handle Outside Clicks
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
//       if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) setPlusOpen(false);
//       // Close search if clicked outside completely (optional)
//       if (showSearch && searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
//          // setShowSearch(false); // Uncomment if you want search to close on click outside
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [showSearch]);

//   const openSettings = () => {
//     setMenuOpen(false);
//     setShowProfileModal(true);
//   };

//   return (
//     <div className="relative z-50">
//       <AnimatePresence>
//         {showProfileModal && <ProfileSettingsModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />}
//       </AnimatePresence>

//       {/* --- NAVBAR BACKGROUND --- */}
//       <div className="fixed top-0 left-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm py-3 px-8 transition-all duration-300">
//         <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          
//           {/* LOGO */}
//           <div className="flex flex-col cursor-pointer select-none group" onClick={() => navigate("/")}>
//             <div className="flex items-center gap-3">
//               <motion.img 
//                 whileHover={{ rotate: 10 }}
//                 src={manocoreBooksLogo} 
//                 alt="Logo" 
//                 className="h-10 w-10 object-contain drop-shadow-sm" 
//               />
//               <h1 className="text-2xl font-bold tracking-tight text-gray-800 group-hover:text-blue-600 transition-colors">
//                 manocore Books
//               </h1>
//             </div>
//             <p className="text-xs font-medium text-gray-500 ml-12 -mt-1 tracking-wide">
//               Financial Intelligence Suite
//             </p>
//           </div>

//           {/* RIGHT ACTIONS */}
//           <div className="flex items-center gap-5">
            
//             {/* AI BUTTON (TOGGLES SEARCH) */}
//             <div className="relative group cursor-pointer" onClick={() => setShowSearch(!showSearch)}>
//               <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//               <motion.img
//                 src={manocorelogo}
//                 alt="AI"
//                 className="h-12 w-auto relative z-10"
//                 animate={showSearch ? { scale: 1.1, filter: "brightness(1.2)" } : { scale: 1 }}
//                 whileHover={{ scale: 1.1 }}
//               />
//             </div>

//             {/* NOTIFICATIONS */}
//             <motion.button whileTap={{ scale: 0.9 }} className="relative p-2.5 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors">
//               <BellIcon className="h-6 w-6" />
//               <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
//             </motion.button>

//             {/* USER DROPDOWN */}
//             <div className="relative" ref={menuRef}>
//               <motion.button
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => setMenuOpen(!menuOpen)}
//                 className={`flex items-center justify-center p-1 pr-2 rounded-full border border-gray-200 transition-all ${menuOpen ? 'ring-2 ring-blue-100 bg-blue-50' : 'hover:bg-gray-50'}`}
//               >
//                 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
//                   G
//                 </div>
//               </motion.button>

//               <AnimatePresence>
//                 {menuOpen && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
//                     className="absolute right-0 mt-4 w-60 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right"
//                   >
//                     <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
//                       <p className="text-sm font-bold text-gray-800">Gladson</p>
//                       <p className="text-xs text-gray-500 truncate">gladsonm934@gmail.com</p>
//                     </div>
//                     <ul className="py-2 text-sm text-gray-700">
//                       <li onClick={openSettings} className="px-5 py-2.5 hover:bg-blue-50 hover:text-blue-600 cursor-pointer flex items-center gap-2"><UserCircleIcon className="w-4 h-4"/> Profile</li>
//                       <li onClick={() => navigate("/help")} className="px-5 py-2.5 hover:bg-blue-50 hover:text-blue-600 cursor-pointer flex items-center gap-2"><GlobeAltIcon className="w-4 h-4"/> Help Center</li>
//                       <li onClick={() => navigate("/login")} className="px-5 py-2.5 mt-1 text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2 border-t border-gray-100"><ArrowRightOnRectangleIcon className="w-4 h-4"/> Sign Out</li>
//                     </ul>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>
//         </div>

//         {/* ================= UPDATED GLASSMORPHISM SEARCH BAR ================= */}
//         <AnimatePresence>
//           {showSearch && (
//             <motion.div
//               initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
//               animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
//               exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
//               transition={{ type: "spring", stiffness: 200, damping: 25 }}
//               className="absolute top-[80px] right-8 z-30"
//               ref={searchContainerRef}
//             >
//               <div className={`
//                 relative flex items-center w-[500px] p-2 rounded-2xl 
//                 transition-all duration-300 ease-out
//                 ${isInputFocused 
//                   ? "bg-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-4 ring-blue-500/10 border-blue-500/30" 
//                   : "bg-white/60 shadow-lg border-white/40 hover:bg-white/80"
//                 }
//                 backdrop-blur-2xl border
//               `}>
                
//                 {/* 1. PLUS MENU (Left) */}
//                 <div className="relative" ref={plusMenuRef}>
//                   <motion.button
//                     onClick={() => setPlusOpen(!plusOpen)}
//                     whileHover={{ scale: 1.1, backgroundColor: "#eff6ff" }}
//                     whileTap={{ scale: 0.9 }}
//                     className={`p-2 rounded-xl text-gray-500 transition-colors ${plusOpen ? 'text-blue-600 bg-blue-50' : 'hover:text-blue-600'}`}
//                   >
//                     <FiPlusCircle size={22} strokeWidth={2} />
//                   </motion.button>

//                   <AnimatePresence>
//                     {plusOpen && (
//                       <motion.div
//                         initial={{ opacity: 0, x: -10, scale: 0.95 }}
//                         animate={{ opacity: 1, x: 0, scale: 1 }}
//                         exit={{ opacity: 0, x: -10, scale: 0.95 }}
//                         className="absolute top-12 left-0 w-48 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl p-1.5 z-50 overflow-hidden"
//                       >
//                          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</div>
//                          {["New Chat", "Financial Report", "Add KPI", "Scan Invoice"].map((item) => (
//                            <button key={item} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
//                              {item}
//                            </button>
//                          ))}
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>

//                 {/* 2. SEARCH INPUT (Center) */}
//                 <div className="flex-1 relative px-3">
//                   <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
//                      <FiSearch className={`w-4 h-4 transition-colors ${isInputFocused ? 'text-blue-500' : 'text-gray-400'}`} />
//                   </div>
//                   <input
//                     type="text"
//                     onFocus={() => setIsInputFocused(true)}
//                     onBlur={() => setIsInputFocused(false)}
//                     className="w-full bg-transparent border-none outline-none text-gray-800 text-sm placeholder-transparent pl-8 h-10"
//                     // We hide standard placeholder to use our custom animated one below
//                   />
                  
//                   {/* Custom Typewriter Overlay (Pointer events none so clicks go to input) */}
//                   <div className={`absolute top-0 left-11 h-full flex items-center pointer-events-none transition-opacity duration-200 ${isInputFocused ? 'opacity-40' : 'opacity-100'}`}>
//                     <span className="text-gray-500 text-sm font-medium tracking-wide">
//                       {/* Check if input has value (basic logic) - simplified for demo */}
//                       {placeholderText}
//                     </span>
//                     <motion.span
//                       animate={{ opacity: [1, 0] }}
//                       transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
//                       className="inline-block w-[2px] h-4 bg-blue-500 ml-1 rounded-full"
//                     />
//                   </div>
//                 </div>

//                 {/* 3. SEND BUTTON (Right) */}
//                 <motion.button
//                   whileHover={{ scale: 1.05, backgroundColor: "#3b82f6" }}
//                   whileTap={{ scale: 0.95 }}
//                   className="p-2.5 bg-gray-900 text-white rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center group"
//                 >
//                   <FiSend size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
//                 </motion.button>
//               </div>

//               {/* Optional: Results hint dropdown */}
//               {isInputFocused && (
//                 <motion.div
//                    initial={{ opacity: 0, y: -10 }}
//                    animate={{ opacity: 1, y: 0 }}
//                    className="mt-2 w-full bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl shadow-xl p-2"
//                 >
//                   <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
//                     <ClockIcon className="w-3 h-3" /> Recent Searches
//                   </div>
//                   <div className="flex flex-wrap gap-2 px-2">
//                     {["Invoice #1023", "Q4 Projections", "Tax Report"].map(tag => (
//                       <span key={tag} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-blue-400 cursor-pointer transition-colors shadow-sm">
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                 </motion.div>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// };

// export default Header;