'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function CreateGroupPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [durationMonths, setDurationMonths] = useState('12');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [auctionType, setAuctionType] = useState<'bid' | 'lucky_draw'>('bid');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Access check
  useEffect(() => {
    if (!authLoading && profile && profile.role !== 'organizer') {
      router.push('/dashboard');
    }
  }, [profile, authLoading, router]);

  // Auto calculate monthly contribution when total amount or duration changes
  const handleTotalChange = (val: string) => {
    setTotalAmount(val);
    const numTotal = parseFloat(val);
    const numDur = parseInt(durationMonths, 10);
    if (!isNaN(numTotal) && numTotal > 0 && !isNaN(numDur) && numDur > 0) {
      setMonthlyContribution((numTotal / numDur).toString());
    }
  };

  const handleDurationChange = (val: string) => {
    setDurationMonths(val);
    const numTotal = parseFloat(totalAmount);
    const numDur = parseInt(val, 10);
    if (!isNaN(numTotal) && numTotal > 0 && !isNaN(numDur) && numDur > 0) {
      setMonthlyContribution((numTotal / numDur).toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || name.trim().length < 3) {
      setErrorMessage('Group name must be at least 3 characters long.');
      return;
    }

    const numTotal = parseFloat(totalAmount);
    const numDur = parseInt(durationMonths, 10);
    const numContrib = parseFloat(monthlyContribution);

    if (isNaN(numTotal) || numTotal <= 0) {
      setErrorMessage('Total pool amount must be greater than ₹0.');
      return;
    }

    if (isNaN(numDur) || numDur <= 0) {
      setErrorMessage('Duration months must be greater than 0.');
      return;
    }

    if (isNaN(numContrib) || numContrib <= 0) {
      setErrorMessage('Monthly contribution must be greater than ₹0.');
      return;
    }

    if (numContrib > numTotal) {
      setErrorMessage('Monthly contribution cannot exceed total pool amount.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          total_amount: numTotal,
          duration_months: numDur,
          contribution_per_month: numContrib,
          auction_type: auctionType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || 'Could not create group. Please check inputs.');
        setSubmitting(false);
        return;
      }

      router.push(`/groups/${data.id}`);
    } catch (err: unknown) {
      console.error('Error creating group:', err);
      setErrorMessage('Network error creating group. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/groups"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Groups
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Community Chit Group</h1>
        <p className="text-xs text-slate-600">Set up financial pool, duration, and monthly payment structure.</p>
      </div>

      <Card className="shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Group Configuration
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Group Name */}
            <div>
              <label htmlFor="group-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Group Name *
              </label>
              <input
                id="group-name"
                type="text"
                placeholder="e.g. Mohalla Savings Circle #1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                disabled={submitting}
              />
            </div>

            {/* Financial Numbers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Total Pool Amount */}
              <div>
                <label htmlFor="total-amount" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Total Pool Amount (₹) *
                </label>
                <input
                  id="total-amount"
                  type="number"
                  placeholder="e.g. 30000"
                  value={totalAmount}
                  onChange={(e) => handleTotalChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  disabled={submitting}
                />
              </div>

              {/* Duration Months */}
              <div>
                <label htmlFor="duration-months" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Duration (Months) *
                </label>
                <input
                  id="duration-months"
                  type="number"
                  placeholder="e.g. 12"
                  value={durationMonths}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Calculated Monthly Contribution */}
            <div>
              <label htmlFor="monthly-contrib" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Monthly Contribution Per Member (₹) *
              </label>
              <input
                id="monthly-contrib"
                type="number"
                placeholder="e.g. 2500"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                disabled={submitting}
              />
            </div>

            {/* Auction Type */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Monthly Auction / Allocation Method *</label>

              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setAuctionType('bid')}
                  className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    auctionType === 'bid'
                      ? 'border-emerald-600 bg-emerald-50/60 font-bold'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs text-slate-900">Bidding Auction</p>
                  <p className="text-[10px] text-slate-500 font-normal">Lowest discount bid wins cycle payout</p>
                </div>

                <div
                  onClick={() => setAuctionType('lucky_draw')}
                  className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    auctionType === 'lucky_draw'
                      ? 'border-emerald-600 bg-emerald-50/60 font-bold'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs text-slate-900">Lucky Draw</p>
                  <p className="text-[10px] text-slate-500 font-normal">Random token draw among eligible members</p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full py-3 text-sm font-bold rounded-xl">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Chit Group...
                </span>
              ) : (
                'Create Community Group'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
