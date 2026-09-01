'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Trophy, Gavel, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AuctionTimeline } from '@/components/auction/AuctionTimeline';
import { AuctionCard } from '@/components/auction/AuctionCard';
import { BidForm } from '@/components/auction/BidForm';
import { PayoutConfirmModal } from '@/components/auction/PayoutConfirmModal';
import { useAuth } from '@/hooks/use-auth';

export default function GroupAuctionPage() {
  const params = useParams();
  const groupId = (params?.id as string) || '11111111-1111-1111-1111-111111111111';
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [auction, setAuction] = useState<any | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [payout, setPayout] = useState<any | null>(null);

  const isOrganizer = profile?.role === 'organizer';
  const isAgent = profile?.role === 'agent';

  const loadAuctionData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auctions/a1111111-1111-1111-1111-111111111111');
      if (res.ok) {
        const data = await res.json();
        setAuction(data);
      }

      const bidsRes = await fetch('/api/v1/auctions/a1111111-1111-1111-1111-111111111111/bids');
      if (bidsRes.ok) {
        const bidsData = await bidsRes.json();
        setBids(bidsData);
      }

      const payoutRes = await fetch('/api/v1/payouts/p1111111-1111-1111-1111-111111111111');
      if (payoutRes.ok) {
        const pData = await payoutRes.json();
        setPayout(pData);
      }
    } catch (err) {
      console.error('Error loading auction portal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuctionData();
  }, []);

  const handleCloseAuction = async () => {
    setClosing(true);
    try {
      const res = await fetch('/api/v1/auctions/a1111111-1111-1111-1111-111111111111/close', {
        method: 'POST',
      });
      if (res.ok) {
        await loadAuctionData();
      }
    } catch (err) {
      console.error('Error closing auction:', err);
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-600">Loading auction portal...</p>
      </div>
    );
  }

  const isOpen = auction?.status === 'open';

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/groups/${groupId}`}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Group Details
        </Link>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Trophy className="w-3.5 h-3.5 mr-1 text-amber-600" /> Monthly Auction & Payout Engine
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Month {auction?.month_number || 3} Auction Portal
        </h1>
        <p className="text-xs text-slate-600">
          {auction?.group_name || 'Ganesh Traders Community Chit #1'} • Highest valid discount wins.
        </p>
      </div>

      {/* Visual Timeline Progress */}
      <AuctionTimeline status={auction?.status || 'open'} payoutStatus={payout?.status} />

      {/* Main Auction Details Card */}
      <AuctionCard
        monthNumber={auction?.month_number || 3}
        totalPot={auction?.total_pot || 10000.0}
        status={auction?.status || 'open'}
        highestBidDiscount={auction?.highest_bid_discount || 1500.0}
        winnerName={auction?.winner?.member_name}
        winningDiscount={auction?.winning_bid_discount}
        payoutAmount={auction?.payout_amount}
      />

      {/* Organizer Controls: Close Auction Button */}
      {isOpen && (
        <Card className="bg-amber-50 border-amber-200 shadow-sm">
          <CardContent className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5 text-xs text-amber-900">
              <p className="font-extrabold">Organizer Auction Controls</p>
              <p className="text-[11px] text-amber-800">
                Close bidding to select winner ({auction?.bids_count || 3} valid bids received).
              </p>
            </div>

            <Button
              onClick={handleCloseAuction}
              disabled={closing}
              className="w-full sm:w-auto py-2.5 px-6 font-extrabold text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow"
            >
              {closing ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin" /> Closing Auction...
                </span>
              ) : (
                '🔒 Confirm & Close Auction'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Member Bidding Form (When Open) */}
      {isOpen && (
        <BidForm
          auctionId={auction?.id || 'a1111111-1111-1111-1111-111111111111'}
          totalPot={auction?.total_pot || 10000.0}
          onBidSubmitted={loadAuctionData}
        />
      )}

      {/* Payout Handover Section (When Closed) */}
      {!isOpen && payout && payout.status !== 'paid' && (
        <PayoutConfirmModal
          payoutId={payout.id}
          recipientName={payout.member_name}
          amount={payout.amount}
          assignedAgentName={payout.assigned_agent_name || 'Suresh Patel'}
          onConfirmed={loadAuctionData}
        />
      )}

      {/* Bids List */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span>Submitted Bids ({bids.length})</span>
            <span className="text-xs text-slate-500 font-normal">Anonymized for Member Privacy</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {bids.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No bids placed yet in this session.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {bids.map((b, idx) => (
                <div key={b.id || idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">
                      {b.member_name || (b.is_my_bid ? 'Your Bid' : `Bidder #${idx + 1}`)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Submitted at {new Date(b.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                    ₹{b.bid_discount.toLocaleString('en-IN')} Discount
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
