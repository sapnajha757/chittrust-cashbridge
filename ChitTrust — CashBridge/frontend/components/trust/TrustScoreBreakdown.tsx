import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calculator, CheckCircle2, AlertTriangle, Flame, ShieldAlert } from 'lucide-react';

export interface BreakdownItem {
  label: string;
  count: number;
  points_per_unit: number;
  total_points: number;
}

interface TrustScoreBreakdownProps {
  score: number;
  baseScore: number;
  items: BreakdownItem[];
}

export function TrustScoreBreakdown({ score, baseScore, items }: TrustScoreBreakdownProps) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-600" /> Itemized Mathematical Breakdown
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="divide-y divide-slate-100">
          {items.map((item, idx) => {
            const isPositive = item.total_points >= 0;
            return (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{item.label}</p>
                  <p className="text-[11px] text-slate-500">
                    {item.count} instance(s) × {item.points_per_unit > 0 ? `+${item.points_per_unit}` : item.points_per_unit} points
                  </p>
                </div>
                <span
                  className={`font-mono text-sm font-extrabold px-2.5 py-1 rounded-lg ${
                    isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {isPositive ? `+${item.total_points}` : item.total_points}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900 bg-slate-50 p-3 rounded-xl">
          <span>Final Derived Score</span>
          <span className="text-xl font-extrabold text-emerald-700">{score} Points</span>
        </div>
      </CardContent>
    </Card>
  );
}
