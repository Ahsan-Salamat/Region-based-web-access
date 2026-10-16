import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccess } from '../context/AccessContext.jsx';
import { ShieldCheck, Play, RefreshCw, Smartphone, Monitor, ChevronDown, ChevronUp } from 'lucide-react';

const PRESET_SCENARIOS = [
  { label: '🇵🇰 Pakistan (Mobile)', country: 'Pakistan', city: 'Lahore', deviceType: 'mobile', ip: '182.180.160.1', expected: 'Allowed → Urdu' },
  { label: '🇵🇰 Pakistan (Desktop)', country: 'Pakistan', city: 'Karachi', deviceType: 'desktop', ip: '182.180.160.2', expected: 'Blocked' },
  { label: '🇸🇦 Saudi Arabia (Mobile)', country: 'Saudi Arabia', city: 'Riyadh', deviceType: 'mobile', ip: '212.118.140.1', expected: 'Allowed → Arabic' },
  { label: '🇸🇦 Saudi Arabia (Desktop)', country: 'Saudi Arabia', city: 'Jeddah', deviceType: 'desktop', ip: '212.118.140.2', expected: 'Allowed → Arabic' },
  { label: '🇦🇪 UAE (Mobile)', country: 'United Arab Emirates', city: 'Dubai', deviceType: 'mobile', ip: '94.200.1.1', expected: 'Allowed → Arabic' },
  { label: '🇦🇪 UAE (Desktop)', country: 'United Arab Emirates', city: 'Abu Dhabi', deviceType: 'desktop', ip: '94.200.1.2', expected: 'Allowed → Arabic' },
  { label: '🇦🇺 Australia (Mobile)', country: 'Australia', city: 'Sydney', deviceType: 'mobile', ip: '139.130.4.5', expected: 'Blocked' },
  { label: '🇦🇺 Australia (Desktop)', country: 'Australia', city: 'Melbourne', deviceType: 'desktop', ip: '139.130.4.6', expected: 'Blocked' },
  { label: '🇨🇦 Canada (Mobile)', country: 'Canada', city: 'Toronto', deviceType: 'mobile', ip: '142.250.70.1', expected: 'Blocked' },
  { label: '🇨🇦 Canada (Desktop)', country: 'Canada', city: 'Vancouver', deviceType: 'desktop', ip: '142.250.70.2', expected: 'Blocked' },
  { label: '🇬🇧 UK (Mobile)', country: 'United Kingdom', city: 'London', deviceType: 'mobile', ip: '212.58.244.70', expected: 'Allowed → English' },
  { label: '🇬🇧 UK (Desktop)', country: 'United Kingdom', city: 'Manchester', deviceType: 'desktop', ip: '212.58.244.71', expected: 'Allowed → English' },
  { label: '🇺🇸 USA (Desktop)', country: 'United States', city: 'New York', deviceType: 'desktop', ip: '8.8.8.8', expected: 'Allowed → English' },
  { label: '🇫🇷 France (Mobile)', country: 'France', city: 'Paris', deviceType: 'mobile', ip: '193.252.122.1', expected: 'Allowed → English' },
];

export const DevSimulationBar = () => {
  // Strictly only show in Vite's own dev server (DEV=true). Never appears in
  // `vite preview` or any production build where import.meta.env.DEV === false.
  const isDev = import.meta.env.DEV;
  const { simulation, setSimulation, resetSimulation, runAccessCheck, loading } = useAccess();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  if (!isDev) return null;

  const handleSelectPreset = async (preset) => {
    const newSim = {
      enabled: true,
      country: preset.country,
      city: preset.city,
      deviceType: preset.deviceType,
      ip: preset.ip,
    };
    setSimulation(newSim);
  };

  const handleApplyAndEvaluate = async (preset) => {
    const newSim = preset ? {
      enabled: true,
      country: preset.country,
      city: preset.city,
      deviceType: preset.deviceType,
      ip: preset.ip,
    } : { ...simulation, enabled: true };

    setSimulation(newSim);
    const decision = await runAccessCheck();
    if (decision) {
      navigate(decision.targetPage || (decision.allowed ? `/${decision.language}` : '/blocked'));
    }
  };

  const handleReset = async () => {
    resetSimulation();
    const decision = await runAccessCheck();
    if (decision) {
      navigate(decision.targetPage || (decision.allowed ? `/${decision.language}` : '/blocked'));
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] font-semibold uppercase tracking-wider border border-amber-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Dev Test Simulator
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Status: {simulation.enabled ? (
              <span className="text-emerald-400 font-medium">
                Simulating {simulation.country} ({simulation.deviceType})
              </span>
            ) : (
              <span className="text-sky-400 font-medium">Live Detection (Real IP)</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 border border-slate-700 transition"
          >
            {isOpen ? 'Collapse Test Matrix' : 'Expand Test Matrix'}
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {simulation.enabled && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-rose-300 hover:bg-rose-950/40 border border-rose-800/40 transition"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Reset to Real IP
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="max-w-7xl mx-auto px-4 pb-3 pt-1 border-t border-slate-800/80">
          <div className="text-[11px] text-slate-400 mb-2 font-medium">
            Click any test scenario to test access control rules and verify routing + database logging:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1.5">
            {PRESET_SCENARIOS.map((preset, idx) => {
              const isSelected = simulation.enabled && simulation.country === preset.country && simulation.deviceType === preset.deviceType;
              return (
                <button
                  key={idx}
                  onClick={() => handleApplyAndEvaluate(preset)}
                  disabled={loading}
                  title={`${preset.country} (${preset.deviceType}) → Expected: ${preset.expected}`}
                  className={`p-2 rounded text-left transition flex flex-col justify-between border ${
                    isSelected
                      ? 'bg-indigo-900/60 border-indigo-500 text-white ring-1 ring-indigo-400'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="font-medium truncate">{preset.label}</div>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="flex items-center gap-0.5 text-slate-400">
                      {preset.deviceType === 'mobile' ? <Smartphone className="w-2.5 h-2.5" /> : <Monitor className="w-2.5 h-2.5" />}
                      {preset.deviceType}
                    </span>
                    <span className={`font-semibold ${preset.expected.startsWith('Allowed') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {preset.expected}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
