'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { ContributionCard } from '@/components/contributions/ContributionCard';
import { ContributionHistory } from '@/components/contributions/ContributionHistory';
import { PaymentReceipt } from '@/components/contributions/PaymentReceipt';
import { PaymentProcessingState } from '@/components/contributions/PaymentProcessingState';
import { Contribution } from '@/types';

export default function GroupContributionsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = (params?.id as string) || '';

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [currentDue, setCurrentDue] = useState<{
    membershipId: string;
    groupName: string;
    monthNumber: number;
    amount: number;
    paymentStatus: string;
  } | null>(null);

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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const membershipId = '22222222-2222-2222-2222-222222222222';
      const [historyRes, dueRes] = await Promise.all([
        fetch(`/api/v1/contributions/memberships/${membershipId}/contributions`),
        fetch(`/api/v1/contributions/memberships/${membershipId}/current-contribution`),
      ]);

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setContributions(historyData);
      }

      if (dueRes.ok) {
        const dueData = await dueRes.json();
        setCurrentDue({
          membershipId,
          groupName: 'Ganesh Traders Community Chit #1',
          monthNumber: dueData.month_number || 2,
          amount: dueData.amount || 2500.0,
          paymentStatus: dueData.payment_status || 'pending',
        });
      } else {
        setCurrentDue({
          membershipId,
          groupName: 'Ganesh Traders Community Chit #1',
          monthNumber: 2,
          amount: 2500.0,
          paymentStatus: 'pending',
        });
      }
    } catch (err) {
      console.error('Error loading contribution data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePaymentSuccess = (receiptData: any) => {
    setReceipt({
      isOpen: true,
      groupName: receiptData.groupName,
      monthNumber: receiptData.monthNumber,
      amount: receiptData.amount,
      paymentMode: receiptData.paymentMode,
      transactionRef: receiptData.transactionRef,
      paymentDate: receiptData.paymentDate,
    });
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-600">Loading contribution portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/groups/${groupId}`}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Group Dashboard
        </Link>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Razorpay Test Mode
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Monthly Contribution Portal</h1>
        <p className="text-xs text-slate-600">Pay your monthly chit contribution via UPI and view past verified payment receipts.</p>
      </div>

      {/* Current Month Due Card */}
      {currentDue && (
        <ContributionCard
          membershipId={currentDue.membershipId}
          groupName={currentDue.groupName}
          monthNumber={currentDue.monthNumber}
          amount={currentDue.amount}
          paymentStatus={currentDue.paymentStatus}
          onPaymentSuccess={handlePaymentSuccess}
          onProcessingChange={setProcessing}
        />
      )}

      {/* Contribution History Ledger */}
      <ContributionHistory contributions={contributions} />

      {/* Payment Processing Overlay */}
      <PaymentProcessingState isOpen={processing} />

      {/* Verified Receipt Modal */}
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
