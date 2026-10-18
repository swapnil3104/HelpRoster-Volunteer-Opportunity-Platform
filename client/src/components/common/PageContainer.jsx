import React from 'react';

/**
 * Standard content wrapper ensuring consistent max-width and responsive horizontal padding.
 */
export default function PageContainer({
  children,
  size = 'xl',
  className = '',
  as: Component = 'div',
  ...props
}) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <Component
      className={`mx-auto px-4 sm:px-6 lg:px-8 w-full ${sizeClasses[size] || sizeClasses.xl} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
