'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, Users, ShieldCheck, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [region, setRegion] = useState('');
  const [selectedRole, setSelectedRole] = useState<'member' | 'organizer' | 'agent'>('member');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!region.trim()) {
      setErrorMessage('Please enter your city/region (e.g., Jaipur Ward 14).');
      return;
    }

    setLoading(true);

    try {
      const currentUserId = user?.id || '00000000-0000-0000-0000-000000000003'; // Fallback for local demo testing if session isn't persisted
      const currentPhone = user?.phone || '+919876543210';

      // Determine DB user_type enum
      const dbUserType = selectedRole === 'organizer' ? 'organizer' : selectedRole === 'agent' ? 'agent' : 'member';

      // 1. Insert/Update Profiles Table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUserId,
          name: fullName.trim(),
          phone_number: currentPhone,
          user_type: dbUserType,
          region: region.trim(),
          kyc_verified: false,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
        setErrorMessage('Could not save your profile. Please try again.');
        setLoading(false);
        return;
      }

      // 2. If Agent selected -> Create pending Agent application record
      if (selectedRole === 'agent') {
        const { error: agentError } = await supabase
          .from('agents')
          .upsert({
            id: currentUserId,
            verified_status: 'pending',
            total_entries: 0,
            total_amount_handled: 0,
            reputation_score: 100,
          });

        if (agentError) {
          console.warn('Agent record creation note:', agentError.message);
        }

        await refreshProfile();
        router.push('/agent/pending');
        return;
      }

      // 3. Refresh profile and redirect to role dashboard
      await refreshProfile();

      if (selectedRole === 'organizer') {
        router.push('/dashboard/organizer');
      } else {
        router.push('/dashboard/member');
      }
    } catch (err: unknown) {
      console.error('Onboarding submission exception:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Complete Your Profile</h1>
        <p className="text-sm text-slate-600">Set up your identity and choose how you participate in ChitTrust.</p>
      </div>

      <Card className="shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Account Onboarding
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="full-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                id="full-name"
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                disabled={loading}
              />
            </div>

            {/* Region / City */}
            <div>
              <label htmlFor="region-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                City / Region
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="region-input"
                  type="text"
                  placeholder="e.g. Jaipur Ward 14"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Role Selection Options */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Select How You Will Participate</label>

              <div className="grid grid-cols-1 gap-3">
                {/* Member */}
                <div
                  onClick={() => setSelectedRole('member')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                    selectedRole === 'member'
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Users className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Chit Member</p>
                    <p className="text-xs text-slate-600">I participate in a savings group (via UPI or Cash Agent)</p>
                  </div>
                </div>

                {/* Organizer */}
                <div
                  onClick={() => setSelectedRole('organizer')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                    selectedRole === 'organizer'
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Chit Organizer</p>
                    <p className="text-xs text-slate-600">I manage community savings groups and auctions</p>
                  </div>
                </div>

                {/* CashBridge Agent */}
                <div
                  onClick={() => setSelectedRole('agent')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                    selectedRole === 'agent'
                      ? 'border-amber-500 bg-amber-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <UserCheck className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">CashBridge Agent</p>
                    <p className="text-xs text-slate-600">I collect doorstep cash payments & upload photo receipts (Requires Review)</p>
                  </div>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base font-bold rounded-xl"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Profile...
                </span>
              ) : (
                'Complete Setup & Enter Dashboard'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
