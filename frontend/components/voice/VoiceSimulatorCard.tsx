'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  Volume2,
  VolumeX,
  ShieldCheck,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  HelpCircle,
  CreditCard,
  UserCheck,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { PaymentButton } from '@/components/contributions/PaymentButton';
import { DemoVoiceProvider, IVRResponse } from '@/lib/voice/ivr-provider';

export function VoiceSimulatorCard() {
  const { user, profile, trustScore } = useAuth();
  const [inCall, setInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [currentStep, setCurrentStep] = useState<'IDLE' | 'LANG_SELECT' | 'MAIN_MENU' | 'CONTRIBUTION_FLOW' | 'PAYMENT_HANDOFF' | 'TRUST_SCORE_FLOW' | 'PROBLEM_FLOW' | 'SUPPORT_HANDOFF'>('IDLE');
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isJudgeDemoRunning, setIsJudgeDemoRunning] = useState(false);

  const [promptText, setPromptText] = useState<string>('');
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const [realScore, setRealScore] = useState<number | null>(null);
  const [contributionData, setContributionData] = useState<{ amount: number; dueDate: string; status: string } | null>(null);
  const [showPaymentHandoff, setShowPaymentHandoff] = useState(false);
  const [showSupportHandoff, setShowSupportHandoff] = useState(false);

  const [transcriptHistory, setTranscriptHistory] = useState<
    { speaker: 'system' | 'user'; text: string; timestamp: string }[]
  >([]);

  const providerRef = useRef<DemoVoiceProvider>(new DemoVoiceProvider());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync real trust score from auth context
  useEffect(() => {
    if (trustScore?.score) {
      setRealScore(trustScore.score);
    }
  }, [trustScore]);

  // Call duration timer
  useEffect(() => {
    if (inCall) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [inCall]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play DTMF key audio tone using Web Audio API
  const playDTMFTone = (key: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      const dtmfFrequencies: Record<string, [number, number]> = {
        '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
        '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
        '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
        '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
      };

      const freqs = dtmfFrequencies[key] || [697, 1209];
      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];
      gain.gain.value = 0.1;

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      setTimeout(() => {
        osc1.stop();
        osc2.stop();
        ctx.close();
      }, 150);
    } catch {
      // AudioContext fallback
    }
  };

  // Speak prompt using speech synthesis
  const speakPrompt = useCallback((text: string, lang: 'hi' | 'en', onComplete?: () => void) => {
    setIsSpeaking(true);
    providerRef.current.speak(text, lang, () => {
      setIsSpeaking(false);
      if (onComplete) onComplete();
    });
  }, []);

  // Handle Starting Call
  const handleStartCall = async () => {
    setIsProcessing(true);
    setInCall(true);
    setTranscriptHistory([]);
    setShowPaymentHandoff(false);
    setShowSupportHandoff(false);
    setCurrentStep('LANG_SELECT');

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const response: IVRResponse = await providerRef.current.startCall(language);

    setPromptText(response.promptText);
    setTranscriptHistory([
      { speaker: 'system', text: response.promptText, timestamp: now },
    ]);
    setIsProcessing(false);

    speakPrompt(response.promptText, language);
  };

  // Handle Ending Call
  const handleEndCall = () => {
    providerRef.current.stopSpeaking();
    setInCall(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setIsListening(false);
    setIsJudgeDemoRunning(false);
    setCurrentStep('IDLE');

    const endMsg = language === 'hi' ? 'Call samapt ho gaya hai. Dhanyawad!' : 'Call ended. Thank you for calling CashBridge!';
    setPromptText(endMsg);
    
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTranscriptHistory((prev) => [...prev, { speaker: 'system', text: endMsg, timestamp: now }]);
  };

  // Process DTMF Key Press
  const handleKeyPress = async (digit: string) => {
    if (!inCall || isProcessing) return;

    setActiveKey(digit);
    playDTMFTone(digit);
    setTimeout(() => setActiveKey(null), 200);

    providerRef.current.stopSpeaking();
    setIsSpeaking(false);
    setIsProcessing(true);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTranscriptHistory((prev) => [
      ...prev,
      { speaker: 'user', text: `Pressed Digit [ ${digit} ]`, timestamp: now },
    ]);

    // Handle Language Selection (Step 0)
    if (currentStep === 'LANG_SELECT') {
      const selectedLang = digit === '1' ? 'hi' : 'en';
      setLanguage(selectedLang);
      setCurrentStep('MAIN_MENU');

      const response = await providerRef.current.handleInput(digit, 'LANG_SELECT', selectedLang, user?.id);
      setPromptText(response.promptText);
      setTranscriptHistory((prev) => [...prev, { speaker: 'system', text: response.promptText, timestamp: now }]);
      setIsProcessing(false);

      speakPrompt(response.promptText, selectedLang);
      return;
    }

    // Main Menu Digit Responses
    if (digit === '1') {
      setCurrentStep('CONTRIBUTION_FLOW');
      let statusText = '';
      
      try {
        const res = await fetch('/api/v1/contributions/summary').catch(() => null);
        if (res && res.ok) {
          const sData = await res.json();
          const dueAmt = sData.monthly_due || 2500;
          const status = sData.status || 'Active';
          setContributionData({ amount: dueAmt, dueDate: '15th of this month', status });
          statusText = language === 'hi'
            ? `Aapka CashBridge contribution status ${status} hai. Agli kist ₹${dueAmt} mahine ki 15 tareek ko due hai.`
            : `Your CashBridge contribution status is ${status}. Your next installment of ₹${dueAmt} is due on the 15th.`;
        } else {
          setContributionData({ amount: 2500, dueDate: '15th of this month', status: 'Active' });
          statusText = language === 'hi'
            ? 'Aapka contribution status Active hai. Mahine ki agli kist ₹2,500 due hai.'
            : 'Your contribution status is Active. Next installment of ₹2,500 is due.';
        }
      } catch {
        setContributionData({ amount: 2500, dueDate: '15th of this month', status: 'Active' });
        statusText = language === 'hi'
          ? 'Aapka contribution status Active hai. Mahine ki kist ₹2,500 due hai.'
          : 'Your contribution status is Active. Installment of ₹2,500 is due.';
      }

      setPromptText(statusText);
      setTranscriptHistory((prev) => [...prev, { speaker: 'system', text: statusText, timestamp: now }]);
      setIsProcessing(false);
      speakPrompt(statusText, language);
      return;
    }

    if (digit === '2') {
      setCurrentStep('PAYMENT_HANDOFF');
      setShowPaymentHandoff(true);
      const payPrompt = language === 'hi'
        ? 'Aapka due amount ₹2,500 hai. Payment handoff screen par Razorpay TEST MODE se payment complete karein.'
        : 'Your due amount is ₹2,500. Please complete payment using Razorpay TEST MODE on the handoff screen below.';
      
      setPromptText(payPrompt);
      setTranscriptHistory((prev) => [...prev, { speaker: 'system', text: payPrompt, timestamp: now }]);
      setIsProcessing(false);
      speakPrompt(payPrompt, language);
      return;
    }

    if (digit === '3') {
      setCurrentStep('TRUST_SCORE_FLOW');
      const score = realScore || 785;
      const scoreText = language === 'hi'
        ? `Aapka CashBridge Credit Trust Score ${score} out of 1000 (Gold Tier) hai. Sabi timely UPI aur doorstep cash payments par +5 equal credit milta hai.`
        : `Your CashBridge Credit Trust Score is ${score} out of 1000 (Gold Tier). Equal +5 credit is provided for both UPI and cash contributions.`;

      setPromptText(scoreText);
      setTranscriptHistory((prev) => [...prev, { speaker: 'system', text: scoreText, timestamp: now }]);
      setIsProcessing(false);
      speakPrompt(scoreText, language);
      return;
    }

    if (digit === '4') {
      setCurrentStep('PROBLEM_FLOW');
      const probText = language === 'hi'
        ? 'Samasya report karne ke liye: 1. Payment failure, 2. Doorstep cash collection, 3. Suspicious activity.'
        : 'To report an issue: Press 1 for Payment failure, 2 for Doorstep cash collection, 3 for Suspicious activity.';

      setPromptText(probText);
      setTranscriptHistory((prev) => [...prev, { speaker: 'system', text: probText, timestamp: now }]);
      setIsProcessing(false);
      speakPrompt(probText, language);
      return;
    }

    if (digit === '5') {
      setCurrentStep('SUPPORT_HANDOFF');
      setShowSupportHandoff(true);
      const suppText = language === 'hi'
        ? 'Aapko CashBridge support agent se connect kiya ja raha hai. Anumanit wait time 2 minute se kam hai.'
        : 'Connecting you to CashBridge support agent... Estimated wait time is less than 2 minutes.';

      setPromptText(suppText);
      setTranscriptHistory((prev) => [...prev, { speaker: 'system', text: suppText, timestamp: now }]);
      setIsProcessing(false);
      speakPrompt(suppText, language);
      return;
    }

    // Default fallback
    const defaultText = language === 'hi'
      ? 'Kripya menu vikalp 1 se 5 tak chunne ke liye keypad ka upayog karein.'
      : 'Please select menu options 1 to 5 using the telephone keypad.';

    setPromptText(defaultText);
    setTranscriptHistory((prev) => [...prev, { speaker: 'system', text: defaultText, timestamp: now }]);
    setIsProcessing(false);
    speakPrompt(defaultText, language);
  };

  // Automated 60-90 Second Guided "Start Judge Demo" Walkthrough
  const runJudgeDemo = async () => {
    if (isJudgeDemoRunning) return;
    setIsJudgeDemoRunning(true);

    // Step 1: Start Call
    await handleStartCall();
    await new Promise((r) => setTimeout(r, 2500));

    // Step 2: Press 1 (Hindi)
    await handleKeyPress('1');
    await new Promise((r) => setTimeout(r, 3000));

    // Step 3: Press 1 (Contribution Status)
    await handleKeyPress('1');
    await new Promise((r) => setTimeout(r, 3500));

    // Step 4: Press 3 (Trust Score)
    await handleKeyPress('3');
    await new Promise((r) => setTimeout(r, 3500));

    // Step 5: Press 2 (Payment Handoff)
    await handleKeyPress('2');
    await new Promise((r) => setTimeout(r, 3000));

    // Step 6: Press 5 (Support Handoff)
    await handleKeyPress('5');
    await new Promise((r) => setTimeout(r, 2000));

    setIsJudgeDemoRunning(false);
  };

  return (
    <div className="space-y-4">
      {/* Required Banner */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-extrabold text-amber-300">CashBridge Voice IVR Demo</p>
          <p className="text-[11px] text-amber-200/80">
            Browser simulation for demonstration. Production telephony integration can be connected via Twilio.
          </p>
        </div>
      </div>

      <Card className="shadow-2xl border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white overflow-hidden relative rounded-3xl">
        <CardHeader className="pb-3 border-b border-slate-700/60">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                <PhoneCall className="w-3.5 h-3.5" /> Toll-Free Voice IVR — Demo Mode
              </span>
              <CardTitle className="text-xl font-extrabold text-white mt-1.5 flex items-center gap-2">
                CashBridge Feature Phone Assistant
              </CardTitle>
            </div>

            {/* Top Action Controls */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={runJudgeDemo}
                disabled={isJudgeDemoRunning}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                {isJudgeDemoRunning ? 'Judge Demo Running...' : 'Start Judge Demo (Automated)'}
              </Button>

              {/* Language Selector */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    language === 'hi' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    language === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Caller & Receiver Info Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Caller Identity (Supabase Auth)</p>
                <p className="font-extrabold text-white text-xs">
                  {profile?.name || user?.phone || 'Registered CashBridge User (+91 99000 00003)'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">CashBridge Toll-Free Hotline</p>
                <p className="font-extrabold text-emerald-400 text-xs">1800-CHIT-TRUST (+91 1800 244 8878)</p>
              </div>

              {inCall && (
                <div className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> {formatTimer(callDuration)}
                </div>
              )}
            </div>
          </div>

          {/* Idle Start Call Screen */}
          {!inCall ? (
            <div className="text-center py-8 space-y-4 bg-slate-950/40 rounded-3xl border border-slate-800">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40 shadow-xl">
                <PhoneCall className="w-10 h-10 animate-bounce text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-base text-white">Dial CashBridge Multilingual IVR Hotline</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Simulate a feature phone toll-free call to check contribution due dates, trust scores, and Razorpay TEST payment handoff.
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  onClick={handleStartCall}
                  disabled={isProcessing}
                  className="py-3 px-8 text-sm font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-xl flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" /> Start IVR Call Simulation
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Call Status & Voice State Badges */}
              <div className="flex flex-wrap justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-2 font-bold text-emerald-400">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    In Call • Active Telephony Session
                  </span>

                  {isSpeaking && (
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 animate-pulse">
                      <Volume2 className="w-3 h-3" /> Speaking Prompt...
                    </span>
                  )}

                  {isProcessing && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 animate-pulse">
                      <Clock className="w-3 h-3" /> Processing Input...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => speakPrompt(promptText, language)}
                    className="text-[11px] font-bold bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 flex items-center gap-1 py-1 h-7"
                  >
                    <RotateCcw className="w-3 h-3" /> Replay Prompt
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleEndCall}
                    className="text-xs font-bold bg-red-600 text-white hover:bg-red-700 flex items-center gap-1 py-1 h-7"
                  >
                    <PhoneOff className="w-3.5 h-3.5" /> End Call
                  </Button>
                </div>
              </div>

              {/* Real-time Conversation Transcript */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 max-h-60 overflow-y-auto text-xs">
                <p className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1 border-b border-slate-900 pb-1">
                  <MessageSquare className="w-3 h-3 text-emerald-400" /> Real-time IVR Speech Transcript
                </p>
                {transcriptHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 ${
                      item.speaker === 'system' ? 'text-emerald-300' : 'text-amber-300 font-bold justify-end text-right'
                    }`}
                  >
                    {item.speaker === 'system' && <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                    <div className="space-y-0.5 max-w-[85%]">
                      <p className="bg-white/5 p-2 rounded-xl border border-white/10 text-xs leading-relaxed">
                        {item.text}
                      </p>
                      <span className="text-[9px] text-slate-500 font-mono block">{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Information / State Cards */}
              {contributionData && currentStep === 'CONTRIBUTION_FLOW' && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase font-extrabold">Contribution Status</span>
                    <p className="text-base font-extrabold text-white">Status: {contributionData.status}</p>
                    <p className="text-xs text-slate-300">Next Installment: ₹{contributionData.amount} (Due: {contributionData.dueDate})</p>
                  </div>
                </div>
              )}

              {/* Real Trust Score Card */}
              {currentStep === 'TRUST_SCORE_FLOW' && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase font-extrabold">Real Database Trust Engine</span>
                    <p className="text-xl font-extrabold text-white flex items-center gap-1">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" /> Credit Trust Score: {realScore || 785} / 1000
                    </p>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" /> Equal Cash Weight
                  </span>
                </div>
              )}

              {/* Razorpay TEST MODE Payment Handoff Screen */}
              {showPaymentHandoff && currentStep === 'PAYMENT_HANDOFF' && (
                <div className="p-4 bg-emerald-900/30 border-2 border-emerald-500/40 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-400" /> Payment Handoff Ready — Razorpay TEST MODE
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono">
                      Amount: ₹2,500
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Click the button below to launch the verified Razorpay Checkout modal for ₹2,500 contribution payment:
                  </p>

                  <div className="pt-1">
                    <PaymentButton
                      membershipId="22222222-2222-2222-2222-222222222222"
                      monthNumber={2}
                      amount={2500}
                      groupName="Ganesh Traders Community Chit #1"
                      onSuccess={(receipt) => {
                        console.log('IVR Payment Handoff Completed:', receipt);
                        setPromptText(language === 'hi' ? 'Payment successful! Aapka contribution record ho gaya hai.' : 'Payment successful! Your contribution has been recorded.');
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Support Handoff Card */}
              {showSupportHandoff && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-amber-300 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-amber-400" /> Customer Support Handoff Initialized
                    </p>
                    <p className="text-[11px] text-amber-200/80">Estimated wait time: less than 2 minutes.</p>
                  </div>
                </div>
              )}

              {/* Interactive 3x4 Telephone Keypad (0-9, *, #) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Interactive DTMF Telephone Keypad
                  </p>
                  <span className="text-[10px] text-slate-500">Click keys to send DTMF tones</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm max-w-md mx-auto">
                  {[
                    { key: '1', label: '1: Status' },
                    { key: '2', label: '2: Payment' },
                    { key: '3', label: '3: Score' },
                    { key: '4', label: '4: Problem' },
                    { key: '5', label: '5: Support' },
                    { key: '6', label: '6: Info' },
                    { key: '7', label: '7' },
                    { key: '8', label: '8' },
                    { key: '9', label: '9' },
                    { key: '*', label: '*' },
                    { key: '0', label: '0: Main' },
                    { key: '#', label: '#' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleKeyPress(item.key)}
                      disabled={isProcessing}
                      className={`p-3 rounded-2xl font-black text-sm border transition-all flex flex-col items-center justify-center ${
                        activeKey === item.key
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-95 shadow-lg'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800 shadow-md'
                      }`}
                    >
                      <span>{item.key}</span>
                      <span className="text-[9px] font-normal text-slate-400 mt-0.5">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
