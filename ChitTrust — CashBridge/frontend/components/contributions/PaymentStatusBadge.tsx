import React from 'react';
import { clsx } from 'clsx';

export function PaymentStatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    successful: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
    refunded: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const labels = {
    pending: 'Pending',
    processing: 'Verifying...',
    successful: 'Paid ✓',
    failed: 'Failed',
    refunded: 'Refunded',
  };

  const currentStyle = styles[status as keyof typeof styles] || styles.pending;
  const currentLabel = labels[status as keyof typeof labels] || status;

  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize', currentStyle)}>
      {currentLabel}
    </span>
  );
}
