'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Banknote, ShieldCheck, Award, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AgentPerformancePage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgents() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/agents/analytics');
        if (res.ok) {
          const data = await res.json();
          setAgents(data);
        }
      } catch (err) {
        console.error('Error loading agent analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAgents();
  }, []);

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
          <Banknote className="w-3.5 h-3.5 mr-1 text-amber-700" /> CashBridge Agent Monitoring
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Agent Performance Portal</h1>
        <p className="text-xs text-slate-600">Doorstep cash collection volumes, reputation scores, and review flag metrics.</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900">Active CashBridge Agents ({agents.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" /> Loading agent metrics...
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {agents.map((agent) => (
                <div key={agent.agent_id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-sm">{agent.name}</p>
                    <p className="text-[11px] text-slate-500">{agent.region} • Verified Status: Active</p>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Doorstep Receipts</p>
                      <p className="font-extrabold text-slate-900">{agent.total_entries} entries</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Cash Handled</p>
                      <p className="font-extrabold text-emerald-700">₹{agent.total_amount_handled.toLocaleString('en-IN')}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Reputation</p>
                      <p className="font-extrabold text-amber-700 flex items-center justify-end gap-0.5">
                        <Award className="w-3.5 h-3.5 text-amber-600" /> {agent.reputation_score}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
