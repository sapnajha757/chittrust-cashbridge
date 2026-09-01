import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { PaymentButton } from './PaymentButton';
import { Calendar, Wallet, ShieldCheck } from 'lucide-react';

interface ContributionCardProps {
  membershipId: string;
  groupName: string;
  monthNumber: number;
  amount: number;
  paymentStatus: string;
  paidOnTime?: boolean;
  paymentDate?: string;
  transactionRef?: string;
  onPaymentSuccess: (receipt: any) => void;
  onProcessingChange?: (processing: boolean) => void;
}

export function ContributionCard({
  membershipId,
  groupName,
  monthNumber,
  amount,
  paymentStatus,
  paidOnTime,
  paymentDate,
  transactionRef,
  onPaymentSuccess,
  onProcessingChange,
}: ContributionCardProps) {
  const isPaid = paymentStatus === 'successful';

  return (
    <Card className="shadow-md border-slate-200 bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">{groupName}</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Contribution for Month {monthNumber}
            </p>
          </div>
          <PaymentStatusBadge status={paymentStatus} />
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Monthly Amount Due</span>
            <span className="text-2xl font-extrabold text-slate-900">₹{amount.toLocaleString('en-IN')}</span>
          </div>
          <Wallet className="w-8 h-8 text-emerald-600 opacity-80" />
        </div>

        {isPaid && paymentDate && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs space-y-1">
            <div className="flex justify-between font-medium text-emerald-900">
              <span>Verified Payment Date:</span>
              <span>{new Date(paymentDate).toLocaleDateString()}</span>
            </div>
            {transactionRef && (
              <div className="flex justify-between font-mono text-[11px] text-emerald-700">
                <span>Ref:</span>
                <span>{transactionRef}</span>
              </div>
            )}
          </div>
        )}

        <PaymentButton
          membershipId={membershipId}
          monthNumber={monthNumber}
          amount={amount}
          groupName={groupName}
          isPaid={isPaid}
          onSuccess={onPaymentSuccess}
          onProcessingChange={onProcessingChange}
        />
      </CardContent>
    </Card>
  );
}
