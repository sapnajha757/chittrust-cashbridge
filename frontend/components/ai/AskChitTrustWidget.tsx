'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Send, Loader2, Sparkles, Volume2 } from 'lucide-react';

export function AskChitTrustWidget() {
  const [query, setQuery] = useState('Mera trust score kyun badha?');
  const [messages, setMessages] = useState<any[]>([
    {
      sender: 'assistant',
      text: 'Namaste! Main ChitTrust AI Assistant hoon. Aap apne Trust Score, payment status, ya auction result ke bare mein pooch sakte hain.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, language: 'hi' }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { sender: 'assistant', text: data.reply_text || data.summary }]);
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.detail || 'AI Assistant service is currently unavailable. Please verify API configuration.';
        setMessages((prev) => [...prev, { sender: 'assistant', text: `⚠️ ${errMsg}` }]);
      }
    } catch (err) {
      console.error('Error sending AI chat request:', err);
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: '⚠️ AI Assistant service is currently unavailable. Please try again later.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30">
      <CardHeader className="pb-3 border-b border-emerald-100 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Bot className="w-4 h-4 text-emerald-600" /> Ask ChitTrust (AI Assistant)
        </CardTitle>
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
          <Sparkles className="w-3 h-3 text-amber-600" /> Hindi / English Voice Support
        </span>
      </CardHeader>

      <CardContent className="pt-3 space-y-3">
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                m.sender === 'user'
                  ? 'ml-auto bg-slate-900 text-white font-medium'
                  : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
              }`}
            >
              {m.text}
            </div>
          ))}

          {loading && (
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2 max-w-[85%]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" /> AI is generating answer...
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Poochhein: 'Mera score kya hai?'"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
