import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Standard PageHeading for title, supporting description, optional breadcrumbs, and actions.
 */
export default function PageHeading({
  title,
  description,
  breadcrumbs,
  actions,
  className = ''
}) {
  return (
    <div className={`space-y-3 pb-6 border-b border-slate-200/80 mb-8 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                {isLast || !crumb.href ? (
                  <span className="font-medium text-slate-700">{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="hover:text-brand-600 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
