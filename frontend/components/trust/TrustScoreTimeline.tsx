import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { History, QrCode, Banknote, Flame, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface ScoreEventItem {
  id: string;
  month_number?: number;
  payment_mode?: string;
  event_type: string;
  points: number;
  score_after: number;
  reason: string;
  created_at: string;
}

interface TrustScoreTimelineProps {
  events: ScoreEventItem[];
}

export function TrustScoreTimeline({ events }: TrustScoreTimelineProps) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" /> Chronological Score Event Timeline
        </CardTitle>
      </CardHeader>

      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No score events recorded yet. Starting base score is 100.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {events.map((event) => {
              const isPositive = event.points >= 0;
              const isStreak = event.event_type === 'streak_bonus';
              const isCash = event.payment_mode === 'cash';

              return (
                <div key={event.id} className="relative flex items-start justify-between gap-4">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${
                    isStreak ? 'border-amber-500 text-amber-500' : isPositive ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'
                  }`}>
                    {isStreak ? <Flame className="w-3 h-3 fill-amber-500" /> : isPositive ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-xs">{event.reason}</p>
                      {event.payment_mode && (
                        isCash ? (
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded">
                            <Banknote className="w-3 h-3 text-amber-600" /> Cash Mode
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                            <QrCode className="w-3 h-3 text-blue-600" /> UPI Mode
                          </span>
                        )
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {new Date(event.created_at).toLocaleDateString()} • Resulting Score: <strong className="text-slate-900">{event.score_after}</strong>
                    </p>
                  </div>

                  <span className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded ${
                    isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isPositive ? `+${event.points}` : event.points}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
