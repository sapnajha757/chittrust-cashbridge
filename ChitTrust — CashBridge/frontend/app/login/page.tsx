'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Shield, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('digital_member');

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Welcome to ChitTrust</h1>
        <p className="text-sm text-slate-600">Enter your phone number to receive a secure OTP</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" /> Member Login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-slate-500 font-medium">+91</span>
              <input
                type="tel"
                placeholder="98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Login As</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="digital_member">Digital Member (UPI / Online)</option>
              <option value="cash_member">Cash Member (Doorstep Cash Collection)</option>
              <option value="agent">CashBridge Agent</option>
              <option value="organizer">Chit Group Organizer</option>
            </select>
          </div>

          <Button className="w-full">
            Send OTP <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-xs text-center text-slate-500 pt-2">
            By logging in, you agree to verified community trust scores & photo proof records.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
