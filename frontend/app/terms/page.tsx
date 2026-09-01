import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, AlertTriangle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6 px-4">
      <Link href="/" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
      </Link>

      <div className="space-y-2 border-b border-slate-200 pb-4">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
          <Scale className="w-3.5 h-3.5" /> Terms of Service & Legal Prototype Notice
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
        <p className="text-xs text-slate-500">Effective Date: August 31, 2026 • ChitTrust + CashBridge Prototype</p>
      </div>

      <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4 text-slate-700">
        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-slate-900">1. Technology Platform Prototype</h2>
          <p>
            ChitTrust + CashBridge is an open technology platform prototype designed to demonstrate transparent community savings management. It is <strong>not</strong> a bank, non-banking financial company (NBFC), registered chit fund, or credit bureau.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-slate-900">2. Compliance & Regulations</h2>
          <p>
            Community committees and organizers utilizing this software are responsible for complying with the <em>Chit Funds Act, 1982</em> and applicable state rules.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-extrabold text-slate-900">3. Trust Score Disclaimer</h2>
          <p>
            The ChitTrust Trust Score is a internal behavioral indicator measuring contribution timeliness and consistency. It does not guarantee formal bank credit or loan approvals.
          </p>
        </section>

        <section className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            <strong>Test Environment Notice:</strong> Payments processed in this prototype use Razorpay Test Mode only. No real money transactions are performed.
          </p>
        </section>
      </div>
    </div>
  );
}
