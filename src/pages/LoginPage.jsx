import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
import { Shield, Lock, Mail, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      if (isConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/admin');
        }
      } else {
        const devAuth = sessionStorage.getItem('dev_admin_auth');
        if (devAuth === 'true') {
          navigate('/admin');
        }
      }
    };
    checkSession();
  }, [isConfigured, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isConfigured) {
        const { data, error: authErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authErr) throw authErr;
        if (data?.session) {
          navigate('/admin');
        }
      } else {
        if (email.trim() && password.trim()) {
          sessionStorage.setItem('dev_admin_auth', 'true');
          sessionStorage.setItem('dev_admin_email', email);
          navigate('/admin');
        } else {
          throw new Error('Please provide an email and password.');
        }
      }
    } catch (err) {
      setError(err?.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleDevQuickLogin = () => {
    setEmail('admin@university.edu');
    setPassword('AdminPassword123!');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/25 ring-4 ring-indigo-50">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Administrator Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Sign in to manage security rules, inspect access history, and view traffic metrics.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01]"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick autofill helper */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDevQuickLogin}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200/80 transition flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
              <span>Autofill Default Credentials (`admin@university.edu`)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
