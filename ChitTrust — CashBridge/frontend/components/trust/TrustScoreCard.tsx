import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Flame, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';

interface TrustScoreCardProps {
  score: number;
  currentStreak?: number;
  onTimeCount?: number;
  showLink?: boolean;
}

export function TrustScoreCard({
  score,
  currentStreak = 0,
  onTimeCount = 0,
  showLink = true,
}: TrustScoreCardProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white border-0 shadow-xl overflow-hidden relative">
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> ChitTrust Score
            </span>
            <p className="text-xs text-slate-300 font-medium pt-1">Community Contribution Rating</p>
          </div>

          {currentStreak > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" /> {currentStreak} Month Streak
            </span>
          )}
        </div>

        <div className="flex items-baseline space-x-3 py-2">
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">{score}</span>
          <span className="text-xs text-slate-400 font-medium">/ 1000 Max Score</span>
        </div>

        <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-xs space-y-1">
          <p className="font-semibold text-slate-200 flex items-center justify-between">
            <span>Payment Consistency:</span>
            <span className="text-emerald-400 font-bold">High Reliability</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Cash & UPI contributions receive identical credit weight.
          </p>
        </div>

        {showLink && (
          <Link href="/profile/trust-score">
            <Button size="sm" variant="outline" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold flex items-center justify-center gap-1 mt-2">
              View Itemized Score Breakdown <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
