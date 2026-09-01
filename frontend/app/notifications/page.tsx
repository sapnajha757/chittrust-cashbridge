'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, CheckCircle2, Loader2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function MemberNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/v1/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/member"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>

        <Button
          size="sm"
          variant="outline"
          onClick={handleMarkAllRead}
          className="text-xs font-bold flex items-center gap-1"
        >
          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> Mark All as Read
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notification Center</h1>
        <p className="text-xs text-slate-600">In-app alerts for payment receipts, auctions, and trust score updates.</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="pt-4">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">You have no notifications.</p>
          ) : (
            <div className="divide-y divide-slate-100 space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`pt-3 flex items-start gap-3 text-xs ${
                    n.read ? 'opacity-60' : 'font-medium'
                  }`}
                >
                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-slate-900 text-xs">{n.title}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
