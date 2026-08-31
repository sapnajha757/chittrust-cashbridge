import React from 'react';
import { clsx } from 'clsx';
import { GroupStatus } from '@/types';

export function GroupStatusBadge({ status }: { status: GroupStatus | string }) {
  const styles = {
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    paused: 'bg-amber-100 text-amber-800 border-amber-200',
    closed: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const currentStyle = styles[status as keyof typeof styles] || styles.active;

  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider', currentStyle)}>
      {status}
    </span>
  );
}
