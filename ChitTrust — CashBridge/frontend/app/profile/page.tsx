'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, MapPin, ShieldCheck, Award, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function ProfilePage() {
  const { profile, trustScore, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-12 text-slate-500 text-sm">Loading user profile...</div>;
  }

  const currentScore = trustScore?.score ?? 100;
  const scoreTier = trustScore?.tier ? trustScore.tier.toUpperCase() : 'STARTER';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-600">Manage your profile details, role preferences, and credit trust score.</p>
      </div>

      {/* Trust Score Banner */}
      <Card className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white border-0 shadow-md">
        <CardContent className="pt-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Credit Trust Score</span>
            <p className="text-3xl font-extrabold">{currentScore} <span className="text-xs text-slate-300 font-normal">({scoreTier})</span></p>
            <p className="text-xs text-slate-400">Equal credit weight for Cash and UPI payments.</p>
          </div>
          <Link href="/profile/trust-score">
            <Button size="sm" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold flex items-center gap-1">
              View Breakdown <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Basic Profile Information */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" /> Personal Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-500 font-medium">Full Name</span>
              <p className="font-bold text-slate-900 text-sm">{profile?.name || 'Chit Member'}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-500 font-medium">Verified Phone Number</span>
              <p className="font-bold text-slate-900 text-sm flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {profile?.phone || '+91 9876543210'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-500 font-medium">Platform Role</span>
              <p className="font-bold text-slate-900 text-sm capitalize flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> {profile?.role || 'member'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-500 font-medium">Registered Region</span>
              <p className="font-bold text-slate-900 text-sm flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {profile?.region || 'Jaipur Ward 12'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
