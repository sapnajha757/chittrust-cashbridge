import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, ShieldCheck, User, Phone, Mail, CheckCircle2, History, Banknote, QrCode } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Member Profile & Trust Score</h1>
          <p className="text-sm text-slate-600">Your unified credit & trust score build-up from digital and cash contributions.</p>
        </div>
      </div>

      {/* Trust Score Header */}
      <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white border-0 shadow-lg">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-500/30">
                <Award className="w-3.5 h-3.5" />
                <span>Gold Tier Member</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">TrustScore: 745 <span className="text-slate-400 text-lg font-normal">/ 850</span></h2>
              <p className="text-xs text-slate-300">
                Equal credit weight applied to digital payments and verified cash agent receipts.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur p-4 rounded-xl text-center space-y-1 min-w-[160px]">
              <span className="text-xs text-slate-300 block">On-Time Reliability</span>
              <span className="text-2xl font-bold text-emerald-400">98%</span>
              <span className="text-[10px] text-slate-400 block">12 of 12 Cycles Paid</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Breakdown & User Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" /> Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Full Name</span>
              <span className="font-semibold text-slate-900">Rajesh Sharma</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Mobile Number</span>
              <span className="font-semibold text-slate-900">+91 98765 43210</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Primary Contribution Preference</span>
              <span className="font-semibold text-amber-600">Doorstep Cash (Agent Verified)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">KYC Status</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Aadhaar Verified
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" /> Contribution Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-slate-900">Digital UPI Payments</p>
                  <p className="text-[10px] text-slate-500">Directly via Razorpay Gateway</p>
                </div>
              </div>
              <span className="font-bold text-slate-900 text-sm">6 Payments</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Banknote className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-slate-900">Verified Cash Agent Receipts</p>
                  <p className="text-[10px] text-slate-500">Photo Proof Verified by CashBridge</p>
                </div>
              </div>
              <span className="font-bold text-slate-900 text-sm">6 Receipts</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
