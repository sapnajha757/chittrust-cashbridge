import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { QrCode, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface GroupAnalyticsCardProps {
  groupName: string;
  totalMembers: number;
  monthlyPool: number;
  collectedAmount: number;
  collectionRate: number;
  onTimeRate: number;
  cashAmount: number;
  digitalAmount: number;
  averageTrustScore: number;
}

export function GroupAnalyticsCard({
  groupName,
  totalMembers,
  monthlyPool,
  collectedAmount,
  collectionRate,
  onTimeRate,
  cashAmount,
  digitalAmount,
  averageTrustScore,
}: GroupAnalyticsCardProps) {
  const cashPct = Math.round((cashAmount / (cashAmount + digitalAmount || 1)) * 100);
  const upiPct = 100 - cashPct;

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">{groupName}</CardTitle>
          <p className="text-xs text-slate-500">{totalMembers} Members • Pool: ₹{monthlyPool.toLocaleString('en-IN')}</p>
        </div>
        <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">
          {collectionRate}% Collected
        </span>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
            <span className="text-slate-500 font-medium">Collected Amount</span>
            <p className="text-lg font-extrabold text-slate-900">₹{collectedAmount.toLocaleString('en-IN')}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
            <span className="text-slate-500 font-medium">On-Time Payment Rate</span>
            <p className="text-lg font-extrabold text-emerald-700">{onTimeRate}%</p>
          </div>
        </div>

        {/* Cash vs Digital Breakdown */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-semibold text-[11px] text-slate-700">
            <span className="flex items-center gap-1 text-blue-700">
              <QrCode className="w-3.5 h-3.5" /> UPI Digital ({upiPct}%)
            </span>
            <span className="flex items-center gap-1 text-amber-800">
              <Banknote className="w-3.5 h-3.5" /> Doorstep Cash ({cashPct}%)
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div className="bg-blue-600 h-full" style={{ width: `${upiPct}%` }} />
            <div className="bg-amber-500 h-full" style={{ width: `${cashPct}%` }} />
          </div>
          <p className="text-[10px] text-slate-400">Cash & Digital contributions receive identical credit status.</p>
        </div>
      </CardContent>
    </Card>
  );
}
