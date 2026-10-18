import React from 'react';

/**
 * LoadingSkeleton component for smooth placeholder loading states.
 */
export default function LoadingSkeleton({
  variant = 'text',
  width,
  height,
  className = ''
}) {
  const baseClasses = 'animate-pulse bg-slate-200/80 shrink-0';

  const variantStyles = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full w-10 h-10',
    rectangular: 'rounded-xl w-full h-32',
    button: 'rounded-xl h-10 w-28'
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${baseClasses} ${variantStyles[variant] || variantStyles.text} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Compound Skeleton for Cards
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs ${className}`}>
      <div className="flex items-center gap-3">
        <LoadingSkeleton variant="circular" width="40px" height="40px" />
        <div className="space-y-2 flex-1">
          <LoadingSkeleton variant="text" width="60%" height="16px" />
          <LoadingSkeleton variant="text" width="40%" height="12px" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <LoadingSkeleton variant="text" width="100%" height="14px" />
        <LoadingSkeleton variant="text" width="85%" height="14px" />
      </div>
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <LoadingSkeleton variant="text" width="30%" height="12px" />
        <LoadingSkeleton variant="button" width="80px" height="32px" />
      </div>
    </div>
  );
}
