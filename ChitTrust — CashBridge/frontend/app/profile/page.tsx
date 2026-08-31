'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, ShieldCheck, User as UserIcon, Phone, MapPin, CheckCircle2, LogOut, Edit3, Save, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, trustScore, signOut, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setRegion(profile.region || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Name cannot be empty.');
      return;
    }

    setSaving(true);

    try {
      if (profile?.id) {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: name.trim(),
            region: region.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        if (error) {
          setErrorMessage('Could not update profile details.');
          setSaving(false);
          return;
        }

        await refreshProfile();
        setIsEditing(false);
      }
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const currentScore = trustScore?.score ?? 100;
  const scoreTier = trustScore?.tier ? trustScore.tier.toUpperCase() : 'STARTER';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Member Profile & Trust Score</h1>
          <p className="text-sm text-slate-600">Your verified account details, role permissions, and credit score.</p>
        </div>

        <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs flex items-center gap-1.5">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>

      {/* Trust Score Header Banner */}
      <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white border-0 shadow-lg">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-500/30">
                <Award className="w-3.5 h-3.5" />
                <span>{scoreTier} Tier Member</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                TrustScore: {currentScore} <span className="text-slate-400 text-lg font-normal">/ 850</span>
              </h2>
              <p className="text-xs text-slate-300">
                Equal credit weight applied to digital UPI payments and verified doorstep cash receipts.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur p-4 rounded-xl text-center space-y-1 min-w-[160px]">
              <span className="text-xs text-slate-300 block">On-Time Reliability</span>
              <span className="text-2xl font-bold text-emerald-400">98%</span>
              <span className="text-[10px] text-slate-400 block">{trustScore?.digital_on_time_count ?? 1} Cycles Paid</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Details & Edit Form */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-emerald-600" /> Account Details
          </CardTitle>

          {!isEditing ? (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="text-xs flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" /> Edit Basic Details
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="text-xs">
              Cancel
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isEditing ? (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{profile?.name || 'Member'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Mobile Number</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {profile?.phone || '+91 Member'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Account Role</span>
                <span className="font-bold text-emerald-700 capitalize bg-emerald-100 px-2.5 py-0.5 rounded">
                  {profile?.role || 'member'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Region / City</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {profile?.region || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">KYC Verification</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {profile?.kyc_verified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-medium">Account Created</span>
                <span className="text-slate-600">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Region / City</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  disabled={saving}
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                ⚠️ Role permissions, trust score, and KYC verification status are controlled by authorized security policies and cannot be self-edited.
              </div>

              <Button type="submit" disabled={saving} className="w-full text-xs py-2.5">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <Save className="w-4 h-4" /> Save Profile Details
                  </span>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
