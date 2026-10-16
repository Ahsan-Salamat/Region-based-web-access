import React from 'react';
import { useAccess } from '../context/AccessContext.jsx';
import { 
  ShieldX, 
  AlertTriangle, 
  MapPin, 
  Smartphone, 
  Monitor, 
  Lock, 
  RefreshCw, 
  ArrowLeft,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const BlockedPage = () => {
  const { decision, runAccessCheck, loading } = useAccess();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="bg-white border border-rose-200/80 rounded-3xl shadow-xl overflow-hidden backdrop-blur-md">
        {/* Top Danger Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-700 via-rose-600 to-red-800 px-6 sm:px-10 py-10 text-white text-center">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          
          <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
            <ShieldX className="w-9 h-9 text-white" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-950/40 text-rose-100 border border-rose-400/30 mb-2">
            HTTP 403 &bull; Security Constraint Enforced
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Access Restricted
          </h1>
          <p className="text-rose-100 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Your connection does not meet the regional or device security requirements for this portal.
          </p>
        </div>

        {/* Reason Details */}
        <div className="p-6 sm:p-10">
          <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-5 mb-8">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-rose-950 mb-1">Restriction Reason:</h2>
                <p className="text-sm text-rose-900 leading-relaxed font-medium">
                  {decision?.reason || 'Access from your country or device type is restricted under university access-control policy.'}
                </p>
              </div>
            </div>
          </div>

          {/* Detected Connection Metadata */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            Detected Inbound Attributes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8">
            <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-500 block mb-1">Origin Country</span>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="truncate">{decision?.country || 'Unknown'}</span>
              </span>
            </div>

            <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-500 block mb-1">Device Classification</span>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                {decision?.deviceType === 'mobile' ? (
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Monitor className="w-4 h-4 text-slate-600" />
                )}
                {decision?.deviceType ? decision.deviceType.toUpperCase() : 'DESKTOP'}
              </span>
            </div>

            <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-500 block mb-1">Visitor IP Address</span>
              <span className="text-xs font-mono font-bold text-slate-700 truncate block">
                {decision?.ip || '127.0.0.1'}
              </span>
            </div>
          </div>

          {/* Audit Notification Banner */}
          <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-8">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              This access attempt has been logged in the Supabase PostgreSQL audit database for security and compliance purposes.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => runAccessCheck()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Re-evaluate Connection
            </button>

            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
            >
              <span>Administrator Portal Login</span>
              <ArrowLeft className="w-3.5 h-3.5 rtl:hidden" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
