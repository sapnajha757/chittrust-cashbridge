'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase, fetchUserProfile } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || searchParams.get('phone') || '';

  const { refreshProfile } = useAuth();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const token = otp.join('');
    if (token.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code sent to your email.');
      return;
    }

    setLoading(true);

    try {
      // Real Supabase Auth verification for Email OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: token,
        type: 'email',
      });

      if (error) {
        console.error('Supabase Email OTP verification error:', error.message);
        setErrorMessage(error.message || 'Invalid or expired verification code.');
        setLoading(false);
        return;
      }

      const userId = data?.user?.id;
      if (userId) {
        const profile = await fetchUserProfile(userId);
        await refreshProfile();
        if (profile) {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/onboarding';
        }
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      console.error('OTP verification exception:', err);
      setErrorMessage('Failed to verify code. Please check your internet connection.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    setErrorMessage(null);
    setResendCooldown(30);

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setErrorMessage(error.message || 'Failed to resend email code.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/login"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Change Email Address
        </Link>
      </div>

      <Card className="shadow-lg border-slate-200">
        <CardHeader className="text-center pb-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-extrabold text-slate-900">Verify Email Address</CardTitle>
          <p className="text-xs text-slate-600 mt-1">
            Enter the 6-digit verification code sent to <span className="font-bold text-slate-900">{email || 'your email'}</span>
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            {/* 6 Digit OTP Inputs */}
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  disabled={loading}
                />
              ))}
            </div>

            {errorMessage && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3 text-base font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying & Redirecting...
                </span>
              ) : (
                'Verify & Continue'
              )}
            </Button>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>Didn&apos;t receive code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="font-semibold text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto py-12 text-center text-slate-500 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" /> Loading OTP verification...
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
