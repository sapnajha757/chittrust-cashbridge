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

    const hasDemoCookie = typeof document !== 'undefined' && document.cookie.includes('chittrust_demo_session');

    if (!user && !profile && !hasDemoCookie) {
      window.location.replace('/login');
      return;
    }

    const currentRole = profile?.role || 'organizer';
    const targetUrl =
      currentRole === 'organizer'
        ? '/dashboard/organizer'
        : currentRole === 'agent'
        ? '/dashboard/agent'
        : '/dashboard/member';

    window.location.replace(targetUrl);
  }, [user, profile, loading]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      <p className="text-sm font-medium text-slate-600">Loading your role dashboard...</p>
    </div>
  );
}
