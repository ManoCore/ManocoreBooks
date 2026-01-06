import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

/**
 * Layout wraps content so every page gets the left fixed sidebar
 * and the top header (green banner). Content area is positioned
 * to the right of the fixed sidebar (matching screenshot spacing).
 */
const Layout = ({ children }) => {
  // NOTE: the sidebar is fixed and designed at left:4 top:4 bottom:4 width:64
  // so we apply a left margin to the main container to avoid overlap.
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[18rem] pt-6 pr-6 pb-6"> {/* 18rem ~ 288px; keeps spacing from left fixed sidebar */}
        <div className="max-w-[1200px] mx-auto">
          <Header />
          <main className="mt-6">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
