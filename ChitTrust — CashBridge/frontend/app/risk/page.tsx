'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, CheckCircle2, Loader2, Info } from 'lucide-react';
import { RiskFlagCard } from '@/components/risk/RiskFlagCard';
import { ResolutionModal } from '@/components/risk/ResolutionModal';

export default function RiskDashboardPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState<any | null>(null);

  const loadRiskFlags = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/risk/flags');
      if (res.ok) {
        const data = await res.json();
        setFlags(data);
      }
    } catch (err) {
      console.error('Error fetching risk flags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiskFlags();
  }, []);

  const openFlags = flags.filter((f) => f.status === 'open');

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
          <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-700" /> Operational Risk & Review Engine
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Risk & Review Dashboard</h1>
        <p className="text-xs text-slate-600">
          Inspect operational review signals, duplicate contribution alerts, and agent volume anomalies.
        </p>
      </div>

      {/* Severity Counters */}
      <div className="grid grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-center space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-red-700">Critical</span>
          <p className="text-2xl font-extrabold text-red-900">0</p>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-amber-800">High</span>
          <p className="text-2xl font-extrabold text-amber-900">1</p>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-center space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-blue-800">Medium</span>
          <p className="text-2xl font-extrabold text-blue-900">1</p>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-slate-600">Low</span>
          <p className="text-2xl font-extrabold text-slate-900">0</p>
        </div>
      </div>

      {/* Product & Security Principle Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-800">Explainable Operational Review Signals</p>
          <p className="mt-0.5 text-slate-500">
            Risk flags represent operational anomaly signals requiring human review (titled <strong>&quot;Needs Review&quot;</strong>). Creating or reviewing a risk flag <strong>NEVER automatically alters or decreases a member&apos;s Trust Score</strong>.
          </p>
        </div>
      </div>

      {/* Risk Flags List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Pending Review Flags ({openFlags.length})</h2>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" /> Loading risk flags...
          </div>
        ) : flags.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
            No risk or review flags found. All operational checks clean.
          </div>
        ) : (
          <div className="space-y-3">
            {flags.map((flag) => (
              <RiskFlagCard
                key={flag.id}
                id={flag.id}
                type={flag.type}
                severity={flag.severity}
                score={flag.score}
                description={flag.description}
                memberName={flag.member_name}
                agentName={flag.agent_name}
                status={flag.status}
                onResolve={() => setSelectedFlag(flag)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {selectedFlag && (
        <ResolutionModal
          flagId={selectedFlag.id}
          flagType={selectedFlag.type}
          description={selectedFlag.description}
          onClose={() => setSelectedFlag(null)}
          onResolved={loadRiskFlags}
        />
      )}
    </div>
  );
}
