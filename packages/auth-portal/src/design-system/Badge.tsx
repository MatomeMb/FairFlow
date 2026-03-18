import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  size?: BadgeSize;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  success: 'bg-ff-success-subtle text-ff-success-bold',
  warning: 'bg-ff-warning-subtle text-ff-warning-bold',
  danger: 'bg-ff-error-subtle text-ff-error-bold',
  info: 'bg-ff-info-subtle text-ff-info-bold',
  neutral: 'bg-ff-neutral-subtle text-ff-form-text',
  primary: 'bg-ff-primary/15 text-ff-primary',
};

const sizeMap: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function Badge({
  variant,
  children,
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium transition-colors ${variantMap[variant]} ${sizeMap[size]} ${className}`}
    >
      {children}
    </span>
  );
}
