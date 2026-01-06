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



const App = () => (
  <Routes>
    <Route path="/" element={<LandingPage/>} />
    {/* <Route path="/dashboard" element={<Dashboard />} /> */}
    <Route path="/invoices" element={<Invoices />} />
    <Route path="/finance" element={<Finance />} />
    <Route path="/reports" element={<Reports />} />
    <Route path="/LoginPage" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/Clients" element= {<ClientsPage />} />
    <Route path="/bank-account" element={<BankAccountPage />} />
    <Route path="/Integration" element={<IntegrationsPage/>} />
    <Route path="/Settings" element={<Settings/>} />
    

  </Routes>
);

export default App;

