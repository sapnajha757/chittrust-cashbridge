'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, MapPin, Award, CheckCircle2, AlertCircle } from 'lucide-react';

export interface AgentItem {
  id: string;
  name: string;
  phone_number: string;
  region: string;
  reputation_score: number;
  verified_status: string;
}

interface AgentSelectorProps {
  regionFilter?: string;
  selectedAgentId: string | null;
  onSelectAgent: (agent: AgentItem) => void;
}

export function AgentSelector({ regionFilter, selectedAgentId, onSelectAgent }: AgentSelectorProps) {
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch available agents from backend API or demo fallback
    async function loadAgents() {
      setLoading(true);
      try {
        const url = regionFilter ? `/api/v1/agents/available?region=${encodeURIComponent(regionFilter)}` : '/api/v1/agents/available';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setAgents(data);
        } else {
          setAgents([]);
        }
      } catch (err) {
        console.error('Error fetching agents:', err);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    }

    loadAgents();
  }, [regionFilter]);

  if (loading) {
    return <div className="text-xs text-slate-500 py-3 text-center">Loading verified agents...</div>;
  }

  if (agents.length === 0) {
    return (
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>No verified CashBridge Agent is available in this region yet. Please verify an agent in this region before adding cash members.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700">Assign Verified CashBridge Agent *</label>

      <div className="grid grid-cols-1 gap-2">
        {agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`p-3 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/60 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-xs">{agent.name}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Verified ✓
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {agent.region}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-amber-700">
                      <Award className="w-3 h-3 text-amber-500" /> Reputation: {agent.reputation_score}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isSelected ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
              }`}>
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
