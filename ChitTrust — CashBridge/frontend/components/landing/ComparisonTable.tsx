import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

export function ComparisonTable() {
  const comparisonItems = [
    { feature: 'Record Keeping', traditional: 'Manual paper register', chittrust: 'Verifiable digital ledger' },
    { feature: 'Cash Member Access', traditional: 'Handwritten receipts', chittrust: 'CashBridge agent photo proof' },
    { feature: 'Credit Weight', traditional: 'Digital-only or none', chittrust: 'Equal trust credit (Cash + UPI)' },
    { feature: 'Behavioral History', traditional: 'No formal record', chittrust: 'Explainable Trust Score Engine' },
    { feature: 'Accessibility', traditional: 'Smartphone requirement', chittrust: 'Feature phone Hindi Voice IVR' },
    { feature: 'Risk Monitoring', traditional: 'Manual dispute resolution', chittrust: 'AI Trust Intelligence & Review' },
  ];

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3 text-center">
        <CardTitle className="text-lg font-extrabold text-slate-900">Why ChitTrust + CashBridge?</CardTitle>
        <p className="text-xs text-slate-500">Bridging informal community savings with formal verifiable trust.</p>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Dimension</th>
                <th className="py-2.5 px-3">Traditional Committee</th>
                <th className="py-2.5 px-3 text-emerald-700 font-bold bg-emerald-50/50">ChitTrust + CashBridge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{item.feature}</td>
                  <td className="py-3 px-3 text-slate-500 flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5 text-red-500 shrink-0" /> {item.traditional}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-800 bg-emerald-50/30 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {item.chittrust}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
