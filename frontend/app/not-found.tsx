import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-3xl flex items-center justify-center">
        <FileQuestion className="w-8 h-8" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">404 - Page Not Found</h1>
        <p className="text-xs text-slate-500">
          The page or group resource you are looking for does not exist or has been moved.
        </p>
      </div>

      <Link href="/dashboard">
        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
