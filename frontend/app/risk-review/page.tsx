'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, Loader2, Sparkles, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ResolutionModal } from '@/components/risk/ResolutionModal';

export default function AIRiskReviewPortalPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<any | null>(null);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/ai/risk-assessments');
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
      }
    } catch (err) {
      console.error('Error loading AI risk assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  const openAssessments = assessments.filter((a) => a.status === 'open');

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/organizer"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Organizer Dashboard
        </Link>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-700" /> AI Trust Intelligence Layer
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Risk Review Portal</h1>
        <p className="text-xs text-slate-600">
          Inspect 0–100 AI Risk Scores, statistical confidence metrics, evidence JSON payloads, and human review actions.
        </p>
      </div>

      {/* AI Principles Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-800">Human-in-the-Loop Governance Model</p>
          <p className="mt-0.5 text-slate-500">
            The AI risk engine evaluates baseline deviations and outputs explainable signals (titled <strong>&quot;Needs Review&quot;</strong>). AI risk flags <strong>NEVER automatically alter or reduce a member&apos;s Trust Score</strong>.
          </p>
        </div>
      </div>

      {/* Assessments List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Pending AI Assessments ({openAssessments.length})</h2>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" /> Loading AI assessments...
          </div>
        ) : assessments.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
            No AI risk assessments requiring review.
          </div>
        ) : (
          <div className="space-y-3">
            {assessments.map((a) => (
              <Card key={a.id} className="shadow-sm border-amber-200 bg-amber-50/20">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900">
                        Needs Review • {a.risk_score}/100 Risk Score
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-blue-800 bg-blue-50">
                        {Math.round(a.confidence * 100)}% Confidence
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase">{a.status}</span>
                  </div>
                  <CardTitle className="text-sm font-extrabold text-slate-900 mt-1">
                    {a.risk_type.replace(/_/g, ' ')}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <p className="text-slate-700 font-medium leading-relaxed">{a.explanation}</p>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1 text-[11px]">
                    <p><strong className="text-slate-900">Recommended Action:</strong> {a.recommended_action}</p>
                    {a.agent_name && <p><strong className="text-slate-900">Agent:</strong> {a.agent_name}</p>}
                    {a.member_name && <p><strong className="text-slate-900">Member:</strong> {a.member_name}</p>}
                  </div>

                  {a.status === 'open' && (
                    <Button
                      size="sm"
                      onClick={() => setSelectedFlag(a)}
                      className="w-full py-2 font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                    >
                      Review Evidence & Resolve Flag →
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {selectedFlag && (
        <ResolutionModal
          flagId={selectedFlag.id}
          flagType={selectedFlag.risk_type}
          description={selectedFlag.explanation}
          onClose={() => setSelectedFlag(null)}
          onResolved={loadAssessments}
        />
      )}
    </div>
  );
}
