import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6 px-4">
      <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
      </Link>

      <div className="space-y-2 border-b border-slate-200 pb-4">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" /> Privacy & Data Handling Policy
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Notice</h1>
        <p className="text-xs text-slate-500">Effective Date: August 31, 2026 • ChitTrust + CashBridge Prototype</p>
      </div>

      <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4 text-slate-700">
        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-slate-900">1. Information We Collect</h2>
          <p>
            ChitTrust + CashBridge collects necessary operational data to facilitate community savings group transparency:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Profile Information:</strong> Name, phone number, role type, and regional district.</li>
            <li><strong>Contribution & Transaction Data:</strong> Payment modes (UPI / Doorstep Cash), transaction timestamps, and amount entries.</li>
            <li><strong>Photo Proofs:</strong> CashBridge Agents capture physical cash collection photo proofs stored in encrypted private Supabase Storage buckets.</li>
            <li><strong>Voice IVR Logs:</strong> Telephony call logs and Voice PIN authentication hashes.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-slate-900">2. How We Use Data</h2>
          <p>
            Data is strictly utilized for group contribution accounting, Trust Score calculations, auction payouts, and operational anomaly detection. Personal data is never sold to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-slate-900">3. Storage & Security</h2>
          <p>
            All media uploads are preserved in private Supabase Storage buckets accessible solely via short-lived signed URLs. Database records are protected by PostgreSQL Row Level Security (RLS).
          </p>
        </section>

        <section className="space-y-2 border-t border-slate-200 pt-4">
          <h2 className="text-base font-extrabold text-slate-900">4. Hackathon Prototype Notice</h2>
          <p className="text-slate-500">
            This platform is a technology prototype for financial inclusion. Actual savings group operations must comply with applicable local laws and regulations.
          </p>
        </section>
      </div>
    </div>
  );
}
