import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, QrCode, Banknote, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';

export function HeroDemoCard() {
  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white border-0 shadow-2xl overflow-hidden relative">
      <CardContent className="p-6 space-y-4">
        {/* Header Badge */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Live Verifiable Shared Ledger
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1">Shakti Community Committee</h3>
          </div>

          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-extrabold">
            ₹10,000 Monthly Pot
          </span>
        </div>

        {/* 10-Second Visual Preview Progress */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-blue-300 font-bold">
              <span className="flex items-center gap-1"><QrCode className="w-3.5 h-3.5" /> Sita (Digital)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-lg font-extrabold text-white">₹1,000 Paid via UPI</p>
            <p className="text-[10px] text-emerald-400 font-semibold">+5 Points • Trust Score 125</p>
          </div>

          <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
              <span className="flex items-center gap-1"><Banknote className="w-3.5 h-3.5" /> Rahul (Cash)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-lg font-extrabold text-white">₹1,000 Cash + Proof</p>
            <p className="text-[10px] text-emerald-400 font-semibold">+5 Points • Equal Credit Weight</p>
          </div>
        </div>

        {/* AI Insight Bar */}
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-amber-200">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Insight: 94% on-time consistency. Month 3 Bidding open.
          </span>
          <span className="text-[10px] font-bold text-amber-400 uppercase">Verified</span>
        </div>
      </CardContent>
    </Card>
  );
}
