import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Shield, Plus, ArrowRight } from 'lucide-react';

export default function GroupsPage() {
  const groups = [
    {
      id: '1',
      name: 'Ganesh Traders Chit #1',
      monthly: 2500,
      members: 12,
      cycle: 4,
      totalCycle: 12,
      status: 'Active',
      organizer: 'Ramesh Kumar',
    },
    {
      id: '2',
      name: 'Lakshmi Mahila Savings',
      monthly: 2500,
      members: 10,
      cycle: 2,
      totalCycle: 10,
      status: 'Active',
      organizer: 'Sunita Devi',
    },
    {
      id: '3',
      name: 'Vanguard Micro Small Business Chit',
      monthly: 5000,
      members: 20,
      cycle: 1,
      totalCycle: 20,
      status: 'Upcoming',
      organizer: 'Suresh Patel',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Community Chit Groups</h1>
          <p className="text-sm text-slate-600">Browse verified chit committees or create a new group.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create New Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-bold text-slate-900">{group.name}</CardTitle>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  {group.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Organizer: {group.organizer}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500 block">Monthly Contribution</span>
                  <span className="font-bold text-slate-900 text-sm">₹{group.monthly.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Pool</span>
                  <span className="font-bold text-emerald-600 text-sm">₹{(group.monthly * group.members).toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 block">Members</span>
                  <span className="font-medium text-slate-800">{group.members} participants</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 block">Current Cycle</span>
                  <span className="font-medium text-slate-800">{group.cycle} / {group.totalCycle}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full text-xs">
                View Group Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
