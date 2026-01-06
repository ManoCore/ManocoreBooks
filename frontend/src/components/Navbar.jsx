import React from 'react';
import { Monitor, Palette, Smartphone, Handshake, Menu, ArrowRight} from 'lucide-react';
import { FaFacebook, FaLinkedin, FaInstagram} from 'react-icons/fa'; 
import { SiGoogle } from 'react-icons/si';
import { SiShopify } from 'react-icons/si';
import { GiBrain } from 'react-icons/gi';
import { FaCube } from 'react-icons/fa';
import { DiReact } from 'react-icons/di';
import { BsBarChartFill } from 'react-icons/bs';
import { TbBrandFlutter } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom'; // 1. Import the hook

export default function Navbar() {
  const navigate = useNavigate(); // 2. Initialize the hook

  // Function to handle navigation to different routes
  const handleNavigation = () => {
    navigate('/');
  };
    return (
        <nav className="w-full flex items-center justify-between px-10 lg:px-16 py-4 bg-gray-900 shadow-xl fixed z-1000">
      
      {/* Logo Section */}
      <div className="flex items-center space-x-2">
        {/* Adjusted logo styling for slightly better visibility/spacing */}
        <img onClick={handleNavigation} src="/logo_manocore_white.svg" alt="Manocore Logo" className="h-7 w-auto cursor-pointer" />
      </div>
      
      {/* Desktop Navigation Links */}
      <div className="hidden lg:flex space-x-10 text-gray-300 font-medium text-sm">
          <a onClick={handleNavigation} className="transition-transform duration-200 transform hover:scale-110 cursor-pointer">Home</a>

          <div className="relative group">
            <a
              href="#"
              className="transition-transform duration-200 transform hover:scale-105 flex items-center"
            >
              Products
            </a>

            {/* Fullscreen Dropdown */}
            <div className="fixed left-0 top-[72px] w-screen h-[50vh] bg-white text-gray-800 shadow-2xl border-t border-gray-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">

              {/* Inner Content Centered */}
              <div className="max-w-7xl mx-auto grid grid-cols-4 gap-10 px-16 py-12 divide-x divide-gray-200">

                {/* Section 1 - Shiftry */}
                <div className="pr-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Shiftry</h3>
                  <ul className="space-y-3 text-base">
                    <li><a href="#" className="hover:text-violet-900 text-gray-600 transition pl-4">Compliance</a></li>
                    <li><a href="#" className="hover:text-violet-900 text-gray-600 transition pl-4">Smart Shift Scheduling</a></li>
                    <li><a href="#" className="hover:text-violet-900 text-gray-600 transition pl-4">Check-in / Check-out</a></li>
                  </ul>
                </div>

                {/* Section 2 - Manocore AI */}
                <div className="px-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Manocore AI</h3>
                  <ul className="space-y-3 text-base">
                    <li><a href="#" className="hover:text-violet-900 text-gray-600 transition pl-4">Text to Image</a></li>
                    <li><a href="#" className="hover:text-violet-900 text-gray-600 transition pl-4">Text to Video</a></li>
                    <li><a href="#" className="hover:text-violet-900 text-gray-600 transition pl-4">AI Agents</a></li>
                    <li><a href="#" className="hover:text-violet-900 text-gray-600 transition pl-4">AI Chatbot</a></li>
                  </ul>
                </div>

                {/* Section 3 - Manocore HR */}
                <div className="px-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Manocore HR</h3>
                  <ul className="space-y-3 text-base">
                    <li><a href="#" className="hover:text-violet-900 text-gray-600 transition pl-4">Payroll Management</a></li>
                    <li><a href="#" className="hover:text-violet-900 text-gray-600 transition pl-4">Attendance Tracking</a></li>
                    <li><a href="#" className="hover:text-violet-900 text-gray-600 transition pl-4">Employee Portal</a></li>
                    <li><a href="#" className="hover:text-violet-900 text-gray-600 transition pl-4">Reports</a></li>
                  </ul>
                </div>

                {/* Section 4 - Manocore Books */}
                <div className="pl-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Manocore Books</h3>
                  <ul className="space-y-3 text-base">
                    <li><a href="#" className="hover:text-violet-900 text-gray-600 transition pl-4">Invoice Generation</a></li>
                    <li><a href="#" className="hover:text-violet-900 text-gray-600 transition pl-4">Finance Tracking</a></li>
                    <li><a href="#" className="hover:text-violet-900 text-gray-600 transition pl-4">Tax Management</a></li>
                    <li><a href="#" className="hover:text-violet-900 text-gray-600 transition pl-4">Analytics</a></li>
                  </ul>
                </div>

              </div>
            </div>
          </div>



          <div className="relative group">
            {/* Trigger Icon */}
            <a
              href="#"
              className="transition-transform duration-200 transform hover:scale-110 block"
            >
              <img src="/AI-LOGO.svg" alt="AI Products" className="w-[20px]" />
            </a>

            {/* Dropdown Menu */}
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-6 w-56 bg-white text-gray-800 rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
              <div className='font-bold p-5'>
                Manocore AI
              </div>
              {/* Manocore AI Section */} 
              <ul className="ml-5 mb-2 space-y-1 text-sm text-gray-800">
                <li>
                  <a href="#" className="block px-2 py-1 hover:text-violet-900">
                    Text to Image
                  </a>
                </li>
                <li>
                  <a href="#" className="block px-2 py-1 hover:text-violet-900">
                    Text to Video
                  </a>
                </li>
                <li>
                  <a href="#" className="block px-2 py-1 hover:text-violet-900">
                     AI Agents
                  </a>
                </li>
                <li>
                  <a href="#" className="block px-2 py-1 hover:text-violet-900">
                    AI Chatbot
                  </a>
                </li>
              </ul>
            </div>
          </div>


          <div className="relative group">
              <a href="#" className="transition-transform duration-200 transform hover:scale-110 flex items-center">
                  Services
                  
              </a>
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-7 w-48 bg-white text-gray-800 rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
                  <a href="#" className="block px-4 py-2 hover:text-violet-900 rounded-t-md">Web development</a>
                  <a href="#" className="block px-4 py-2 hover:text-violet-900">Mobile App development</a>
                  <a href="#" className="block px-4 py-2 hover:text-violet-900">UI/UX</a>
                  <a href="#" className="block px-4 py-2 hover:text-violet-900 rounded-b-md">Customer support</a>
              </div>
          </div>

          <a href="#" className="transition-transform duration-200 transform hover:scale-110">Blog</a>
          <a href="#" className="transition-transform duration-200 transform hover:scale-110">Company</a>
      </div>
      
      {/* Desktop Buttons (Login, Sign Up, Book a Call) */}
      <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
        
        {/* Login Button (Subtle Text Link) */}
        <button className="transition-transform duration-200 transform hover:scale-110 cursor-pointer">
          Login
        </button>

        {/* Book a Call Button (Primary CTA) */}
        <button className="bg-indigo-600 hover:bg-indigo-500 rounded-full px-5 py-2 text-white font-medium text-sm shadow-lg transition-colors duration-200 cursor-pointer ">
          Book a Call
        </button>
      </div>
      
      {/* Mobile Menu Button (Hamburger) */}
      <button className="md:hidden">
        {/* Tailwind-friendly Menu Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </nav>
    )
}