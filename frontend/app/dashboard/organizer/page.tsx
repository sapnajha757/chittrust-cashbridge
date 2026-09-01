'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Users, Banknote, QrCode, AlertTriangle, ArrowRight, TrendingUp, Trophy } from 'lucide-react';
import { GroupAnalyticsCard } from '@/components/analytics/GroupAnalyticsCard';
import { TrustScoreTrendChart } from '@/components/analytics/TrustScoreTrendChart';

export default function OrganizerDashboardPage() {
  const [kpis, setKpis] = useState({
    active_groups: 4,
    total_members: 38,
    active_agents: 6,
    total_monthly_pool: 380000.0,
    collection_rate: 92.5,
    on_time_payment_rate: 94.0,
    average_trust_score: 118.0,
    cash_percentage: 37.0,
    digital_percentage: 63.0,
  });

  const [openFlagsCount, setOpenFlagsCount] = useState(2);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch('/api/v1/analytics/overview');
        if (res.ok) {
          const data = await res.json();
          setKpis(data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      }
    }

    loadAnalytics();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Top Welcome & Navigation Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs text-slate-500 font-semibold">Organizer Operations Portal</span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Committee Control Center
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/groups/create">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
              + Create Group
            </Button>
          </Link>
        </div>
      </div>

      {/* Top KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 text-white border-0 shadow-md">
          <CardContent className="pt-4">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Monthly Pool</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">₹3.8L</p>
            <p className="text-[10px] text-slate-400 mt-1">{kpis.active_groups} Active Groups</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Collection Rate</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">{kpis.collection_rate}%</p>
            <p className="text-[10px] text-slate-500 mt-1">Verified Contributions</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">On-Time Rate</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 mt-1">{kpis.on_time_payment_rate}%</p>
            <p className="text-[10px] text-slate-500 mt-1">Timely Submissions</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Avg Trust Score</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{kpis.average_trust_score}</p>
            <p className="text-[10px] text-slate-500 mt-1">Equal Credit Weight</p>
          </CardContent>
        </Card>
      </div>

      {/* Operational Risk & Review Alert Banner */}
      {openFlagsCount > 0 && (
        <Card className="bg-amber-50 border-amber-200 shadow-sm">
          <CardContent className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-xs text-amber-900">
              <div className="w-9 h-9 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-amber-900">Operational Risk & Review Alerts ({openFlagsCount} Pending)</p>
                <p className="text-slate-600">Possible duplicate entries and unusual agent volume signals require verification.</p>
              </div>
            </div>

            <Link href="/risk">
              <Button size="sm" className="bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-xs shrink-0 flex items-center gap-1">
                Inspect Risk Flags <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid: Group Analytics & Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GroupAnalyticsCard
          groupName="Ganesh Traders Community Chit #1"
          totalMembers={10}
          monthlyPool={25000.0}
          collectedAmount={22500.0}
          collectionRate={90.0}
          onTimeRate={95.0}
          cashAmount={10000.0}
          digitalAmount={12500.0}
          averageTrustScore={122.5}
        />

        <TrustScoreTrendChart />
      </div>

      {/* Quick Access Portal Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/groups/11111111-1111-1111-1111-111111111111/auction">
          <Card className="hover:shadow-md transition-all cursor-pointer border-slate-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-bold text-slate-900 text-xs">Monthly Auction Portal</p>
                  <p className="text-[11px] text-slate-500">Manage bidding & payouts</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/agents">
          <Card className="hover:shadow-md transition-all cursor-pointer border-slate-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-bold text-slate-900 text-xs">Agent Performance</p>
                  <p className="text-[11px] text-slate-500">Doorstep cash volume & flags</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/risk">
          <Card className="hover:shadow-md transition-all cursor-pointer border-slate-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-bold text-slate-900 text-xs">Risk & Review Dashboard</p>
                  <p className="text-[11px] text-slate-500">Inspect evidence & resolve flags</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
