'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, Banknote, MapPin, CheckCircle2, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function VerifiedAgentDashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold mb-1">
            <UserCheck className="w-3.5 h-3.5" /> Verified CashBridge Agent
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {profile?.name || 'Agent'}
          </h1>
          <p className="text-sm text-slate-600">Record cash collections and issue photo-verified digital receipts.</p>
        </div>

        <Link href="/agent">
          <Button variant="cash" className="flex items-center gap-2">
            <Camera className="w-4 h-4" /> Record Cash Collection
          </Button>
        </Link>
      </div>

      {/* Agent Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-amber-500 text-slate-950 border-0 shadow">
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-900">Total Cash Collected</p>
                <p className="text-2xl font-extrabold mt-1">₹30,000</p>
              </div>
              <Banknote className="w-8 h-8 text-slate-950 opacity-80" />
            </div>
            <p className="text-xs font-medium text-slate-900 mt-3">12 Doorstep Transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">Reputation Score</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">98.5 / 100</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-600 opacity-80" />
            </div>
            <p className="text-xs text-emerald-700 font-semibold mt-3">High Reliability Agent</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">Assigned Service Region</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{profile?.region || 'Jaipur Ward 12'}</p>
              </div>
              <MapPin className="w-8 h-8 text-purple-600 opacity-80" />
            </div>
            <p className="text-xs text-slate-500 mt-3">6 Active Cash Members</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
