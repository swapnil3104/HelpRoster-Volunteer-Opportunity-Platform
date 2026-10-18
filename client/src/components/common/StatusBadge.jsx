import React from 'react';

export default function StatusBadge({ status, label, className = '' }) {
  const normalized = (status || '').toLowerCase();

  const styles = {
    // Opportunity statuses
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    closed: 'bg-amber-50 text-amber-700 border-amber-200',
    archived: 'bg-slate-200 text-slate-600 border-slate-300',
    
    // Application & Verification statuses
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    withdrawn: 'bg-slate-100 text-slate-600 border-slate-200',

    // System status
    healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    disconnected: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const currentStyle = styles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';
  const displayLabel = label || status || 'Unknown';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle} ${className}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {displayLabel}
    </span>
  );
}
