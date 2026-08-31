'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ShieldCheck, Clock, Award, ArrowRight, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ContributionCard } from '@/components/contributions/ContributionCard';
import { PaymentReceipt } from '@/components/contributions/PaymentReceipt';
import { PaymentProcessingState } from '@/components/contributions/PaymentProcessingState';

export default function MemberDashboardPage() {
  const { profile, trustScore } = useAuth();

  const [processing, setProcessing] = useState(false);
  const [currentDue, setCurrentDue] = useState<{
    membershipId: string;
    groupName: string;
    monthNumber: number;
    amount: number;
    paymentStatus: string;
  }>({
    membershipId: '22222222-2222-2222-2222-222222222222',
    groupName: 'Ganesh Traders Chit #1',
    monthNumber: 2,
    amount: 2500.0,
    paymentStatus: 'pending',
  });

  const [receipt, setReceipt] = useState<{
    isOpen: boolean;
    groupName: string;
    monthNumber: number;
    amount: number;
    paymentMode: string;
    transactionRef: string;
    paymentDate: string;
  }>({
    isOpen: false,
    groupName: '',
    monthNumber: 1,
    amount: 2500,
    paymentMode: 'UPI',
    transactionRef: '',
    paymentDate: new Date().toISOString(),
  });

  const currentScore = trustScore?.score ?? 100;
  const scoreTier = trustScore?.tier ? trustScore.tier.toUpperCase() : 'STARTER';

  const handlePaymentSuccess = (receiptData: any) => {
    setCurrentDue((prev) => ({ ...prev, paymentStatus: 'successful' }));
    setReceipt({
      isOpen: true,
      groupName: receiptData.groupName,
      monthNumber: receiptData.monthNumber,
      amount: receiptData.amount,
      paymentMode: receiptData.paymentMode,
      transactionRef: receiptData.transactionRef,
      paymentDate: receiptData.paymentDate,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Member Portal
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {profile?.name || 'Chit Member'}
          </h1>
          <p className="text-sm text-slate-600">Track your active chits, payments, and credit trust score.</p>
        </div>

        <Link href="/profile">
          <div className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl shadow text-xs font-semibold cursor-pointer hover:bg-slate-800 transition-colors">
            <Award className="w-4 h-4 text-emerald-400 mr-2" />
            <span>TrustScore: <strong className="text-emerald-400 text-sm ml-1">{currentScore}</strong> ({scoreTier})</span>
          </div>
        </Link>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-emerald-950 text-white border-0 shadow-md">
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-emerald-300 font-medium">My Monthly Contribution</p>
                <p className="text-2xl font-extrabold mt-1">₹2,500</p>
              </div>
              <Wallet className="w-8 h-8 text-emerald-400 opacity-80" />
            </div>
            <p className="text-xs text-emerald-200 mt-3">1 Active Chit Group</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">Next Payment Status</p>
                <p className="text-2xl font-bold text-slate-900 mt-1 capitalize">
                  {currentDue.paymentStatus === 'successful' ? 'Paid ✓' : 'Pending'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-500 opacity-80" />
            </div>
            <p className="text-xs text-amber-600 font-medium mt-3">Month 2 • Due in 10 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">On-Time Payment Streak</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{trustScore?.digital_on_time_count ?? 1} Cycles</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-blue-600 opacity-80" />
            </div>
            <p className="text-xs text-slate-500 mt-3">Equal credit for cash & UPI</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Payment Due Section */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-600" /> Current Month Payment Portal
        </h2>
        <ContributionCard
          membershipId={currentDue.membershipId}
          groupName={currentDue.groupName}
          monthNumber={currentDue.monthNumber}
          amount={currentDue.amount}
          paymentStatus={currentDue.paymentStatus}
          onPaymentSuccess={handlePaymentSuccess}
          onProcessingChange={setProcessing}
        />
      </div>

      {/* Active Groups Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">My Active Savings Groups</CardTitle>
          <Link href="/groups">
            <Button size="sm" variant="outline">Browse Groups</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 text-sm">Ganesh Traders Chit #1</p>
                <p className="text-xs text-slate-500">Cycle 4 of 12 • Monthly ₹2,500</p>
              </div>
              <Link href="/groups/11111111-1111-1111-1111-111111111111/contributions">
                <Button size="sm" variant="ghost" className="text-xs font-bold text-emerald-600">
                  View Portal <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <PaymentProcessingState isOpen={processing} />

      <PaymentReceipt
        isOpen={receipt.isOpen}
        groupName={receipt.groupName}
        monthNumber={receipt.monthNumber}
        amount={receipt.amount}
        paymentMode={receipt.paymentMode}
        transactionRef={receipt.transactionRef}
        paymentDate={receipt.paymentDate}
        onClose={() => setReceipt((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
