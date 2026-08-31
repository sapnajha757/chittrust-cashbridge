'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function AgentPendingPage() {
  const { profile } = useAuth();

  return (
    <div className="max-w-md mx-auto py-12 space-y-6 text-center">
      <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mx-auto shadow-md">
        <Clock className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application Under Review</h1>
        <p className="text-sm text-slate-600">
          Thank you for applying to become a <span className="font-semibold text-slate-900">CashBridge Agent</span> in <span className="font-semibold text-slate-900">{profile?.region || 'your region'}</span>.
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50/40 text-left shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" /> Verification Status: Pending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-700">
          <p>
            To prevent fraud and protect community micro-savers, CashBridge Agents undergo identity and background review before receiving cash collection permissions.
          </p>
          <div className="p-3 bg-white rounded-lg border border-amber-200 space-y-1">
            <p className="font-semibold text-slate-900 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Application Received
            </p>
            <p className="text-slate-500">Applicant: {profile?.name || 'CashBridge Agent'}</p>
            <p className="text-slate-500">Mobile: {profile?.phone || '+91 Member'}</p>
          </div>
          <p className="text-slate-500 text-[11px]">
            Once an administrator approves your verification, full cash recording tools will automatically unlock in your agent portal.
          </p>
        </CardContent>
      </Card>

      <div className="pt-2">
        <Link href="/dashboard/member">
          <Button variant="outline" className="w-full text-xs">
            Continue as Member in the Meantime <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
