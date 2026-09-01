import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={twMerge(clsx("bg-white rounded-xl border border-gray-200 shadow-sm p-5", className))}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge(clsx("mb-4 border-b border-gray-100 pb-3", className))}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={twMerge(clsx("text-lg font-bold text-gray-900", className))}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge(clsx("text-sm text-gray-600", className))}>{children}</div>;
}
