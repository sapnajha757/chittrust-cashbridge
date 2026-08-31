'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HeroDemoCard } from '@/components/landing/HeroDemoCard';
import { ComparisonTable } from '@/components/landing/ComparisonTable';
import { ShieldCheck, Users, Banknote, QrCode, Trophy, PhoneCall, Sparkles, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-16 py-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-4">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-extrabold uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Financial Inclusion Platform for India
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Transparent Community Finance. <span className="text-emerald-600">Built for both Cash and UPI.</span>
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            ChitTrust brings digital and cash-paying members into one transparent, verifiable community ledger with equal credit trust scores, doorstep photo verification, and Hindi Voice IVR.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/groups/create">
              <Button size="lg" className="w-full sm:w-auto py-3 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2">
                Create a Group <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto py-3 px-8 border-2 border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-sm rounded-xl">
                Join a Group
              </Button>
            </Link>
          </div>

          <div className="flex items-center space-x-6 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-200">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Razorpay Test UPI</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Doorstep Cash Proof</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Hindi Voice IVR</span>
          </div>
        </div>

        {/* Hero Visual 10-Second Demo Preview Card */}
        <HeroDemoCard />
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">One Platform. Complete Inclusion.</h2>
          <p className="text-xs text-slate-500">Built specifically for informal and semi-formal community savings groups across urban and rural India.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-slate-200 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center mb-2">
                <Banknote className="w-5 h-5 text-emerald-600" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900">CashBridge Agent System</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1">
              <p>Verified agents collect doorstep cash contributions from cash-based members with mandatory photo proof uploads to private storage.</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center mb-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900">Equal Trust Score Engine</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1">
              <p>Cash and digital payments receive identical credit status (+5 points). No member is penalized merely for paying in cash.</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-xl flex items-center justify-center mb-2">
                <PhoneCall className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900">Feature Phone Voice IVR</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-1">
              <p>Users call a normal phone number to check Trust Scores, payment status, and auction results in natural Hindi/Hinglish.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Comparison Table Section */}
      <ComparisonTable />

      {/* Frequently Asked Questions */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500">Everything you need to know about ChitTrust + CashBridge.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Does cash payment lower my Trust Score?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              No! Verified cash payments recorded by CashBridge Agents receive identical trust credit (+5 points) as digital Razorpay UPI payments.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" /> How does the monthly auction work?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Eligible group members submit bid discounts. The highest valid discount wins the pot, generating an exact net payout (Total Pot - Winning Discount).
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl text-center space-y-4 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ready to Build Trust in Your Community?</h2>
        <p className="text-xs text-slate-300 max-w-xl mx-auto">
          Start managing your community savings group with 100% verifiability, cash inclusion, and explainable credit scores.
        </p>

        <div className="pt-2">
          <Link href="/groups/create">
            <Button size="lg" className="py-3 px-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm rounded-xl shadow">
              Create Your First Group Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
