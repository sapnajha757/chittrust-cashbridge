'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, fetchUserProfile, fetchUserTrustScore } from '@/lib/supabase';
import { User, TrustScore } from '@/types';

const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Sunita Sharma (Demo User)',
  phone: '+919876543210',
  role: 'organizer',
  kyc_verified: true,
  region: 'Jaipur, RJ',
  created_at: new Date().toISOString(),
};

const DEMO_TRUST_SCORE: TrustScore = {
  user_id: '00000000-0000-0000-0000-000000000001',
  score: 785,
  tier: 'gold',
  digital_on_time_count: 12,
  cash_on_time_count: 4,
  late_count: 0,
  updated_at: new Date().toISOString(),
};

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  profile: User | null;
  trustScore: TrustScore | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  trustScore: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadUserData = useCallback(async (currentUserId: string) => {
    try {
      const [profData, scoreData] = await Promise.all([
        fetchUserProfile(currentUserId),
        fetchUserTrustScore(currentUserId),
      ]);
      setProfile(profData || DEMO_USER);
      setTrustScore(scoreData || DEMO_TRUST_SCORE);
    } catch (err) {
      console.error('Error loading auth user data:', err);
      setProfile(DEMO_USER);
      setTrustScore(DEMO_TRUST_SCORE);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadUserData(user.id);
    } else {
      setProfile(DEMO_USER);
      setTrustScore(DEMO_TRUST_SCORE);
    }
  }, [user?.id, loadUserData]);

  useEffect(() => {
    // Check if demo cookie or demo mode active
    const hasDemoCookie = typeof document !== 'undefined' && document.cookie.includes('chittrust_demo_session');

    // 1. Fetch initial session
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      setSession(initSession);
      setUser(initSession?.user ?? null);
      if (initSession?.user?.id) {
        loadUserData(initSession.user.id).finally(() => setLoading(false));
      } else {
        if (hasDemoCookie) {
          setProfile(DEMO_USER);
          setTrustScore(DEMO_TRUST_SCORE);
        }
        setLoading(false);
      }
    }).catch(() => {
      if (hasDemoCookie) {
        setProfile(DEMO_USER);
        setTrustScore(DEMO_TRUST_SCORE);
      }
      setLoading(false);
    });

    // 2. Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (currentSession?.user?.id) {
          await loadUserData(currentSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        if (typeof document !== 'undefined') {
          document.cookie = 'chittrust_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        setProfile(null);
        setTrustScore(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  const signOut = async () => {
    setLoading(true);
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'chittrust_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setTrustScore(null);
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        trustScore,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
