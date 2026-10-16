import React, { createContext, useContext, useState } from 'react';
import { checkAccess } from '../services/accessApi.js';

const defaultSimulation = {
  enabled: false,
  country: 'Pakistan',
  city: 'Lahore',
  deviceType: 'mobile',
  ip: '182.180.160.1',
};

const AccessContext = createContext(null);

export const AccessProvider = ({ children }) => {
  const [decision, setDecision] = useState(() => {
    const saved = sessionStorage.getItem('last_access_decision');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [simulation, setSimulationState] = useState(() => {
    const saved = localStorage.getItem('dev_access_simulation');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultSimulation;
      }
    }
    return defaultSimulation;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setSimulation = (sim) => {
    setSimulationState(sim);
    localStorage.setItem('dev_access_simulation', JSON.stringify(sim));
  };

  const resetSimulation = () => {
    const reset = { ...defaultSimulation, enabled: false };
    setSimulationState(reset);
    localStorage.setItem('dev_access_simulation', JSON.stringify(reset));
  };

  const runAccessCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await checkAccess(simulation);
      setDecision(res);
      sessionStorage.setItem('last_access_decision', JSON.stringify(res));
      setLoading(false);
      return res;
    } catch (err) {
      console.error('Access check failed:', err);
      setError(err?.message || 'Access check failed');
      setLoading(false);
      return null;
    }
  };

  return (
    <AccessContext.Provider
      value={{
        decision,
        loading,
        error,
        simulation,
        setSimulation,
        runAccessCheck,
        resetSimulation,
      }}
    >
      {children}
    </AccessContext.Provider>
  );
};

export const useAccess = () => {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error('useAccess must be used within an AccessProvider');
  }
  return context;
};
