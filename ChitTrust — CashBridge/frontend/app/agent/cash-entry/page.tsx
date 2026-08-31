'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, User, Banknote } from 'lucide-react';
import { MemberVerifyCard } from '@/components/agent/MemberVerifyCard';
import { CashProofCapture } from '@/components/agent/CashProofCapture';
import { CashSuccessScreen } from '@/components/agent/CashSuccessScreen';

export default function RecordCashEntryPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  const [groups, setGroups] = useState<any[]>([]);
  const [cashMembers, setCashMembers] = useState<any[]>([]);

  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [amount, setAmount] = useState<string>('2500');
  const [proofImage, setProofImage] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successRecord, setSuccessRecord] = useState<any | null>(null);

  // Load agent assigned groups
  useEffect(() => {
    async function loadGroups() {
      try {
        const res = await fetch('/api/v1/agents/my-groups');
        if (res.ok) {
          const data = await res.json();
          setGroups(data);
        } else {
          setGroups([
            {
              id: '11111111-1111-1111-1111-111111111111',
              name: 'Ganesh Traders Community Chit #1',
              total_amount: 30000.0,
              contribution_per_month: 2500.0,
              cash_member_count: 1,
              status: 'active',
            },
          ]);
        }
      } catch (err) {
        console.error('Error loading groups:', err);
      }
    }

    loadGroups();
  }, []);

  // Load cash members when group is selected
  const handleSelectGroup = async (group: any) => {
    setSelectedGroup(group);
    setAmount(group.contribution_per_month.toString());
    try {
      const res = await fetch(`/api/v1/agents/groups/${group.id}/cash-members`);
      if (res.ok) {
        const members = await res.json();
        setCashMembers(members);
      } else {
        setCashMembers([
          {
            membership_id: '33333333-3333-3333-3333-333333333333',
            group_id: group.id,
            user_id: '00000000-0000-0000-0000-000000000004',
            member_name: 'Anil Verma (Cash Member)',
            phone_number: '+919900000004',
            monthly_contribution: 2500.0,
            current_month_due: 2,
            is_current_month_paid: false,
            agent_id: '00000000-0000-0000-0000-000000000002',
          },
        ]);
      }
      setStep(2);
    } catch (err) {
      console.error('Error loading cash members:', err);
    }
  };

  const handleSelectMember = (member: any) => {
    setSelectedMember(member);
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!proofImage) {
      setErrorMessage('Photo proof is mandatory for cash contributions.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/contributions/cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membership_id: selectedMember.membership_id,
          amount: parseFloat(amount),
          month_number: selectedMember.current_month_due || 2,
          photo_proof_url: proofImage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || 'Photo upload or cash entry recording failed.');
        setSubmitting(false);
        return;
      }

      setSuccessRecord(data);
      setStep(6);
    } catch (err: unknown) {
      console.error('Error submitting cash entry:', err);
      setErrorMessage('Network error recording cash payment. Please try again.');
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedGroup(null);
    setSelectedMember(null);
    setProofImage(null);
    setSuccessRecord(null);
    setErrorMessage(null);
  };

  if (step === 6 && successRecord) {
    return (
      <div className="max-w-md mx-auto py-6">
        <CashSuccessScreen
          memberName={successRecord.member_name}
          groupName={selectedGroup?.name || 'Ganesh Traders Chit #1'}
          amount={successRecord.amount}
          monthNumber={successRecord.month_number}
          agentName={successRecord.recorded_by_agent_name}
          onReset={handleReset}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-5 py-4">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/agent"
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Agent Dashboard
        </Link>
        <span className="text-xs font-bold text-slate-500">Step {step} of 5</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Record Doorstep Cash</h1>
        <p className="text-xs font-medium text-slate-600">Doorstep cash payment receipt portal for verified agents.</p>
      </div>

      {/* Step 1: Select Group */}
      {step === 1 && (
        <Card className="shadow-md border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold">1. Select Assigned Chit Group</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => handleSelectGroup(group)}
                className="p-4 border-2 border-slate-200 hover:border-amber-500 bg-white hover:bg-amber-50/50 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-900 text-sm">{group.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Expected: <strong className="text-emerald-700">₹{group.contribution_per_month.toLocaleString('en-IN')}/mo</strong>
                  </p>
                </div>
                <Button size="sm" variant="outline" className="text-xs font-bold">Select →</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Cash Member */}
      {step === 2 && (
        <Card className="shadow-md border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">2. Select Cash Member</CardTitle>
            <button onClick={() => setStep(1)} className="text-xs text-amber-700 font-bold">Change Group</button>
          </CardHeader>
          <CardContent className="space-y-3">
            {cashMembers.map((member) => (
              <div
                key={member.membership_id}
                onClick={() => handleSelectMember(member)}
                className="p-4 border-2 border-slate-200 hover:border-amber-500 bg-white hover:bg-amber-50/50 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{member.member_name}</p>
                    <p className="text-xs text-slate-500">{member.phone_number}</p>
                  </div>
                </div>
                <Button size="sm" className="text-xs font-bold">Select →</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Member Verification & Step 4: Amount Entry & Step 5: Proof Capture */}
      {step >= 3 && selectedMember && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <MemberVerifyCard
            memberName={selectedMember.member_name}
            phone={selectedMember.phone_number}
            groupName={selectedGroup?.name || 'Ganesh Traders Chit #1'}
            monthlyContribution={selectedGroup?.contribution_per_month || 2500.0}
            agentName="Suresh Patel (CashBridge Agent)"
            monthNumber={selectedMember.current_month_due || 2}
          />

          {/* Amount Entry Input */}
          <Card className="shadow-sm border-slate-200">
            <CardContent className="pt-4 space-y-2">
              <label htmlFor="cash-amount" className="block text-xs font-bold text-slate-900">
                Contribution Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-base font-extrabold text-slate-500">₹</span>
                <input
                  id="cash-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-300 rounded-xl text-lg font-extrabold text-emerald-800 bg-emerald-50/40 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  disabled={submitting}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Expected: <strong>₹{selectedGroup?.contribution_per_month.toLocaleString('en-IN')}</strong> for Month {selectedMember.current_month_due || 2}
              </p>
            </CardContent>
          </Card>

          {/* Photo Proof Capture */}
          <Card className="shadow-sm border-slate-200">
            <CardContent className="pt-4">
              <CashProofCapture
                previewUrl={proofImage}
                onCapture={(img) => setProofImage(img)}
                onClear={() => setProofImage(null)}
              />
            </CardContent>
          </Card>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || !proofImage}
            className="w-full py-4 text-base font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Recording payment...
              </span>
            ) : (
              'Confirm & Save Cash Entry'
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
