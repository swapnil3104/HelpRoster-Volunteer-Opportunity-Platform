import React from 'react';
import { 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  X 
} from 'lucide-react';

/**
 * Reusable Alert component for inline warnings, errors, and success feedback.
 */
export default function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className = ''
}) {
  const config = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: Info,
      iconColor: 'text-blue-600',
      closeBtn: 'text-blue-500 hover:text-blue-700'
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      closeBtn: 'text-emerald-500 hover:text-emerald-700'
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      closeBtn: 'text-amber-500 hover:text-amber-700'
    },
    danger: {
      container: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: AlertCircle,
      iconColor: 'text-rose-600',
      closeBtn: 'text-rose-500 hover:text-rose-700'
    },
    error: {
      container: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: AlertCircle,
      iconColor: 'text-rose-600',
      closeBtn: 'text-rose-500 hover:text-rose-700'
    }
  };

  const current = config[variant] || config.info;
  const IconComponent = current.icon;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm transition-all duration-200 ${current.container} ${className}`}
    >
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
      <div className="flex-1 space-y-1">
        {title && <h4 className="font-semibold tracking-tight">{title}</h4>}
        <div className="text-xs sm:text-sm leading-relaxed opacity-95">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className={`p-1 rounded-lg transition-colors focus-ring ${current.closeBtn}`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
