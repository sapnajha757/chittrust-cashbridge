'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Wallet, CheckCircle2, ShieldCheck, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ContributionLedger, LedgerItem } from '@/components/contributions/ContributionLedger';

export default function OrganizerDashboardPage() {
  const { profile } = useAuth();
  const [summary, setSummary] = useState({
    totalExpected: 30000.0,
    collected: 2500.0,
    pending: 27500.0,
  });

  const demoLedger: LedgerItem[] = [
    { memberName: 'Priya Sharma (Digital)', amount: 2500.0, mode: 'digital', status: 'successful' },
    { memberName: 'Anil Verma (Cash Member)', amount: 2500.0, mode: 'cash', status: 'not_recorded' },
    { memberName: 'Sunita Devi (Digital)', amount: 2500.0, mode: 'digital', status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Organizer Control Center
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {profile?.name || 'Organizer'}
          </h1>
          <p className="text-sm text-slate-600">Manage community chit funds, collection ledgers, and auctions.</p>
        </div>

        <Link href="/groups/create">
          <Button className="flex items-center gap-2 font-bold shadow">
            <Plus className="w-4 h-4" /> Create New Group
          </Button>
        </Link>
      </div>

      {/* Collection Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900 text-white border-0 shadow-md">
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-medium">This Month Expected</p>
                <p className="text-2xl font-extrabold mt-1">₹{summary.totalExpected.toLocaleString('en-IN')}</p>
              </div>
              <Wallet className="w-8 h-8 text-emerald-400 opacity-80" />
            </div>
            <p className="text-xs text-slate-400 mt-3">Monthly Member Pool</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">Collected (Verified UPI)</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">₹{summary.collected.toLocaleString('en-IN')}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-600 opacity-80" />
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-3">Server Signature Verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">Pending Collections</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">₹{summary.pending.toLocaleString('en-IN')}</p>
              </div>
              <Users className="w-8 h-8 text-amber-500 opacity-80" />
            </div>
            <p className="text-xs text-slate-500 mt-3">UPI pending & Cash not recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* Member Collection Ledger */}
      <ContributionLedger ledgerItems={demoLedger} />

      {/* Active Groups Quick List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold">Managed Groups Directory</CardTitle>
          <Link href="/groups">
            <Button size="sm" variant="outline" className="text-xs font-semibold">View All Groups</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 text-sm">Ganesh Traders Chit #1</p>
                <p className="text-xs text-slate-500">12 Members • ₹30,000 Total Pool • Active</p>
              </div>
              <Link href="/groups/11111111-1111-1111-1111-111111111111">
                <Button size="sm" variant="ghost" className="text-xs font-bold">
                  Manage Group →
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
