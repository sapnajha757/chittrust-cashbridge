import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';

interface CashSuccessScreenProps {
  memberName: string;
  groupName: string;
  amount: number;
  monthNumber: number;
  agentName: string;
  onReset: () => void;
}

export function CashSuccessScreen({
  memberName,
  groupName,
  amount,
  monthNumber,
  agentName,
  onReset,
}: CashSuccessScreenProps) {
  return (
    <Card className="shadow-xl border-emerald-200 bg-white text-center py-8 px-4 space-y-6">
      <CardContent className="space-y-5">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900">Payment Recorded ✓</h2>
          <p className="text-3xl font-extrabold text-emerald-600">₹{amount.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-2 text-left max-w-sm mx-auto">
          <div className="flex justify-between">
            <span className="text-slate-500">Cash Member</span>
            <span className="font-bold text-slate-900">{memberName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Chit Group</span>
            <span className="font-bold text-slate-900">{groupName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Cycle Month</span>
            <span className="font-bold text-slate-900">Month {monthNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Recorded By</span>
            <span className="font-bold text-emerald-700">{agentName}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Photo proof saved securely. Member ledger updated.</span>
          </div>
        </div>

        <Button
          onClick={onReset}
          className="w-full max-w-sm py-3 text-sm font-bold rounded-xl shadow flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Record Another Payment
        </Button>
      </CardContent>
    </Card>
  );
}
