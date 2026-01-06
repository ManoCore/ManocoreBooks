import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/manocore_book_logo.png"; 
import aiLogo from "../assets/manocore-ai.png";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigation = () => {
    navigate("/");
  };

  return (
    <nav className="w-full fixed top-0 z-[1000] bg-black backdrop-blur-xl border-b border-white/10 shadow-lg py-3">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-8">

        {/* ✅ Logo */}
      <div className="flex items-center space-x-0.9">
          <img
            src={logo}                         
            alt="Manocore Logo"
            className="h-14 w-auto cursor-pointer  transition "  // ✅ BIGGER LOGO
          />
          <div className="text-2xl text-blue-50 font-bold font-Astro-Space gap-1.5">
            <h1>manocore Books</h1>
          </div>
        </div>

        {/* ✅ Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8 text-gray-300 text-shadow-xs font-medium">

          <a
            onClick={handleNavigation}
            className="cursor-pointer transition-all hover:text-white 
               relative before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 
               before:bg-gradient-to-r before:from-indigo-500 before:to-pink-500 
               before:transition-all before:duration-300 hover:before:w-full"
          >
            Home
          </a>
          {/* ✅ Services */}
          <div className="relative group">
            <a className="cursor-pointer transition-all hover:text-white 
               relative before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 
               before:bg-gradient-to-r before:from-indigo-500 before:to-pink-500 
               before:transition-all before:duration-300 hover:before:w-full">Services</a>

            <div className="absolute left-1/2 -translate-x-1/2 mt-6 w-48 bg-[#1d1d21] border border-white/10 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <a className="block px-4 py-2 hover:text-indigo-400 cursor-pointer">Web development</a>
              <a className="block px-4 py-2 hover:text-indigo-400 cursor-pointer">Mobile App development</a>
              <a className="block px-4 py-2 hover:text-indigo-400 cursor-pointer">UI/UX</a>
              <a className="block px-4 py-2 hover:text-indigo-400 cursor-pointer">Customer support</a>
            </div>
          </div>
            <a
            onClick={handleNavigation}
            className="cursor-pointer transition-all hover:text-white 
               relative before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 
               before:bg-gradient-to-r before:from-indigo-500 before:to-pink-500 
               before:transition-all before:duration-300 hover:before:w-full"
          >
            Features
          </a>
            {/* ✅ AI Logo */}
         <div className="relative group">
  <img
    src={aiLogo}
    alt="AI Logo"
    className="w-[29px] cursor-pointer hover:scale-110 transition"
  />
</div>

          <a className="cursor-pointer transition-all hover:text-white 
               relative before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 
               before:bg-gradient-to-r before:from-indigo-500 before:to-pink-500 
               before:transition-all before:duration-300 hover:before:w-full">Blog</a>
          <a className="cursor-pointer transition-all hover:text-white 
               relative before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 
               before:bg-gradient-to-r before:from-indigo-500 before:to-pink-500 
               before:transition-all before:duration-300 hover:before:w-full">Company</a>
        </div>

        {/* ✅ Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4">
 <button
      onClick={() => navigate("/LoginPage")}
      className="
        px-5 py-2 rounded-full font-medium
        text-gray-200 bg-[#4e4e7b]
        hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600
        hover:text-white transition-all duration-300 shadow-lg shadow-indigo-500/10
      "
    >
      Login
    </button>
  <button
      onClick={() => navigate("/signup")}
      className="
        px-5 py-2 rounded-full font-medium
        text-gray-200 bg-[#4e4e7b]
        hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600
        hover:text-white transition-all duration-300 shadow-lg shadow-indigo-500/10
      "
    >
      SignUp
    </button>

          <button className=" cursor-pointer bg-gradient-to-br from-indigo-500  to-purple-800 hover:bg-indigo-500 px-5 py-2 rounded-full text-white text-sm font-bold shadow-lg transition-all">
            Book a Call
          </button>
        </div>

        {/* ✅ Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden text-white hover:scale-110 transition"
        >
          {menuOpen ? (
            /* Close Icon */
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={2} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            /* Hamburger Icon */
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth={2} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>

      </div>

      {/* ✅ Mobile Menu Panel */}
      {menuOpen && (
        <div className="lg:hidden bg-[#16161a] border-t border-white/10 shadow-2xl px-6 py-6 space-y-4 text-gray-300 text-base ">

          <a onClick={handleNavigation} className="block hover:text-indigo-400">Home</a>

       

          {/* Services */}
          <details>
            <summary className="cursor-pointer hover:text-indigo-400">Services</summary>
            <div className="ml-4 mt-2 space-y-2 text-gray-400">
              <a className="block hover:text-indigo-400">Web development</a>
              <a className="block hover:text-indigo-400">Mobile App development</a>
              <a className="block hover:text-indigo-400">UI/UX</a>
              <a className="block hover:text-indigo-400">Customer support</a>
            </div>
          </details>

          <a className="block hover:text-indigo-400">Blog</a>
          <a className="block hover:text-indigo-400">Company</a>

          {/* Buttons */}
      
          <button className="block text-left w-full text-gray-300 hover:text-indigo-400">Login</button>
          <button className="w-full bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-full text-white text-sm shadow-lg">
            Book a Call
          </button>
        </div>
      )}
    </nav>
  );
}
