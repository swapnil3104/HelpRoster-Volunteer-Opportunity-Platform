import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

/**
 * Reusable SelectField dropdown component.
 */
export default function SelectField({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const inputId = id || name;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 tracking-wide"
        >
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-sm">
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-desc` : undefined}
          className={`w-full block appearance-none text-sm rounded-xl pl-3.5 pr-10 py-2.5 transition-all duration-200 border bg-white ${
            error
              ? 'border-red-400 text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500'
          } disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

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
