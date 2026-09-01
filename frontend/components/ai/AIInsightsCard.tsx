import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AIInsightsCardProps {
  healthStatus: string;
  onTimeRate: number;
  unresolvedFlagsCount: number;
  summaryText: string;
}

export function AIInsightsCard({
  healthStatus,
  onTimeRate,
  unresolvedFlagsCount,
  summaryText,
}: AIInsightsCardProps) {
  const isHealthy = healthStatus === 'Healthy';

  return (
    <Card className="shadow-sm border-slate-200 bg-slate-900 text-white">
      <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <CardTitle className="text-sm font-extrabold text-white">AI Group Health & Insights</CardTitle>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
            isHealthy ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}
        >
          ● Group Health: {healthStatus}
        </span>
      </CardHeader>

      <CardContent className="pt-4 space-y-3 text-xs">
        <p className="text-slate-300 leading-relaxed font-medium">{summaryText}</p>

        <div className="grid grid-cols-2 gap-3 pt-1 text-slate-300">
          <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-medium">On-Time Consistency</span>
            <p className="text-base font-extrabold text-emerald-400">{onTimeRate}%</p>
          </div>

          <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-medium">Pending Review Signals</span>
            <p className="text-base font-extrabold text-amber-400">{unresolvedFlagsCount} Flag</p>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Operational risk indicators do not modify member Trust Scores automatically.
        </p>
      </CardContent>
    </Card>
  );
}
