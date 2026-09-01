import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy, Flame, Clock, Award, CheckCircle2 } from 'lucide-react';

interface AuctionCardProps {
  monthNumber: number;
  totalPot: number;
  status: string;
  highestBidDiscount: number;
  winnerName?: string;
  winningDiscount?: number;
  payoutAmount?: number;
}

export function AuctionCard({
  monthNumber,
  totalPot,
  status,
  highestBidDiscount,
  winnerName,
  winningDiscount,
  payoutAmount,
}: AuctionCardProps) {
  const isOpen = status === 'open';

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white border-0 shadow-xl overflow-hidden relative">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-extrabold uppercase">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Month {monthNumber} Auction Session
            </span>
            <h2 className="text-xl font-extrabold tracking-tight mt-1 text-white">
              Total Monthly Pot: ₹{totalPot.toLocaleString('en-IN')}
            </h2>
          </div>

          <span
            className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase flex items-center gap-1 ${
              isOpen
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {isOpen ? '🟢 Bidding Open' : '🔒 Auction Closed'}
          </span>
        </div>

        {isOpen ? (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Highest Current Discount</span>
              <p className="text-2xl font-extrabold text-amber-400">
                ₹{highestBidDiscount.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Estimated Payout</span>
              <p className="text-2xl font-extrabold text-emerald-400">
                ₹{(totalPot - highestBidDiscount).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Winner Selected
              </span>
              <span className="font-extrabold text-white text-sm">{winnerName}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-emerald-800/60 pt-2">
              <span className="text-slate-300">Winning Discount:</span>
              <span className="font-bold text-amber-300">₹{winningDiscount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-emerald-800/60 pt-2">
              <span className="text-slate-300">Final Net Payout:</span>
              <span className="font-extrabold text-emerald-400 text-lg">₹{payoutAmount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
