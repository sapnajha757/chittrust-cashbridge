import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <div className="flex items-center justify-center space-x-2 text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>ChitTrust + CashBridge • Financial Inclusion Platform for India</span>
        </div>
        <p className="text-[11px] text-slate-400 max-w-2xl mx-auto">
          ChitTrust is a technology prototype for transparent community contribution management. Actual committee operations must comply with applicable Indian laws and registration requirements under the <em>Chit Funds Act, 1982</em>.
        </p>

        <div className="flex items-center justify-center space-x-4 text-[11px] font-semibold text-slate-400 pt-1">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link href="/dev/voice-demo" className="hover:text-amber-400 transition-colors">Voice Simulator</Link>
        </div>

        <p className="text-slate-500 text-[10px]">© 2026 ChitTrust + CashBridge. All rights reserved.</p>
      </div>
    </footer>
  );
}
