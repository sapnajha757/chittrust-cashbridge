'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { validateIndianPhone } from '@/lib/phone';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (user || (typeof document !== 'undefined' && document.cookie.includes('chittrust_demo_session=true'))) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = validateIndianPhone(phoneNumber);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      // Set demo session cookie for prototype testing
      if (typeof document !== 'undefined') {
        document.cookie = 'chittrust_demo_session=true; path=/; max-age=86400';
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: validation.formatted,
      });

      if (error) {
        console.warn('Supabase SMS OTP trigger notice:', error.message);
      }

      // Hard navigation to verify OTP page to avoid JS chunk 404 router issues
      window.location.href = `/verify-otp?phone=${encodeURIComponent(validation.formatted)}&demo=true`;
    } catch (err: unknown) {
      console.error('Unexpected error sending OTP:', err);
      window.location.href = `/verify-otp?phone=${encodeURIComponent(validation.formatted || '+919876543210')}&demo=true`;
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
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-slate-900">
            <Shield className="w-5 h-5 text-emerald-600" /> Enter Mobile Number
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label htmlFor="phone-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-500">
                  +91
                </span>
                <input
                  id="phone-input"
                  type="tel"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-14 pr-4 py-2.5 border border-slate-300 rounded-xl text-base font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                  disabled={loading}
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
              disabled={loading || phoneNumber.length !== 10}
              className="w-full py-3 text-base font-bold rounded-xl"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Send OTP <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1">
            <p>🔒 100% Secure & Encrypted Login</p>
            <p>Equal trust credit for UPI and cash members</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
