import React from 'react';
import { CheckCircle2, Clock, CircleDot, Circle } from 'lucide-react';

interface AuctionTimelineProps {
  status: string;
  payoutStatus?: string;
}

export function AuctionTimeline({ status, payoutStatus }: AuctionTimelineProps) {
  const steps = [
    { label: 'Contributions Collected', done: true },
    { label: 'Auction Opened', done: status === 'open' || status === 'closed' },
    { label: 'Bidding Completed', done: status === 'closed' },
    { label: 'Winner Selected', done: status === 'closed' },
    { label: 'Payout Processing', done: payoutStatus === 'paid', active: status === 'closed' && payoutStatus !== 'paid' },
    { label: 'Month Completed', done: payoutStatus === 'paid' },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Monthly Cycle Timeline</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-xl border flex flex-col items-center text-center space-y-1 ${
              step.done
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : step.active
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold ring-2 ring-amber-400/30 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            {step.done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : step.active ? (
              <CircleDot className="w-4 h-4 text-amber-600" />
            ) : (
              <Circle className="w-4 h-4 text-slate-300" />
            )}
            <span className="text-[11px] font-semibold leading-tight">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
