import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Banknote, QrCode, Award, ArrowRight, UserCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Equal Trust for Digital + Cash Members</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Empowering Community <span className="text-emerald-400">Chit Funds</span> with Digital Trust
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            ChitTrust bridges cash-based micro-savers and digital members. Pay online via UPI or hand cash to verified local CashBridge Agents with photo proof verification.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/groups">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold">
                Explore Chit Groups <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/agent">
              <Button size="lg" variant="cash">
                Agent Portal <UserCheck className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 User Types Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Four User Roles, One Trusted Ecosystem</h2>
          <p className="text-slate-600 text-sm">Designed for Indian community savings groups, self-help committees (SHGs), and local chits.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border-t-4 border-t-emerald-600">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>1. Organizer</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded font-medium">Admin</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              Manages chit groups, conducts monthly auctions, and ensures total transparency across all members.
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-blue-600">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>2. Digital Member</span>
                <QrCode className="w-5 h-5 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              Contributes via digital UPI/Razorpay payments seamlessly and tracks live cycle status.
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-amber-500">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>3. Cash Member</span>
                <Banknote className="w-5 h-5 text-amber-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              Hands cash to verified local agents. Instant photo proof guarantees equal trust score growth.
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-purple-600">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>4. CashBridge Agent</span>
                <UserCheck className="w-5 h-5 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              Verified doorstep agent collecting cash, uploading receipt photos, and digitizing offline payments.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="bg-emerald-50 rounded-2xl p-6 sm:p-8 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-600" /> Unified Trust Score
          </h3>
          <p className="text-slate-700 text-sm max-w-xl">
            Whether you contribute ₹2,000 via UPI or cash to an agent, your TrustScore builds equally — unlocking formal credit & micro-finance opportunities.
          </p>
        </div>
        <Link href="/profile">
          <Button className="whitespace-nowrap">View Your Trust Score</Button>
        </Link>
      </section>
    </div>
  );
}
