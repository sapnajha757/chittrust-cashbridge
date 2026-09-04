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

  const saveFallbackSession = (email: string): Session => {
    const mockUser = {
      id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: email.trim(),
      app_metadata: { provider: 'email' },
      user_metadata: { email: email.trim() },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    const mockSession: Session = {
      access_token: `token_${Date.now()}`,
      token_type: 'bearer',
      expires_in: 86400,
      refresh_token: `refresh_${Date.now()}`,
      user: mockUser as any,
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('chittrust_demo_session', JSON.stringify(mockSession));
        document.cookie = 'sb-auth-token=true; path=/; max-age=31536000; SameSite=Lax';
        document.cookie = 'chittrust_demo_session=true; path=/; max-age=31536000; SameSite=Lax';
      } catch (e) {
        console.warn('[Auth] Failed to persist fallback session:', e);
      }
    }
    return mockSession;
  };

  const clearFallbackSession = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('chittrust_demo_session');
        document.cookie = 'sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
        document.cookie = 'chittrust_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      } catch (e) {
        console.warn('[Auth] Failed to clear fallback session:', e);
      }
    }
  };

  useEffect(() => {
    // 1. Fetch initial session
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (initSession?.user?.id) {
        setSession(initSession);
        setUser(initSession.user);
        loadUserData(initSession.user.id).finally(() => setLoading(false));
      } else {
        // Restore local persistent session fallback (Nyaya-AI style zero-fail)
        const stored = typeof window !== 'undefined' ? localStorage.getItem('chittrust_demo_session') : null;
        if (stored) {
          try {
            const parsedSession = JSON.parse(stored) as Session;
            setSession(parsedSession);
            setUser(parsedSession.user ?? null);
          } catch {
            clearFallbackSession();
            setUser(null);
            setProfile(null);
            setTrustScore(null);
          }
        } else {
          setUser(null);
          setProfile(null);
          setTrustScore(null);
        }
        setLoading(false);
      }
    }).catch(() => {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('chittrust_demo_session') : null;
      if (stored) {
        try {
          const parsedSession = JSON.parse(stored) as Session;
          setSession(parsedSession);
          setUser(parsedSession.user ?? null);
        } catch {}
      }
      setLoading(false);
    });

    // 2. Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user ?? null);
        if (currentSession.user?.id) {
          await loadUserData(currentSession.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        clearFallbackSession();
        setUser(null);
        setSession(null);
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
    } catch (err) {
      console.warn('Error signing out:', err);
    } finally {
      clearFallbackSession();
      setUser(null);
      setSession(null);
      setProfile(null);
      setTrustScore(null);
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

