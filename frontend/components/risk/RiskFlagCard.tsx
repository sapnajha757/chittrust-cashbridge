import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

interface RiskFlagCardProps {
  id: string;
  type: string;
  severity: string;
  score: number;
  description: string;
  memberName?: string;
  agentName?: string;
  status: string;
  onResolve: (flagId: string) => void;
}

export function RiskFlagCard({
  id,
  type,
  severity,
  score,
  description,
  memberName,
  agentName,
  status,
  onResolve,
}: RiskFlagCardProps) {
  const isCritical = severity === 'CRITICAL';
  const isHigh = severity === 'HIGH';
  const isResolved = status === 'resolved' || status === 'dismissed';

  return (
    <Card className={`shadow-sm border ${isResolved ? 'border-slate-200 bg-slate-50/60 opacity-70' : isCritical ? 'border-red-300 bg-red-50/30' : 'border-amber-200 bg-amber-50/20'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
              isCritical ? 'bg-red-100 text-red-800' : isHigh ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
            }`}>
              Needs Review • {severity} ({score} Risk Score)
            </span>
          </div>

          <span className="text-xs font-bold text-slate-500 uppercase">{status}</span>
        </div>
        <CardTitle className="text-sm font-extrabold text-slate-900 mt-1">{type.replace(/_/g, ' ')}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-xs">
        <p className="text-slate-700 font-medium leading-relaxed">{description}</p>

        {(memberName || agentName) && (
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1 text-[11px]">
            {memberName && <p><strong className="text-slate-900">Member:</strong> {memberName}</p>}
            {agentName && <p><strong className="text-slate-900">Agent:</strong> {agentName}</p>}
          </div>
        )}

        {!isResolved && (
          <Button
            size="sm"
            onClick={() => onResolve(id)}
            className="w-full py-2 font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
          >
            Review Evidence & Resolve Flag →
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
