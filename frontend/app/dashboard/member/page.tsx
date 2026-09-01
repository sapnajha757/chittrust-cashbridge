'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Flame, ArrowRight, PhoneCall, QrCode, Banknote, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export default function MemberDashboardPage() {
  const { profile, trustScore } = useAuth();
  const [currentContribution, setCurrentContribution] = useState<any | null>(null);

  useEffect(() => {
    async function loadCurrentContribution() {
      try {
        const res = await fetch('/api/v1/memberships/33333333-3333-3333-3333-333333333333/current-contribution');
        if (res.ok) {
          const data = await res.json();
          setCurrentContribution(data);
        }
      } catch (err) {
        console.error('Error loading current contribution:', err);
      }
    }

    loadCurrentContribution();
  }, []);

  const currentScore = trustScore?.score ?? 125;
  const isCashMember = profile?.role === 'member' && profile?.name?.includes('Cash');

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Top Welcome Bar */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs text-slate-500 font-semibold">Member Portal</span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Namaste, {profile?.name || 'Chit Member'} 👋
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <NotificationBell />
          <Link href="/profile">
            <Button size="sm" variant="outline" className="text-xs font-bold">
              Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Voice Assistant IVR Banner */}
      <Card className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white border-0 shadow-md">
        <CardContent className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
              <PhoneCall className="w-3 h-3" /> Feature Phone Toll-Free Voice Assistant
            </span>
            <p className="text-sm font-extrabold">Query Trust Score & Payment Status via Phone Call</p>
            <p className="text-xs text-slate-300">&quot;Mera score kya hai?&quot; • Natural Hindi Voice IVR</p>
          </div>

          <Link href="/dev/voice-demo">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shrink-0 flex items-center gap-1">
              Try Voice Simulator <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Trust Score Card */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white border-0 shadow-xl overflow-hidden relative">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Trust Score
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 3 Mo Streak
                </span>
              </div>

              <div className="flex items-baseline space-x-2 py-1">
                <span className="text-4xl font-extrabold text-white">{currentScore}</span>
                <span className="text-xs text-slate-400">/ 1000 Max</span>
              </div>

              <p className="text-xs text-slate-300">
                Cash and UPI payments receive 100% equal credit weight.
              </p>

              <Link href="/profile/trust-score">
                <Button size="sm" variant="outline" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold mt-2">
                  View Itemized Score Breakdown →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Monthly Contribution Card & Group Details */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">
                This Month&apos;s Contribution Status
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-900 text-sm">Month 2 Contribution</p>
                  <p className="text-slate-500 mt-0.5">Ganesh Traders Chit #1</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-slate-900 text-base">₹2,500</p>
                  <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Paid ✓
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
                  <span className="text-blue-700 font-bold flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5" /> Digital UPI Option
                  </span>
                  <p className="text-[11px] text-slate-600">Pay directly via Razorpay UPI checkout.</p>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 space-y-1">
                  <span className="text-amber-800 font-bold flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5" /> CashBridge Agent
                  </span>
                  <p className="text-[11px] text-slate-600">Give cash to Suresh Patel (Verified Agent).</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
