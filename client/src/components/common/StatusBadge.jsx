import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  Archive, 
  FileText,
  User,
  Building2,
  Shield
} from 'lucide-react';

/**
 * Reusable StatusBadge adhering to the design principle:
 * "Never rely on color alone to communicate status. Pair colors with text and semantic icons."
 */
export default function StatusBadge({ status, label, size = 'sm', className = '' }) {
  const normalized = (status || '').toLowerCase().trim();

  const config = {
    // Opportunities
    published: {
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      defaultLabel: 'Published'
    },
    draft: {
      style: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: FileText,
      defaultLabel: 'Draft'
    },
    closed: {
      style: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
      defaultLabel: 'Closed'
    },
    archived: {
      style: 'bg-slate-200 text-slate-600 border-slate-300',
      icon: Archive,
      defaultLabel: 'Archived'
    },

    // Applications & Verifications
    pending: {
      style: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
      defaultLabel: 'Pending'
    },
    accepted: {
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      defaultLabel: 'Accepted'
    },
    approved: {
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      defaultLabel: 'Approved'
    },
    verified: {
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: ShieldCheck,
      defaultLabel: 'Verified'
    },
    rejected: {
      style: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      defaultLabel: 'Rejected'
    },
    withdrawn: {
      style: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: XCircle,
      defaultLabel: 'Withdrawn'
    },

    // User accounts
    active: {
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      defaultLabel: 'Active'
    },
    suspended: {
      style: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertCircle,
      defaultLabel: 'Suspended'
    },

    // Contact Submissions
    new: {
      style: 'bg-brand-50 text-brand-700 border-brand-200',
      icon: AlertCircle,
      defaultLabel: 'New'
    },
    in_progress: {
      style: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
      defaultLabel: 'In Progress'
    },
    resolved: {
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      defaultLabel: 'Resolved'
    },

    // Roles
    volunteer: {
      style: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: User,
      defaultLabel: 'Volunteer'
    },
    organization: {
      style: 'bg-teal-50 text-accent-600 border-teal-200',
      icon: Building2,
      defaultLabel: 'Organization'
    },
    admin: {
      style: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Shield,
      defaultLabel: 'Administrator'
    },

    // System Status
    healthy: {
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      defaultLabel: 'Operational'
    },
    disconnected: {
      style: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertCircle,
      defaultLabel: 'Disconnected'
    },
    error: {
      style: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertCircle,
      defaultLabel: 'Error'
    }
  };

  const current = config[normalized] || {
    style: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: null,
    defaultLabel: status || 'Unknown'
  };

  const IconComponent = current.icon;
  const displayLabel = label || current.defaultLabel;

  const sizeClasses = {
    xs: 'text-[11px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-2xs ${
        sizeClasses[size] || sizeClasses.sm
      } ${current.style} ${className}`}
    >
      {IconComponent ? (
        <IconComponent className="w-3 h-3 shrink-0" aria-hidden="true" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden="true"></span>
      )}
      <span>{displayLabel}</span>
    </span>
  );
}
