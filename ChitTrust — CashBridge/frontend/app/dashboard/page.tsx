'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function DashboardRootPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!profile) {
      router.push('/onboarding');
      return;
    }

    if (profile.role === 'organizer') {
      router.push('/dashboard/organizer');
    } else if (profile.role === 'agent') {
      router.push('/dashboard/agent');
    } else {
      router.push('/dashboard/member');
    }
  }, [user, profile, loading, router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      <p className="text-sm font-medium text-slate-600">Loading your role dashboard...</p>
    </div>
  );
}
