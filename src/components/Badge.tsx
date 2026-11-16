import type { ReactNode } from 'react';

const variants = {
  primary: 'bg-primary-100 text-primary-800',
  accent: 'bg-accent-100 text-accent-700',
  default: 'bg-gray-100 text-gray-700',
} as const;

export default function Badge({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
