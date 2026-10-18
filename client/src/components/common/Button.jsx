import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button component adhering to HelpRoster Design Tokens.
 * Supports primary, secondary, accent, outline, ghost, and danger variants.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  ariaLabel,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2 text-sm gap-2 rounded-xl',
    lg: 'px-6 py-2.5 text-base gap-2.5 rounded-xl font-semibold'
  };

  const variantStyles = {
    primary:
      'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-brand-500/25 active:bg-brand-800',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm active:bg-slate-100',
    accent:
      'bg-accent-500 hover:bg-accent-600 text-white shadow-sm hover:shadow-accent-500/25 active:bg-accent-600',
    outline:
      'border-2 border-brand-600 text-brand-600 hover:bg-brand-50 active:bg-brand-100',
    ghost:
      'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-red-500/25 active:bg-red-800'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
