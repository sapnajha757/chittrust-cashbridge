import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldCheck, Download, Printer, X } from 'lucide-react';

interface PaymentReceiptProps {
  isOpen: boolean;
  groupName: string;
  monthNumber: number;
  amount: number;
  paymentMode: string;
  transactionRef: string;
  paymentDate: string;
  onClose: () => void;
}

export function PaymentReceipt({
  isOpen,
  groupName,
  monthNumber,
  amount,
  paymentMode,
  transactionRef,
  paymentDate,
  onClose,
}: PaymentReceiptProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2 text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">ChitTrust Payment Receipt</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center py-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Payment Verified & Recorded</p>
          <p className="text-3xl font-extrabold text-slate-900">₹{amount.toLocaleString('en-IN')}</p>
        </div>

        <div className="space-y-3 text-xs divide-y divide-slate-100">
          <div className="flex justify-between pt-1">
            <span className="text-slate-500">Chit Group</span>
            <span className="font-bold text-slate-900">{groupName}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-500">Contribution Cycle</span>
            <span className="font-bold text-slate-900">Month {monthNumber}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-500">Payment Mode</span>
            <span className="font-bold text-blue-600 uppercase">{paymentMode}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-500">Transaction Ref / Order ID</span>
            <span className="font-mono text-[11px] text-slate-800">{transactionRef}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-500">Verification Timestamp</span>
            <span className="font-medium text-slate-700">{new Date(paymentDate).toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <Button variant="outline" size="sm" onClick={handlePrint} className="w-full text-xs font-bold flex items-center justify-center gap-1.5">
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </Button>
          <Button size="sm" onClick={onClose} className="w-full text-xs font-bold">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
