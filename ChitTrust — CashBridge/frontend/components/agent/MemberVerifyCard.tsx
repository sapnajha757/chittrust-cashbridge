import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserCheck, ShieldCheck, Banknote, Calendar } from 'lucide-react';

interface MemberVerifyCardProps {
  memberName: string;
  phone: string;
  groupName: string;
  monthlyContribution: number;
  agentName: string;
  monthNumber: number;
}

export function MemberVerifyCard({
  memberName,
  phone,
  groupName,
  monthlyContribution,
  agentName,
  monthNumber,
}: MemberVerifyCardProps) {
  return (
    <Card className="shadow-md border-emerald-200 bg-emerald-50/40">
      <CardHeader className="pb-3 border-b border-emerald-100">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider">
              Cash Member Verification
            </span>
            <CardTitle className="text-lg font-extrabold text-slate-900 mt-0.5">{memberName}</CardTitle>
            <p className="text-xs text-slate-500 font-medium">{phone}</p>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Verified
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3 text-xs">
        <div className="flex justify-between items-center py-1">
          <span className="text-slate-500">Chit Group:</span>
          <span className="font-bold text-slate-900">{groupName}</span>
        </div>

        <div className="flex justify-between items-center py-1 border-t border-emerald-100/60">
          <span className="text-slate-500">Contribution Cycle:</span>
          <span className="font-bold text-slate-900 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Month {monthNumber}
          </span>
        </div>

        <div className="flex justify-between items-center py-1 border-t border-emerald-100/60">
          <span className="text-slate-500">Expected Monthly Contribution:</span>
          <span className="font-extrabold text-emerald-700 text-sm">
            ₹{monthlyContribution.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex justify-between items-center py-1 border-t border-emerald-100/60">
          <span className="text-slate-500">Assigned CashBridge Agent:</span>
          <span className="font-bold text-slate-900 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {agentName}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
