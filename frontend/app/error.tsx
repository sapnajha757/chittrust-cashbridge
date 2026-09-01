'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Something Went Wrong</h1>
        <p className="text-xs text-slate-500">
          An unexpected error occurred while processing your request. Please try again.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => reset()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" className="text-xs font-bold">
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
