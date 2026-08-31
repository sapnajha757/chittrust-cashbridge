'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShieldCheck, HelpCircle } from 'lucide-react';
import { TrustScoreCard } from '@/components/trust/TrustScoreCard';
import { TrustScoreBreakdown, BreakdownItem } from '@/components/trust/TrustScoreBreakdown';
import { TrustScoreTimeline, ScoreEventItem } from '@/components/trust/TrustScoreTimeline';
import { AskChitTrustWidget } from '@/components/ai/AskChitTrustWidget';

export default function TrustScorePortalPage() {
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState<{
    score: number;
    baseScore: number;
    streak: number;
    onTime: number;
  }>({
    score: 105,
    baseScore: 100,
    streak: 1,
    onTime: 1,
  });

  const [breakdownItems, setBreakdownItems] = useState<BreakdownItem[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<ScoreEventItem[]>([]);

  useEffect(() => {
    async function loadTrustScoreData() {
      setLoading(true);
      try {
        const [scoreRes, historyRes, breakdownRes] = await Promise.all([
          fetch('/api/v1/users/me/trust-score'),
          fetch('/api/v1/users/me/trust-score/history'),
          fetch('/api/v1/users/me/trust-score/breakdown'),
        ]);

        if (scoreRes.ok) {
          const sData = await scoreRes.json();
          setScoreData({
            score: sData.score,
            baseScore: sData.base_score || 100,
            streak: sData.current_streak || 0,
            onTime: sData.total_on_time || 0,
          });
        }

        if (historyRes.ok) {
          const hData = await historyRes.json();
          setTimelineEvents(hData);
        } else {
          // Demo fallback
          setTimelineEvents([
            {
              id: 'te1',
              month_number: 1,
              payment_mode: 'upi',
              event_type: 'on_time',
              points: 5,
              score_after: 105,
              reason: 'On-time contribution (UPI) for Month 1 (+5)',
              created_at: new Date().toISOString(),
            },
          ]);
        }

        if (breakdownRes.ok) {
          const bData = await breakdownRes.json();
          setBreakdownItems(bData.breakdown_items || []);
        } else {
          // Demo fallback
          setBreakdownItems([
            { label: 'Base Starting Score', count: 1, points_per_unit: 100, total_points: 100 },
            { label: 'On-Time Contributions (UPI + Cash)', count: 1, points_per_unit: 5, total_points: 5 },
            { label: 'Late Contributions (≤ 7 days)', count: 0, points_per_unit: -5, total_points: 0 },
            { label: 'Late Contributions (> 7 days)', count: 0, points_per_unit: -10, total_points: 0 },
            { label: 'Missed Payments', count: 0, points_per_unit: -20, total_points: 0 },
            { label: '3-Month Consistency Streak Bonuses', count: 0, points_per_unit: 10, total_points: 0 },
          ]);
        }
      } catch (err) {
        console.error('Error loading trust score portal:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTrustScoreData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-600">Loading credit trust score portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/profile"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Profile
        </Link>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Auditable Credit Score Engine
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Credit Trust Score Portal</h1>
        <p className="text-xs text-slate-600">Transparent mathematical breakdown of your community contribution behavior.</p>
      </div>

      {/* Main Card */}
      <TrustScoreCard
        score={scoreData.score}
        currentStreak={scoreData.streak}
        onTimeCount={scoreData.onTime}
        showLink={false}
      />

      {/* Ask ChitTrust AI Explanation Assistant Widget */}
      <AskChitTrustWidget />

      {/* Mathematical Breakdown */}
      <TrustScoreBreakdown
        score={scoreData.score}
        baseScore={scoreData.baseScore}
        items={breakdownItems}
      />

      {/* Chronological Event Timeline */}
      <TrustScoreTimeline events={timelineEvents} />

      {/* Disclaimer */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-800">Legal & Product Disclaimer</p>
          <p className="mt-0.5 text-slate-500">
            Trust Score reflects contribution consistency within ChitTrust. It is not a bank credit score or guarantee of formal creditworthiness.
          </p>
        </div>
      </div>
    </div>
  );
}
