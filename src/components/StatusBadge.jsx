import React from 'react';
import { CheckCircle2, XCircle, Smartphone, Monitor } from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const isAllowed = status?.toLowerCase() === 'allowed';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses} ${
        isAllowed
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-rose-50 text-rose-700 border border-rose-200'
      }`}
    >
      {isAllowed ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
      )}
      {status ? status.toUpperCase() : 'UNKNOWN'}
    </span>
  );
};

export const DeviceBadge = ({ deviceType }) => {
  const isMobile = deviceType?.toLowerCase() === 'mobile';
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {isMobile ? (
        <Smartphone className="w-3 h-3 text-slate-500" />
      ) : (
        <Monitor className="w-3 h-3 text-slate-500" />
      )}
      {isMobile ? 'Mobile' : 'Desktop'}
    </span>
  );
};
