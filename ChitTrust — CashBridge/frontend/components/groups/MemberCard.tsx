import React from 'react';
import { QrCode, Banknote, UserCheck } from 'lucide-react';
import { MemberType } from '@/types';

interface MemberCardProps {
  name: string;
  phone: string;
  memberType: MemberType | string;
  agentName?: string;
  status: string;
}

export function MemberCard({ name, phone, memberType, agentName, status }: MemberCardProps) {
  const isDigital = memberType === 'digital';

  return (
    <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
      <div className="space-y-0.5">
        <div className="flex items-center space-x-2">
          <p className="font-bold text-slate-900 text-xs">{name}</p>
          {status === 'exited' && (
            <span className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0.2 rounded font-semibold">Exited</span>
          )}
        </div>
        <p className="text-[11px] text-slate-500">{phone}</p>
      </div>

      <div className="text-right">
        {isDigital ? (
          <span className="inline-flex items-center text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            <QrCode className="w-3 h-3 mr-1 text-blue-600" /> Digital (UPI)
          </span>
        ) : (
          <span className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
            <Banknote className="w-3 h-3 mr-1 text-amber-600" /> Cash (Agent: {agentName || 'Assigned'})
          </span>
        )}
      </div>
    </div>
  );
}
