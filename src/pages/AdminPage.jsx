import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
import { StatusBadge, DeviceBadge } from '../components/StatusBadge.jsx';
import {
  Shield,
  LogOut,
  RefreshCw,
  Filter,
  Users,
  CheckCircle2,
  XCircle,
  Smartphone,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Database,
  AlertCircle,
  Clock,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';

export const AdminPage = () => {
  const navigate = useNavigate();
  const isConfigured = isSupabaseConfigured();

  // Authentication State
  const [userEmail, setUserEmail] = useState('');
  const [authChecking, setAuthChecking] = useState(true);

  // Data & Query States
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Summary Metrics
  const [stats, setStats] = useState({
    totalVisits: 0,
    allowed: 0,
    blocked: 0,
    mobile: 0,
    desktop: 0,
  });

  // Filter States
  const [filters, setFilters] = useState({
    country: '',
    deviceType: '',
    accessStatus: '',
    startDate: '',
    endDate: '',
  });

  // Pagination States
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Check auth on mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (isConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/admin/login');
          return;
        }
        setUserEmail(session.user.email || 'Admin');
      } else {
        const devAuth = sessionStorage.getItem('dev_admin_auth');
        if (devAuth !== 'true') {
          navigate('/admin/login');
          return;
        }
        setUserEmail(sessionStorage.getItem('dev_admin_email') || 'Dev Admin');
      }
      setAuthChecking(false);
    };
    verifyAuth();
  }, [isConfigured, navigate]);

  // Fetch Summary Stats
  const fetchStats = useCallback(async () => {
    try {
      if (isConfigured) {
        const [totalRes, allowedRes, blockedRes, mobileRes, desktopRes] = await Promise.all([
          supabase.from('access_logs').select('*', { count: 'exact', head: true }),
          supabase.from('access_logs').select('*', { count: 'exact', head: true }).eq('access_status', 'allowed'),
          supabase.from('access_logs').select('*', { count: 'exact', head: true }).eq('access_status', 'blocked'),
          supabase.from('access_logs').select('*', { count: 'exact', head: true }).eq('device_type', 'mobile'),
          supabase.from('access_logs').select('*', { count: 'exact', head: true }).eq('device_type', 'desktop'),
        ]);

        setStats({
          totalVisits: totalRes.count   ?? 0,
          allowed:     allowedRes.count  ?? 0,
          blocked:     blockedRes.count  ?? 0,
          mobile:      mobileRes.count   ?? 0,
          desktop:     desktopRes.count  ?? 0,
        });
      } else {
        const res = await fetch('/api/dev-logs');
        if (res.ok) {
          const { logs: devLogs } = await res.json();
          const total   = devLogs.length;
          const allowed  = devLogs.filter((r) => r.access_status === 'allowed').length;
          const blocked  = devLogs.filter((r) => r.access_status === 'blocked').length;
          const mobile   = devLogs.filter((r) => r.device_type === 'mobile').length;
          const desktop  = devLogs.filter((r) => r.device_type === 'desktop').length;
          setStats({ totalVisits: total, allowed, blocked, mobile, desktop });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch statistics:', err);
    }
  }, [isConfigured]);

  // Fetch Filtered & Paginated Logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isConfigured) {
        let query = supabase
          .from('access_logs')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (filters.country) {
          query = query.eq('country', filters.country);
        }
        if (filters.deviceType) {
          query = query.eq('device_type', filters.deviceType);
        }
        if (filters.accessStatus) {
          query = query.eq('access_status', filters.accessStatus);
        }
        if (filters.startDate) {
          query = query.gte('created_at', new Date(filters.startDate).toISOString());
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          query = query.lte('created_at', end.toISOString());
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, count, error: queryErr } = await query;
        if (queryErr) throw queryErr;

        setLogs(data || []);
        setTotalCount(count || 0);
      } else {
        const res = await fetch('/api/dev-logs');
        if (!res.ok) throw new Error('Failed to fetch dev logs');
        const { logs: devLogs } = await res.json();

        let filtered = devLogs;
        if (filters.country) {
          filtered = filtered.filter((r) => r.country.toLowerCase() === filters.country.toLowerCase());
        }
        if (filters.deviceType) {
          filtered = filtered.filter((r) => r.device_type === filters.deviceType);
        }
        if (filters.accessStatus) {
          filtered = filtered.filter((r) => r.access_status === filters.accessStatus);
        }
        if (filters.startDate) {
          const start = new Date(filters.startDate).getTime();
          filtered = filtered.filter((r) => new Date(r.created_at).getTime() >= start);
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          filtered = filtered.filter((r) => new Date(r.created_at).getTime() <= end.getTime());
        }

        setTotalCount(filtered.length);
        const from = (page - 1) * pageSize;
        setLogs(filtered.slice(from, from + pageSize));
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
      setError(err?.message || 'Failed to query access logs.');
    } finally {
      setLoading(false);
    }
  }, [isConfigured, filters, page, pageSize]);

  useEffect(() => {
    if (!authChecking) {
      fetchStats();
      fetchLogs();
    }
  }, [authChecking, fetchStats, fetchLogs]);

  const handleSignOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    } else {
      sessionStorage.removeItem('dev_admin_auth');
      sessionStorage.removeItem('dev_admin_email');
    }
    navigate('/admin/login');
  };

  const handleResetFilters = () => {
    setFilters({
      country: '',
      deviceType: '',
      accessStatus: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  if (authChecking) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
        <span className="text-xs font-semibold uppercase tracking-wider">Verifying Administrator Session...</span>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-600/25">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Access Control Security Dashboard
            </h1>
            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">
              <span>Admin: <strong className="text-slate-800 font-semibold">{userEmail}</strong></span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <Database className="w-3 h-3" />
                {isConfigured ? 'Supabase Live' : 'Local Dev Mode'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              fetchStats();
              fetchLogs();
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl text-xs font-bold text-rose-700 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 my-6 sm:my-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Visits</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalVisits}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Allowed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{stats.allowed}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-300 transition">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Blocked</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">{stats.blocked}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Mobile</span>
            <Smartphone className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-700">{stats.mobile}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Desktop</span>
            <Monitor className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-900">{stats.desktop}</div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Multi-Criteria Query Filter</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Country</label>
            <select
              value={filters.country}
              onChange={(e) => {
                setFilters({ ...filters, country: e.target.value });
                setPage(1);
              }}
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Countries</option>
              <option value="Pakistan">Pakistan</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="Australia">Australia</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="France">France</option>
              <option value="Germany">Germany</option>
              <option value="Japan">Japan</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Device Type</label>
            <select
              value={filters.deviceType}
              onChange={(e) => {
                setFilters({ ...filters, deviceType: e.target.value });
                setPage(1);
              }}
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Devices</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Access Status</label>
            <select
              value={filters.accessStatus}
              onChange={(e) => {
                setFilters({ ...filters, accessStatus: e.target.value });
                setPage(1);
              }}
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="allowed">Allowed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">From Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setFilters({ ...filters, startDate: e.target.value });
                setPage(1);
              }}
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">To Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setFilters({ ...filters, endDate: e.target.value });
                setPage(1);
              }}
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition border border-slate-300"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error message banner */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Query Error</div>
            <div className="mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Logs Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Audit Trail History
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {totalCount} total logged visit attempts
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border border-slate-300 rounded-lg px-2.5 py-1 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/60">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                <th className="py-3.5 px-4 sm:px-6">IP Address</th>
                <th className="py-3.5 px-4 sm:px-6">Origin Location</th>
                <th className="py-3.5 px-4 sm:px-6">Device</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6">Target Route</th>
                <th className="py-3.5 px-4 sm:px-6">Reason / Policy Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>Loading logs from PostgreSQL database...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>No access logs match your filter criteria.</span>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const dateStr = new Date(log.created_at).toLocaleString();
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/90 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-[11px] font-bold text-slate-800">
                        {log.ip_address}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          {log.country}
                        </span>
                        {log.city && log.city !== 'Unknown' && (
                          <span className="text-slate-400 text-[10px] block font-medium">{log.city}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <DeviceBadge deviceType={log.device_type} />
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <StatusBadge status={log.access_status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <span className="font-mono font-bold text-slate-700">{log.page}</span>
                        {log.language && (
                          <span className="text-[10px] uppercase font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md ml-1.5 border border-indigo-100">
                            {log.language}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-[11px] text-slate-600 max-w-xs truncate" title={log.block_reason || log.user_agent || ''}>
                        {log.block_reason || <span className="text-emerald-600 font-medium">✓ Authorized</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 sm:p-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <strong className="text-slate-900">{logs.length > 0 ? (page - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong className="text-slate-900">{Math.min(page * pageSize, totalCount)}</strong> of{' '}
            <strong className="text-slate-900">{totalCount}</strong> logs
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold transition shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="px-3 py-1.5 text-slate-700 font-bold bg-slate-100 rounded-xl">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold transition shadow-2xs"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
