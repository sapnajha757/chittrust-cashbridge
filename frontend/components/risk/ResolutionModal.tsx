'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

interface ResolutionModalProps {
  flagId: string;
  flagType: string;
  description: string;
  onClose: () => void;
  onResolved: () => void;
}

export function ResolutionModal({
  flagId,
  flagType,
  description,
  onClose,
  onResolved,
}: ResolutionModalProps) {
  const [status, setStatus] = useState<'resolved' | 'dismissed'>('resolved');
  const [note, setNote] = useState('Reviewed photo proof & verified record authenticity.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/risk/flags/${flagId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          resolution_note: note,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to resolve risk flag.');
      } else {
        onResolved();
        onClose();
      }
    } catch (err) {
      console.error('Error resolving risk flag:', err);
      setError('Network error resolving risk flag.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">
            Resolve Review Flag: {flagType.replace(/_/g, ' ')}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-4 space-y-4 text-xs">
          <p className="text-slate-600 font-medium">{description}</p>

          <form onSubmit={handleResolve} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">Action Resolution</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('resolved')}
                  className={`flex-1 py-2 font-bold rounded-xl border text-xs ${
                    status === 'resolved' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Mark Resolved ✓
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('dismissed')}
                  className={`flex-1 py-2 font-bold rounded-xl border text-xs ${
                    status === 'dismissed' ? 'bg-slate-700 text-white border-slate-700' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Dismiss Flag
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="resolution-note" className="block text-xs font-bold text-slate-900 mb-1">
                Resolution Audit Note *
              </label>
              <textarea
                id="resolution-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-2.5 border-2 border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs font-bold">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} size="sm" className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Resolution'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
