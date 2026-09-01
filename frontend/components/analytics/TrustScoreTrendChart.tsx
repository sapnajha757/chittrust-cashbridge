import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, ShieldCheck } from 'lucide-react';

export function TrustScoreTrendChart() {
  const trendData = [
    { month: 'Month 1', score: 100, label: 'Base Start' },
    { month: 'Month 2', score: 105, label: '+5 On-Time' },
    { month: 'Month 3', score: 125, label: '+10 Streak Bonus' },
  ];

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" /> Historical Trust Score Trend
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-end justify-between gap-4 h-40 pt-6 px-2 border-b border-slate-200">
          {trendData.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-extrabold text-emerald-700 font-mono">
                {item.score}
              </span>
              <div
                className="w-full max-w-[48px] bg-gradient-to-t from-slate-800 to-emerald-600 rounded-t-xl transition-all shadow-sm"
                style={{ height: `${(item.score / 150) * 100}%` }}
              />
              <span className="text-[11px] font-bold text-slate-600">{item.month}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
          <span>Continuous Reliability Score</span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> 100% Equal Cash & UPI Weight
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
