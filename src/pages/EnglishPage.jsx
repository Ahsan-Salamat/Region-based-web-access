import React from 'react';
import { useAccess } from '../context/AccessContext.jsx';
import { StatusBadge, DeviceBadge } from '../components/StatusBadge.jsx';
import { 
  Globe2, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Activity, 
  Shield, 
  Server, 
  ArrowRight,
  Database,
  Lock,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EnglishPage = () => {
  const { decision } = useAccess();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-indigo-900/50 mb-8 sm:mb-12">
        {/* Background glow decoration */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-200 border border-indigo-400/30">
              <Globe2 className="w-4 h-4 text-indigo-300" />
              <span>International Portal (English)</span>
            </div>
            {decision && <StatusBadge status={decision.allowed ? 'allowed' : 'blocked'} />}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white leading-tight">
            Region-Based Web <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
              Access Control Platform
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed mb-8">
            Advanced multi-tier access gate evaluating real-time geolocation, device classification, and localized language rendering backed by immutable Supabase PostgreSQL audit logging.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 hover:scale-[1.02]"
            >
              <Shield className="w-4 h-4" />
              <span>Open Security Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Active Security Policy: Enforced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visitor Session Verification Card */}
      {decision && (
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm mb-8 sm:mb-12">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span>Session Authorization & Identity Profile</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Verified by Server Layer
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80 hover:border-indigo-100 transition">
              <span className="text-xs font-medium text-slate-500 block mb-1">Detected Country</span>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="truncate">{decision.country}</span>
              </span>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80 hover:border-indigo-100 transition">
              <span className="text-xs font-medium text-slate-500 block mb-1">Detected City</span>
              <span className="text-sm font-bold text-slate-800 truncate block">
                {decision.city && decision.city !== 'Unknown' ? decision.city : 'N/A (Loopback)'}
              </span>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80 hover:border-indigo-100 transition">
              <span className="text-xs font-medium text-slate-500 block mb-1">Device Classification</span>
              <DeviceBadge deviceType={decision.deviceType} />
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80 hover:border-indigo-100 transition">
              <span className="text-xs font-medium text-slate-500 block mb-1">Assigned Language</span>
              <span className="inline-flex items-center gap-1 text-sm font-extrabold text-indigo-700 uppercase">
                <Globe2 className="w-4 h-4 text-indigo-500" />
                {decision.language || 'EN'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 border border-indigo-100">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Centralized Rule Matrix</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enforces regional constraints like mobile-only access for Pakistan, unconditional blocks for restricted territories, and regional Arabic routing.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-indigo-600">
            <Cpu className="w-3.5 h-3.5" /> Edge & Server Execution
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Supabase PostgreSQL Logs</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every inbound visit attempt is audited with client IP, detected country, city, User-Agent, decision status, and precise ISO timestamps.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <Lock className="w-3.5 h-3.5" /> Row-Level Security Protected
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-200 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 border border-purple-100">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Real-Time Admin Analytics</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Administrative dashboard featuring multi-parameter query filtering, pagination controls, and real-time KPI traffic summarization.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-purple-600">
            <Activity className="w-3.5 h-3.5" /> High-Performance Queries
          </div>
        </div>
      </div>
    </div>
  );
};
