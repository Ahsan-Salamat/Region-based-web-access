import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AccessProvider } from './context/AccessContext.jsx';
import { DevSimulationBar } from './components/DevSimulationBar.jsx';
import { Navbar } from './components/Navbar.jsx';

import { GatewayPage } from './pages/GatewayPage.jsx';
import { EnglishPage } from './pages/EnglishPage.jsx';
import { UrduPage } from './pages/UrduPage.jsx';
import { ArabicPage } from './pages/ArabicPage.jsx';
import { BlockedPage } from './pages/BlockedPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';

export default function App() {
  return (
    <AccessProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-mesh-pattern flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
          {/* Development Test Matrix Banner */}
          <DevSimulationBar />

          {/* Responsive Navigation Header */}
          <Navbar />

          {/* Main Application Body */}
          <main className="flex-1">
            <Routes>
              {/* Root Access Gateway Entrypoint */}
              <Route path="/" element={<GatewayPage />} />

              {/* Localized Portals */}
              <Route path="/en" element={<EnglishPage />} />
              <Route path="/ur" element={<UrduPage />} />
              <Route path="/ar" element={<ArabicPage />} />

              {/* Security Blocked Page */}
              <Route path="/blocked" element={<BlockedPage />} />

              {/* Administrator Authentication & Logs Management */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminPage />} />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Polished Modern Footer */}
          <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/80 py-8 text-center text-xs text-slate-500 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left sm:text-left text-center">
                <p className="font-bold text-slate-800">
                  Region-Based Web Access Control System
                </p>
                <p className="mt-0.5 text-slate-400 text-[11px]">
                  University Web Engineering Project &bull; Architectural Access Management
                </p>
              </div>
              <div className="text-right sm:text-right text-center text-[11px] text-slate-400">
                <span>Automated Geolocation &bull; Device Classification &bull; Supabase PostgreSQL Logging</span>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AccessProvider>
  );
}
