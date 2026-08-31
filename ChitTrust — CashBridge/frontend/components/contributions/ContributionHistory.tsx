import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { History, QrCode, Banknote } from 'lucide-react';
import { Contribution } from '@/types';

interface ContributionHistoryProps {
  contributions: Contribution[];
}

export function ContributionHistory({ contributions }: ContributionHistoryProps) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" /> Contribution Payment History
        </CardTitle>
      </CardHeader>

      <CardContent>
        {contributions.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No payment records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment Mode</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Payment Date</th>
                  <th className="py-2.5 px-3">Transaction Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {contributions.map((item) => {
                  const isCash = item.method === 'cash';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-bold text-slate-900">Month {item.month_number}</td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3">
                        {isCash ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                            <Banknote className="w-3 h-3 text-amber-600" /> Cash Agent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            <QrCode className="w-3 h-3 text-blue-600" /> UPI
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <PaymentStatusBadge status={item.status || 'pending'} />
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {item.collected_at ? new Date(item.collected_at).toLocaleDateString() : item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {item.photo_proof_url ? 'Cash Proof Uploaded' : item.id ? item.id.substring(0, 16) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
