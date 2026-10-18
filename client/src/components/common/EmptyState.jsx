import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * EmptyState component adhering to HelpRoster Design Specs:
 * "Explains missing content and next step."
 */
export default function EmptyState({
  icon: Icon = Sparkles,
  title = 'No items found',
  description = 'There is currently no data to display here.',
  action,
  className = ''
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400 mb-4">
        {React.isValidElement(Icon) ? Icon : <Icon className="w-7 h-7 text-slate-400" />}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
