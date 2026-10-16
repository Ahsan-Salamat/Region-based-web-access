import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Evaluating regional access rules...' }) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
      <p className="text-xs text-slate-400 mt-1">Verifying IP geolocation and device compatibility</p>
    </div>
  );
};
