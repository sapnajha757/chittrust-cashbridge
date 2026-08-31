'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface VoicePinModalProps {
  onSuccess?: () => void;
}

export function VoicePinModal({ onSuccess }: VoicePinModalProps) {
  const [pin, setPin] = useState('1234');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetupPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/v1/voice/pin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to setup Voice PIN.');
      } else {
        setMessage('4-Digit Voice PIN configured successfully for IVR call authentication.');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error('Error setting Voice PIN:', err);
      setError('Network error configuring Voice PIN.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-md border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-600" /> Phone IVR Security & 4-Digit Voice PIN
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-xs text-slate-600">
          Configure a secret 4-digit PIN to authenticate your phone calls when querying your Trust Score over IVR.
        </p>

        <form onSubmit={handleSetupPin} className="space-y-3">
          <div>
            <label htmlFor="voice-pin" className="block text-xs font-bold text-slate-900 mb-1">
              4-Digit Voice Security PIN
            </label>
            <input
              id="voice-pin"
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border-2 border-slate-300 rounded-xl font-mono text-lg font-bold text-center tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {message}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800 font-bold">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" /> {error}
            </div>
          )}

          <Button type="submit" disabled={submitting} size="sm" className="text-xs font-bold">
            Update Voice PIN
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
