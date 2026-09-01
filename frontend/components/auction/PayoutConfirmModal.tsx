'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Banknote, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface PayoutConfirmModalProps {
  payoutId: string;
  recipientName: string;
  amount: number;
  assignedAgentName: string;
  onConfirmed: () => void;
}

export function PayoutConfirmModal({
  payoutId,
  recipientName,
  amount,
  assignedAgentName,
  onConfirmed,
}: PayoutConfirmModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmPayout = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/payouts/${payoutId}/cash-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cash_proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to confirm cash payout.');
      } else {
        onConfirmed();
      }
    } catch (err) {
      console.error('Error confirming payout:', err);
      setError('Network error confirming doorstep cash handover.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-md border-emerald-200 bg-emerald-50/40">
      <CardHeader className="pb-3 border-b border-emerald-100">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Banknote className="w-5 h-5 text-emerald-600" /> Doorstep Cash Payout Handover
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 text-xs">
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">Recipient Winner:</span>
            <span className="font-bold text-slate-900 text-sm">{recipientName}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-t border-emerald-100">
            <span className="text-slate-500">Net Payout Amount:</span>
            <span className="font-extrabold text-emerald-700 text-base">
              ₹{amount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-t border-emerald-100">
            <span className="text-slate-500">Assigned CashBridge Agent:</span>
            <span className="font-bold text-slate-900 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {assignedAgentName}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          onClick={handleConfirmPayout}
          disabled={submitting}
          className="w-full py-3 font-extrabold text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow flex items-center justify-center gap-1.5"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Confirming Handover...
            </span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" /> Confirm Cash Handover Completed
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
