'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, PhoneCall, ShieldCheck, HelpCircle } from 'lucide-react';
import { VoiceSimulatorCard } from '@/components/voice/VoiceSimulatorCard';
import { VoicePinModal } from '@/components/voice/VoicePinModal';

export default function VoiceDemoPortalPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/member"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <PhoneCall className="w-3.5 h-3.5 mr-1" /> Feature Phone Telephony Assistant
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Multilingual Voice IVR Simulator
        </h1>
        <p className="text-xs text-slate-600">
          Simulate Toll-Free phone calls in Hindi and English querying Trust Scores directly from the single database source of truth.
        </p>
      </div>

      {/* Main Voice Simulator Card */}
      <VoiceSimulatorCard />

      {/* Voice Security PIN Card */}
      <VoicePinModal />

      {/* Developer & Accessibility Info */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-800">Feature Phone Accessibility & Single Source of Truth</p>
          <p className="mt-0.5 text-slate-500">
            Voice IVR queries consume real contribution history and score snapshots from <strong>TrustScoreService</strong>. Cash and UPI payments receive 100% equal credit weight.
          </p>
        </div>
      </div>
    </div>
  );
}
