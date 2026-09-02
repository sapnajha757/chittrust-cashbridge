'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, fetchUserProfile, fetchUserTrustScore } from '@/lib/supabase';
import { User, TrustScore } from '@/types';

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
      setProfile(profData);
      setTrustScore(scoreData);
    } catch (err) {
      console.error('Error loading auth user data:', err);
      setProfile(null);
      setTrustScore(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadUserData(user.id);
    } else {
      setUser(null);
      setProfile(null);
      setTrustScore(null);
    }
  }, [user?.id, loadUserData]);

  useEffect(() => {
    // 1. Fetch initial session
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      setSession(initSession);
      if (initSession?.user?.id) {
        setUser(initSession.user);
        loadUserData(initSession.user.id).finally(() => setLoading(false));
      } else {
        setUser(null);
        setProfile(null);
        setTrustScore(null);
        setLoading(false);
      }
    }).catch(() => {
      setUser(null);
      setProfile(null);
      setTrustScore(null);
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

