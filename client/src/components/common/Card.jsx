import React from 'react';

/**
 * Reusable Card component and subcomponents adhering to HelpRoster Design Tokens.
 */
export function Card({
  children,
  className = '',
  interactive = false,
  onClick,
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-200 ${
        interactive
          ? 'hover:shadow-md hover:border-brand-200 hover:-translate-y-0.5 cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-5 sm:p-6 pb-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', as: Component = 'h3', ...props }) {
  return (
    <Component className={`text-lg font-bold text-slate-900 tracking-tight ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`p-5 sm:p-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
