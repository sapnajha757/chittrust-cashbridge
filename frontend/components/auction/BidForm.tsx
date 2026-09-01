'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gavel, AlertCircle, Loader2 } from 'lucide-react';

interface BidFormProps {
  auctionId: string;
  totalPot: number;
  onBidSubmitted: () => void;
}

export function BidForm({ auctionId, totalPot, onBidSubmitted }: BidFormProps) {
  const [bidDiscount, setBidDiscount] = useState<string>('1500');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const discountVal = parseFloat(bidDiscount);
    if (isNaN(discountVal) || discountVal <= 0 || discountVal >= totalPot) {
      setError(`Bid discount must be greater than ₹0 and less than total pot ₹${totalPot.toLocaleString('en-IN')}.`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/v1/auctions/${auctionId}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bid_discount: discountVal }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to place bid.');
      } else {
        onBidSubmitted();
      }
    } catch (err) {
      console.error('Error placing bid:', err);
      setError('Network error submitting bid discount.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-md border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Gavel className="w-5 h-5 text-amber-600" /> Place Bid Discount
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmitBid} className="space-y-3">
          <div>
            <label htmlFor="bid-discount-input" className="block text-xs font-bold text-slate-900 mb-1">
              Your Requested Discount Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-base font-extrabold text-slate-500">₹</span>
              <input
                id="bid-discount-input"
                type="number"
                value={bidDiscount}
                onChange={(e) => setBidDiscount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-300 rounded-xl text-lg font-extrabold text-amber-900 bg-amber-50/30 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                disabled={submitting}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Highest valid discount wins the auction. Your net payout will be ₹
              {(totalPot - (parseFloat(bidDiscount) || 0)).toLocaleString('en-IN')}.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full py-3 font-extrabold text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting Bid...
              </span>
            ) : (
              'Submit / Update Bid Discount'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
