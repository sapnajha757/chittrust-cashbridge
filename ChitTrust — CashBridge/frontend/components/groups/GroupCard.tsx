import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, ArrowRight, QrCode, Banknote, UserCheck } from 'lucide-react';
import { GroupStatusBadge } from './GroupStatusBadge';
import { Group } from '@/types';

interface GroupCardProps {
  group: Group;
  userRole?: 'organizer' | 'member' | 'agent' | 'admin';
  memberType?: 'digital' | 'cash';
  agentName?: string;
}

export function GroupCard({ group, userRole = 'organizer', memberType, agentName }: GroupCardProps) {
  return (
    <Card className="hover:shadow-md transition-all border-slate-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-bold text-slate-900">{group.name}</CardTitle>
          <GroupStatusBadge status={group.status} />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Auction Type: <span className="font-semibold text-slate-700 capitalize">{group.auction_type.replace('_', ' ')}</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Financial Overview Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-500 block">Total Pool</span>
            <span className="font-extrabold text-slate-900 text-sm">
              ₹{group.total_amount.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Monthly Contribution</span>
            <span className="font-extrabold text-emerald-600 text-sm">
              ₹{(group.monthly_contribution || (group.total_amount / group.duration_months)).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="pt-1.5 border-t border-slate-200/60">
            <span className="text-slate-500 block">Duration</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> {group.duration_months} Months
            </span>
          </div>
          <div className="pt-1.5 border-t border-slate-200/60">
            <span className="text-slate-500 block">Members</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" /> {group.total_members || 0} Members
            </span>
          </div>
        </div>

        {/* Member-specific Info Badge */}
        {userRole === 'member' && memberType && (
          <div className="p-2.5 bg-slate-100 rounded-lg text-xs flex items-center justify-between">
            <span className="text-slate-600 font-medium">Your Member Type:</span>
            {memberType === 'digital' ? (
              <span className="font-bold text-blue-700 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-blue-600" /> Digital (UPI)
              </span>
            ) : (
              <span className="font-bold text-amber-700 flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-amber-600" /> Cash (Agent: {agentName || 'Assigned'})
              </span>
            )}
          </div>
        )}

        <Link href={`/groups/${group.id}`}>
          <Button variant="outline" className="w-full text-xs font-semibold">
            View Group Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
