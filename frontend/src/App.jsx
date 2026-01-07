import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import ClientsPage from "./pages/Clients";
import BankAccountPage from "./pages/BankAccount";
import IntegrationsPage from "./pages/Integration";
import Settings from "./pages/Settings"
import SignupPage from "./pages/SignupPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import {Toaster} from "react-hot-toast";

const App = () => (
  <>
  <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "10px",
          background: "#1f2937",
          color: "#fff",
        },
      }}
    />
   <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />

    {/* PROTECTED */}
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/finance" element={<Finance />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/bank-account" element={<BankAccountPage />} />
      <Route path="/integration" element={<IntegrationsPage />} />
      <Route path="/settings" element={<Settings />} />
    </Route>
  </Routes>
  </>
);

export default App;

