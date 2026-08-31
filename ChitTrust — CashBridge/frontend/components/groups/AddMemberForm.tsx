'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Banknote, UserPlus, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { validateIndianPhone } from '@/lib/phone';
import { AgentSelector, AgentItem } from './AgentSelector';

interface AddMemberFormProps {
  groupId: string;
  groupRegion?: string;
  onSuccess: () => void;
}

export function AddMemberForm({ groupId, groupRegion, onSuccess }: AddMemberFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [memberType, setMemberType] = useState<'digital' | 'cash'>('digital');
  const [selectedAgent, setSelectedAgent] = useState<AgentItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter the member name.');
      return;
    }

    const phoneValidation = validateIndianPhone(phone);
    if (!phoneValidation.valid) {
      setErrorMessage(phoneValidation.error || 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (memberType === 'cash' && !selectedAgent) {
      setErrorMessage('Please select a verified CashBridge Agent for doorstep cash collection.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/v1/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone_number: phoneValidation.formatted,
          member_type: memberType,
          agent_id: memberType === 'cash' ? selectedAgent?.id : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || 'Unable to add member. Please try again.');
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message || 'Member added successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: unknown) {
      console.error('Error adding member:', err);
      setErrorMessage('Network error while adding member. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-emerald-600" /> Add New Member to Chit Group
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Member Name */}
          <div>
            <label htmlFor="member-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Member Full Name *
            </label>
            <input
              id="member-name"
              type="text"
              placeholder="e.g. Sunita Devi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              disabled={loading}
            />
          </div>

          {/* Member Phone Number */}
          <div>
            <label htmlFor="member-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mobile Number *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-500">
                +91
              </span>
              <input
                id="member-phone"
                type="tel"
                maxLength={10}
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-14 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>

          {/* Member Type Choice */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Select Member Payment Type *</label>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setMemberType('digital')}
                className={`p-3 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-2.5 ${
                  memberType === 'digital'
                    ? 'border-blue-600 bg-blue-50/60'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <QrCode className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900 text-xs">Digital Member</p>
                  <p className="text-[10px] text-slate-500">UPI / Online</p>
                </div>
              </div>

              <div
                onClick={() => setMemberType('cash')}
                className={`p-3 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-2.5 ${
                  memberType === 'cash'
                    ? 'border-amber-500 bg-amber-50/60'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Banknote className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900 text-xs">Cash Member</p>
                  <p className="text-[10px] text-slate-500">Doorstep Agent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Selection (Only for Cash Member) */}
          {memberType === 'cash' && (
            <AgentSelector
              regionFilter={groupRegion}
              selectedAgentId={selectedAgent?.id || null}
              onSelectAgent={(agent) => setSelectedAgent(agent)}
            />
          )}

          {errorMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full py-3 font-bold rounded-xl text-sm">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Adding Member...
              </span>
            ) : (
              'Add Member to Chit Group'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
