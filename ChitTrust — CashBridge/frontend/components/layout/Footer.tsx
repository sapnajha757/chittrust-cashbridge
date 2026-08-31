import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <div className="flex items-center justify-center space-x-2 text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>ChitTrust + CashBridge • Financial Inclusion Platform for India</span>
        </div>
        <p>Equal trust-scores for digital UPI and verified agent cash contributions.</p>
        <p className="text-slate-500">© 2026 ChitTrust. Hackathon Foundation Phase 1.</p>
      </div>
    </footer>
  );
}
