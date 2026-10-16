import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccess } from '../context/AccessContext.jsx';
import { Globe, Shield, Smartphone, Monitor, Menu, X, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { decision } = useAccess();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Gateway' },
    { to: '/en', label: 'English' },
    { to: '/ur', label: 'اردو' },
    { to: '/ar', label: 'العربية' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="flex items-center gap-2.5 group transition-transform duration-200 hover:scale-[1.02]"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
                <Globe className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight flex items-center gap-1.5">
                  GeoAccess
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    Pro
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Intelligent Access Control & Localization
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="h-4 w-px bg-slate-200 mx-2" />

            <Link
              to="/admin"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                location.pathname.startsWith('/admin')
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/90 border border-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>Admin Portal</span>
            </Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/admin"
              className="p-2 rounded-lg text-slate-700 bg-slate-100 border border-slate-200 text-xs font-semibold flex items-center gap-1"
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              <span className="hidden xs:inline">Admin</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Current Detected Visitor Info Strip */}
        {decision && (
          <div className="py-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Live Session
              </span>
              <span className="font-semibold text-slate-800">
                {decision.country} {decision.city && decision.city !== 'Unknown' ? `(${decision.city})` : ''}
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-slate-600 capitalize">
                {decision.deviceType === 'mobile' ? (
                  <Smartphone className="w-3 h-3 text-indigo-600" />
                ) : (
                  <Monitor className="w-3 h-3 text-slate-500" />
                )}
                {decision.deviceType}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-400 text-[11px]">{decision.ip}</span>
            </div>

            <div>
              <span
                className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[11px] shadow-2xs ${
                  decision.allowed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                }`}
              >
                {decision.allowed ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Allowed ({decision.language?.toUpperCase()})
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3 h-3 text-rose-600" />
                    Access Restricted
                  </>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
