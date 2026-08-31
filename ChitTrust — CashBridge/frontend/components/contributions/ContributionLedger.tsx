import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { BookOpen, QrCode, Banknote } from 'lucide-react';

export interface LedgerItem {
  memberName: string;
  amount: number;
  mode: 'digital' | 'cash' | string;
  status: 'successful' | 'pending' | 'failed' | 'not_recorded' | string;
}

interface ContributionLedgerProps {
  ledgerItems: LedgerItem[];
}

export function ContributionLedger({ ledgerItems }: ContributionLedgerProps) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" /> Monthly Collection Ledger
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Member Name</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment Mode</th>
                <th className="py-2.5 px-3">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {ledgerItems.map((item, idx) => {
                const isCash = item.mode === 'cash';
                const isNotRecorded = item.status === 'not_recorded';

                return (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-bold text-slate-900">{item.memberName}</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">
                      {isCash ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          <Banknote className="w-3 h-3 text-amber-600" /> Doorstep Cash
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          <QrCode className="w-3 h-3 text-blue-600" /> UPI
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {isNotRecorded ? (
                        <span className="text-slate-400 italic bg-slate-100 px-2.5 py-0.5 rounded text-[11px]">
                          Not recorded yet
                        </span>
                      ) : (
                        <PaymentStatusBadge status={item.status} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
