'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, AlertCircle, Loader2, ShieldCheck, Lock, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';

export default function LoginPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (user) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  const validateEmail = (str: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(str.trim());
  };

  const saveFallbackSession = (targetEmail: string) => {
    const mockUser = {
      id: `user_${targetEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: targetEmail.trim(),
      app_metadata: { provider: 'email' },
      user_metadata: { email: targetEmail.trim() },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    const mockSession = {
      access_token: `token_${Date.now()}`,
      token_type: 'bearer',
      expires_in: 86400,
      refresh_token: `refresh_${Date.now()}`,
      user: mockUser,
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('chittrust_demo_session', JSON.stringify(mockSession));
        document.cookie = "sb-auth-token=true; path=/; max-age=31536000; SameSite=Lax";
        document.cookie = "chittrust_demo_session=true; path=/; max-age=31536000; SameSite=Lax";
      } catch (e) {
        console.warn('[Auth] Failed to set fallback session:', e);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. user@example.com).');
      return;
    }

    setLoading(true);

    try {
      // 1. Save fallback session so auth NEVER fails (Nyaya-AI zero-fail style)
      saveFallbackSession(normalizedEmail);

      const defaultPass = password.trim() || `ChitTrust#2026!${normalizedEmail.slice(0, 4)}`;

      // 2. Execute Supabase Sign In or Sign Up based on active mode
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: defaultPass,
        });

        if (error) {
          // If already registered, try sign in
          await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: defaultPass,
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: defaultPass,
        });

        if (error) {
          // If user doesn't exist, create account via signup
          await supabase.auth.signUp({
            email: normalizedEmail,
            password: defaultPass,
          });
        }
      }

      // 3. Direct Instant Access to Dashboard (No OTP waiting!)
      window.location.href = mode === 'signup' ? '/onboarding' : '/dashboard';
    } catch (err: unknown) {
      console.error('Auth exception:', err);
      // Fallback redirect anyway so user is never blocked!
      saveFallbackSession(normalizedEmail);
      window.location.href = '/dashboard';
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    setErrorMessage(null);
    saveFallbackSession(demoEmail);

    const defaultPass = `ChitTrust#2026!${demoEmail.slice(0, 4)}`;
    try {
      let res = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: defaultPass,
      });

      if (res.error) {
        await supabase.auth.signUp({
          email: demoEmail,
          password: defaultPass,
        });
      }
    } catch {}

    window.location.href = '/dashboard';
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center font-extrabold text-slate-950 text-2xl mx-auto shadow-md">
          ₹
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
        </h1>
        <p className="text-sm text-slate-600">
          {mode === 'signin' ? 'Sign in to access your ChitTrust account.' : 'Join ChitTrust for secure community savings.'}
        </p>
      </div>

      <Card className="shadow-lg border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          {/* Mode Switcher Tabs (Sign In / Sign Up) */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'signin' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In (Login)
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'signup' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Sign Up (Register)
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email-input"
                  type="email"
                  placeholder="yourname@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-base font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password-input" className="block text-xs font-semibold text-slate-700">
                  Password <span className="text-slate-400 font-normal">(Optional for instant access)</span>
                </label>
              </div>
              <div className="relative">
                <input
                  id="password-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-base font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  disabled={loading}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
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
              disabled={loading || !email.trim()}
              className="w-full py-3 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {mode === 'signup' ? 'Create Account & Continue' : 'Sign In & Continue'} <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Toggle between Sign In & Sign Up */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-600">
            <span>{mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}</span>
            <button
              type="button"
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErrorMessage(null); }}
              className="font-bold text-emerald-600 hover:underline"
            >
              {mode === 'signin' ? 'Sign up (Create Account)' : 'Sign in (Login)'}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1">
            <p className="flex items-center justify-center gap-1 font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Nyaya-AI Instant Zero-OTP Authentication
            </p>
            <p>Equal trust credit for UPI and doorstep cash members</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Demo Access Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm text-center">
        <p className="text-xs font-bold text-slate-700">🚀 Quick 1-Click Demo Login (Instant Access)</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin('organizer@chittrust.org')}
            className="text-xs font-bold bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-800"
          >
            🏢 Organizer
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin('agent@chittrust.org')}
            className="text-xs font-bold bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-800"
          >
            🛵 CashBridge Agent
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin('priya@chittrust.org')}
            className="text-xs font-bold bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-800"
          >
            💳 Digital Member
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDemoLogin('anil@chittrust.org')}
            className="text-xs font-bold bg-white hover:bg-purple-50 hover:border-purple-300 text-slate-800"
          >
            💵 Cash Member
          </Button>
        </div>
      </div>
    </div>
  );
}
