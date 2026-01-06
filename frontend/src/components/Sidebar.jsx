import React from "react";
import { NavLink } from "react-router-dom";
import {
  Squares2X2Icon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UsersIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { GrIntegration } from "react-icons/gr";
import { SlSettings } from "react-icons/sl";

const Sidebar = () => {
  const items = [
    { name: "Dashboard", to: "/", icon: Squares2X2Icon },
    { name: "Invoices", to: "/invoices", icon: DocumentTextIcon },

    // ✅ Newly added Clients button
    { name: "Clients", to: "/clients", icon: UsersIcon },

    { name: "Finance", to: "/finance", icon: CurrencyDollarIcon },
    { name: "Reports", to: "/reports", icon: ChartBarIcon },
    { name: "Bank Account", to: "/bank-account", icon: BanknotesIcon },
    { name: "Integration", to:"/integration", icon: GrIntegration},
    { name: "Settings" , to:"/settings" , icon: SlSettings},
  ];

  return (
    <aside className="fixed left-4 top-25 bottom-4 w-64 bg-white rounded-2xl shadow-lg overflow-hidden z-30">
      <div className="h-full flex flex-col bg-gray-200">
        <div className="px-4 py-1">
          <div className="flex items-center gap-3">
            <div></div>
          </div>
        </div>

        <nav className="mt-6 px-2 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-all text-sm font-medium
                ${isActive ? "bg-gray-600 text-white shadow" : "text-gray-700 hover:bg-white/90"}`
              }
            >
              <it.icon className="w-5 h-5 flex-shrink-0" />
              <span>{it.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-4 py-6 text-xs text-gray-500">
          © 2025 Manocore Books
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
