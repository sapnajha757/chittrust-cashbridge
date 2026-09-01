'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhoneCall, PhoneOff, Mic, Volume2, ShieldCheck, Flame, Lock } from 'lucide-react';

export function VoiceSimulatorCard() {
  const [inCall, setInCall] = useState(false);
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [pin, setPin] = useState('1234');
  const [authenticated, setAuthenticated] = useState(false);

  const [promptText, setPromptText] = useState<string>('');
  const [spokenHindi, setSpokenHindi] = useState<string | null>(null);
  const [retrievedScore, setRetrievedScore] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [transcriptHistory, setTranscriptHistory] = useState<
    { speaker: 'system' | 'user'; text: string }[]
  >([]);

  const handleStartCall = async () => {
    setLoading(true);
    setInCall(true);
    setTranscriptHistory([]);
    setRetrievedScore(null);
    setSpokenHindi(null);

    try {
      const res = await fetch('/api/v1/voice/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
      const data = await res.json();
      setPromptText(data.prompt_text);
      setTranscriptHistory([
        { speaker: 'system', text: data.prompt_text },
      ]);
    } catch (err) {
      console.error('Error starting simulated call:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInput = async (dtmfDigit?: string, speechText?: string) => {
    if (!inCall) return;
    setLoading(true);

    const userLabel = dtmfDigit ? `Pressed Digit [ ${dtmfDigit} ]` : `Spoke: "${speechText}"`;
    setTranscriptHistory((prev) => [...prev, { speaker: 'user', text: userLabel }]);

    try {
      const res = await fetch('/api/v1/voice/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          pin,
          dtmf_digit: dtmfDigit,
          speech_text: speechText,
        }),
      });

      const data = await res.json();
      setPromptText(data.prompt_text);
      if (data.spoken_hindi) setSpokenHindi(data.spoken_hindi);
      if (data.trust_score !== undefined) setRetrievedScore(data.trust_score);

      setTranscriptHistory((prev) => [...prev, { speaker: 'system', text: data.prompt_text }]);

      if (data.ended) {
        setInCall(false);
      }
    } catch (err) {
      console.error('Error processing voice input:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = () => {
    setInCall(false);
    setPromptText(language === 'hi' ? 'Call samapt ho gaya hai.' : 'Call ended.');
    setTranscriptHistory((prev) => [...prev, { speaker: 'system', text: 'Call Ended.' }]);
  };

  return (
    <Card className="shadow-xl border-emerald-200 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white overflow-hidden relative">
      <CardHeader className="pb-3 border-b border-slate-700/60">
        <div className="flex justify-between items-center">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
              <PhoneCall className="w-3 h-3" /> Voice IVR Simulator — Demo Mode
            </span>
            <CardTitle className="text-lg font-extrabold text-white mt-1">Feature Phone Voice Assistant</CardTitle>
          </div>

          {/* Language Toggle */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-colors ${
                language === 'hi' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-colors ${
                language === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Call State Header */}
        {!inCall ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <PhoneCall className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-200">Dial ChitTrust Toll-Free IVR</p>
              <p className="text-xs text-slate-400">Simulate a phone call to query your Credit Trust Score in Hindi.</p>
            </div>

            <Button
              onClick={handleStartCall}
              disabled={loading}
              className="py-3 px-8 text-sm font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-lg"
            >
              📞 Start Simulated IVR Call
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Call Bar */}
            <div className="flex justify-between items-center bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-xs">
              <span className="flex items-center gap-2 font-bold text-emerald-400">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                Call Connected • Toll-Free
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEndCall}
                className="text-xs font-bold bg-red-600 text-white border-red-500 hover:bg-red-700 flex items-center gap-1"
              >
                <PhoneOff className="w-3.5 h-3.5" /> End Call
              </Button>
            </div>

            {/* Live Transcript Screen */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 max-h-56 overflow-y-auto text-xs">
              {transcriptHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${
                    item.speaker === 'system' ? 'text-emerald-300' : 'text-amber-300 font-bold justify-end text-right'
                  }`}
                >
                  {item.speaker === 'system' && <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  <p className="bg-white/5 p-2 rounded-xl border border-white/10 max-w-[85%]">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Retrieved Database Trust Score Badge */}
            {retrievedScore !== null && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase font-extrabold">Retrieved From Database</span>
                  <p className="text-xl font-extrabold text-white flex items-center gap-1">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" /> Trust Score: {retrievedScore}
                  </p>
                </div>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" /> Equal Cash Credit
                </span>
              </div>
            )}

            {/* Keypad DTMF Controls */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Press Keypad Digit (DTMF)</p>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <Button
                  onClick={() => handleSendInput('1')}
                  disabled={loading}
                  variant="outline"
                  className="bg-white/5 hover:bg-white/15 text-white border-white/15 py-3 font-bold text-xs"
                >
                  1: Payment
                </Button>
                <Button
                  onClick={() => handleSendInput('2')}
                  disabled={loading}
                  variant="outline"
                  className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border-emerald-500/30 py-3 font-bold text-xs"
                >
                  2: Trust Score
                </Button>
                <Button
                  onClick={() => handleSendInput('3')}
                  disabled={loading}
                  variant="outline"
                  className="bg-white/5 hover:bg-white/15 text-white border-white/15 py-3 font-bold text-xs"
                >
                  3: Recent
                </Button>
                <Button
                  onClick={() => handleSendInput('0')}
                  disabled={loading}
                  variant="outline"
                  className="bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-500/30 py-3 font-bold text-xs"
                >
                  0: Exit
                </Button>
              </div>
            </div>

            {/* Natural Hindi Speech Input Presets */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Mic className="w-3 h-3 text-emerald-400" /> Or Speak Query (Hindi Speech Recognition)
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSendInput(undefined, 'Mera score kya hai')}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
                >
                  🗣️ &quot;Mera score kya hai?&quot;
                </button>
                <button
                  type="button"
                  onClick={() => handleSendInput(undefined, 'Payment status batao')}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold"
                >
                  🗣️ &quot;Payment status batao&quot;
                </button>
                <button
                  type="button"
                  onClick={() => handleSendInput(undefined, 'Haal ka payment sunao')}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold"
                >
                  🗣️ &quot;Haal ka payment sunao&quot;
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
