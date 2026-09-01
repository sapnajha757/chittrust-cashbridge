import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

export function PaymentProcessingState({ isOpen }: { isOpen: boolean }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-100">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Verifying Payment...</h3>
          <p className="text-xs text-slate-500">
            Performing cryptographic HMAC-SHA256 signature verification with Razorpay gateway servers.
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Server-Side Independent Payment Audit</span>
        </div>
      </div>
    </div>
  );
}
