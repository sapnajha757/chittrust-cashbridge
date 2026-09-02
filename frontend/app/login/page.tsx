'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, AlertCircle, Loader2, ShieldCheck, Lock, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';

export default function LoginPage() {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');
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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. user@example.com).');
      return;
    }

    setLoading(true);

    try {
      // Real Supabase Email OTP authentication request
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        console.error('Supabase Email OTP error:', error.message);
        let userMsg = error.message || 'Failed to send verification code. Please try again.';
        if (error.message?.includes('magic link email') || error.status === 500) {
          userMsg = 'Supabase Cloud email rate limit reached or custom SMTP unconfigured. Switch to Password Mode below for instant login!';
        }
        setErrorMessage(userMsg);
        setLoading(false);
        return;
      }

      // Navigate to verification screen with normalized email
      window.location.href = `/verify-otp?email=${encodeURIComponent(normalizedEmail)}`;
    } catch (err: unknown) {
      console.error('Unexpected error sending email OTP:', err);
      setErrorMessage('An unexpected error occurred. Please check your network connection.');
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      // Try signing in with existing password
      const signInRes = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      if (signInRes.data?.session) {
        window.location.href = '/dashboard';
        return;
      }

      // If user doesn't exist yet, sign up automatically with password
      if (signInRes.error) {
        const signUpRes = await supabase.auth.signUp({
          email: normalizedEmail,
          password: password,
        });

        if (signUpRes.error) {
          setErrorMessage(signUpRes.error.message || 'Authentication failed.');
          setLoading(false);
          return;
        }

        if (signUpRes.data?.session) {
          window.location.href = '/dashboard';
          return;
        }
      }

      window.location.href = `/verify-otp?email=${encodeURIComponent(normalizedEmail)}`;
    } catch (err: unknown) {
      console.error('Password auth exception:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center font-extrabold text-slate-950 text-2xl mx-auto shadow-md">
          ₹
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome to ChitTrust</h1>
        <p className="text-sm text-slate-600">Secure community savings for everyone.</p>
      </div>

      <Card className="shadow-lg border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2 text-slate-900">
              {authMode === 'otp' ? (
                <>
                  <Mail className="w-5 h-5 text-emerald-600" /> Enter Email Address
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-emerald-600" /> Email & Password Login
                </>
              )}
            </CardTitle>

            {/* Auth Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setAuthMode('otp')}
                className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-colors ${
                  authMode === 'otp' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Email OTP
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('password')}
                className={`px-2.5 py-1 text-xs font-extrabold rounded-lg transition-colors ${
                  authMode === 'password' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Password
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {authMode === 'otp' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
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

              {errorMessage && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span>{errorMessage}</span>
                    {errorMessage.includes('rate limit') && (
                      <button
                        type="button"
                        onClick={() => setAuthMode('password')}
                        className="block font-extrabold text-emerald-700 underline text-xs mt-1"
                      >
                        ⚡ Switch to Instant Password Login
                      </button>
                    )}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending Email OTP...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send OTP <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="email-input-pass" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email-input-pass"
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

              <div>
                <label htmlFor="password-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-base font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                    disabled={loading}
                    autoComplete="current-password"
                    required
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
                disabled={loading || !email.trim() || password.length < 6}
                className="w-full py-3 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" /> Authenticating with Supabase...
                  </span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" /> Sign In / Register
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1">
            <p className="flex items-center justify-center gap-1 font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Real Supabase Auth Single Source of Truth
            </p>
            <p>Equal trust credit for UPI and doorstep cash members</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
