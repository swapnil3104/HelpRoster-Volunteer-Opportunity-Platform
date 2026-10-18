import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable TextArea component with character count and validation state.
 */
export default function TextArea({
  id,
  name,
  label,
  value = '',
  onChange,
  placeholder,
  error,
  helperText,
  rows = 4,
  maxLength,
  showCount = false,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const inputId = id || name;
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 tracking-wide"
          >
            {label} {required && <span className="text-red-500 font-bold">*</span>}
          </label>
        )}
        {showCount && maxLength && (
          <span className="text-[11px] text-slate-400 font-mono">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        id={inputId}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-desc` : undefined}
        className={`w-full block text-sm rounded-xl px-3.5 py-2.5 transition-all duration-200 border bg-white ${
          error
            ? 'border-red-400 text-red-900 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
            : 'border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500'
        } disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
        {...props}
      />

      {error ? (
        <p
          id={`${inputId}-error`}
          className="text-xs text-red-600 flex items-center gap-1 font-medium mt-1"
          role="alert"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={`${inputId}-desc`} className="text-xs text-slate-500 mt-1">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
