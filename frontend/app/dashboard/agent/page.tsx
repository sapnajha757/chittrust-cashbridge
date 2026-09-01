'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, ShieldCheck, Award, Plus, History, ArrowRight, Banknote } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function AgentDashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    name: 'Suresh Patel (CashBridge Agent)',
    todayEntries: 3,
    todayAmount: 7500.0,
    reputationScore: 98.5,
  });

  useEffect(() => {
    async function loadAgentStats() {
      try {
        const res = await fetch('/api/v1/agents/available');
        if (res.ok) {
          const agents = await res.json();
          if (agents.length > 0) {
            setStats((prev) => ({
              ...prev,
              name: agents[0].name,
              reputationScore: agents[0].reputation_score,
            }));
          }
        }
      } catch (err) {
        console.error('Error loading agent stats:', err);
      }
    }

    loadAgentStats();
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-6 py-4">
      {/* Agent PWA Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Doorstep Collection App
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            CashBridge Agent
          </h1>
          <p className="text-xs font-semibold text-slate-600">
            Welcome, {profile?.name || 'Suresh Patel'}
          </p>
        </div>

        <div className="text-right bg-amber-50 border border-amber-200 p-2.5 rounded-2xl">
          <p className="text-[10px] text-amber-700 font-bold uppercase">Reputation</p>
          <p className="text-lg font-extrabold text-amber-900 flex items-center gap-0.5 justify-end">
            <Award className="w-4 h-4 text-amber-600" /> {stats.reputationScore}
          </p>
        </div>
      </div>

      {/* Main Action Button */}
      <Link href="/agent/cash-entry">
        <Button className="w-full py-4 text-base font-extrabold bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all">
          <Plus className="w-6 h-6 stroke-[3]" /> Record Cash Payment
        </Button>
      </Link>

      {/* Today's Collection Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-slate-900 text-white border-0 shadow-md">
          <CardContent className="pt-4">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Today&apos;s Entries</p>
            <p className="text-3xl font-extrabold mt-1 text-emerald-400">{stats.todayEntries}</p>
            <p className="text-[10px] text-slate-400 mt-1">Doorstep Receipts</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Today&apos;s Amount</p>
            <p className="text-2xl font-extrabold mt-1 text-slate-900">₹{stats.todayAmount.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-500 mt-1">Verified Cash Handled</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Links */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Agent Quick Controls</h2>

        <div className="grid grid-cols-1 gap-2.5">
          <Link href="/agent/cash-entries">
            <Card className="hover:shadow-md transition-all cursor-pointer border-slate-200">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Collection History Ledger</p>
                    <p className="text-[11px] text-slate-500">View past cash payment records</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
