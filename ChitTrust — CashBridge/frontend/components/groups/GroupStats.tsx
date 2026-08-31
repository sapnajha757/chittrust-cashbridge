import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Calendar, Users, Award } from 'lucide-react';
import { Group } from '@/types';

interface GroupStatsProps {
  group: Group;
  activeMemberCount: number;
}

export function GroupStats({ group, activeMemberCount }: GroupStatsProps) {
  const monthlyContrib = group.monthly_contribution || (group.total_amount / group.duration_months);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-slate-900 text-white border-0 shadow">
        <CardContent className="pt-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-300 font-medium">Total Chit Pool</p>
              <p className="text-2xl font-extrabold mt-1">₹{group.total_amount.toLocaleString('en-IN')}</p>
            </div>
            <Wallet className="w-7 h-7 text-emerald-400 opacity-80" />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Cycle Pool Amount</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 font-medium">Monthly Contribution</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{monthlyContrib.toLocaleString('en-IN')}</p>
            </div>
            <Wallet className="w-7 h-7 text-emerald-600 opacity-80" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Per Member / Month</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 font-medium">Group Duration</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{group.duration_months} Months</p>
            </div>
            <Calendar className="w-7 h-7 text-blue-600 opacity-80" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">{group.duration_months} Total Cycles</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 font-medium">Group Members</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{activeMemberCount} Members</p>
            </div>
            <Users className="w-7 h-7 text-purple-600 opacity-80" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Active Participants</p>
        </CardContent>
      </Card>
    </div>
  );
}
