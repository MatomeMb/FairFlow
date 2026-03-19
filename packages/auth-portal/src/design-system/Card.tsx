import React from 'react';

type CardVariant = 'default' | 'elevated' | 'bordered';

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
}

const variantMap: Record<CardVariant, string> = {
  default: 'bg-[#1A2D42] backdrop-blur rounded-xl border border-[var(--ff-border)]',
  elevated: 'bg-[#1A2D42] shadow-lg shadow-[var(--ff-ink)]/5 rounded-xl border border-[var(--ff-border)]',
  bordered: 'bg-[#1A2D42] rounded-xl border-2 border-[var(--ff-border)]',
};

export function Card({
  variant = 'default',
  children,
  className = '',
}: CardProps) {
  return (
    <div className={`${variantMap[variant]} ${className}`}>
      {children}
    </div>
  );
}
