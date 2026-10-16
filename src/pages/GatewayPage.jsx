import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccess } from '../context/AccessContext.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { ShieldAlert, RefreshCw, Globe, Shield, Sparkles } from 'lucide-react';

export const GatewayPage = () => {
  const { runAccessCheck, loading, error, decision } = useAccess();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const evaluate = async () => {
      const result = await runAccessCheck();
      if (isMounted && result) {
        const target = result.targetPage || (result.allowed ? `/${result.language}` : '/blocked');
        navigate(target, { replace: true });
      }
    };
    evaluate();
    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-rose-200 text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Check Failed</h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => runAccessCheck()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-xs font-bold shadow-md shadow-indigo-600/25"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full p-8 sm:p-10 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/80 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-50 animate-pulse-glow">
          <Globe className="w-8 h-8 animate-spin-slow" />
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Evaluating Geolocation & Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed mb-6">
          Determining visitor origin, classifying device capabilities, and preparing localized access...
        </p>

        {decision ? (
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 animate-in fade-in">
            <p className="text-xs font-semibold text-indigo-950">
              Redirecting to {decision.targetPage}...
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
            <span>Establishing secure session</span>
          </div>
        )}
      </div>
    </div>
  );
};
