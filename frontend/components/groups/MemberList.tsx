'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Banknote, UserCheck, Search, UserX } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

export interface MembershipItem {
  id: string;
  group_id: string;
  user_id: string;
  member_name: string;
  phone_number: string;
  member_type: 'digital' | 'cash';
  agent_id?: string;
  agent_name?: string;
  status: 'active' | 'exited' | 'suspended';
  joined_at: string;
}

interface MemberListProps {
  members: MembershipItem[];
  isOrganizer: boolean;
  onExitMember?: (membershipId: string) => Promise<void>;
}

export function MemberList({ members, isOrganizer, onExitMember }: MemberListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [targetMember, setTargetMember] = useState<MembershipItem | null>(null);
  const [exiting, setExiting] = useState(false);

  const filteredMembers = members.filter(
    (m) =>
      m.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone_number.includes(searchQuery)
  );

  const handleOpenExitModal = (member: MembershipItem) => {
    setTargetMember(member);
    setExitModalOpen(true);
  };

  const handleConfirmExit = async () => {
    if (!targetMember || !onExitMember) return;

    setExiting(true);
    try {
      await onExitMember(targetMember.id);
      setExitModalOpen(false);
      setTargetMember(null);
    } catch (err) {
      console.error('Error exiting member:', err);
    } finally {
      setExiting(false);
    }
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <CardTitle className="text-base font-bold text-slate-900">
          Group Member Registry ({members.filter(m => m.status === 'active').length} Active)
        </CardTitle>

        {/* Basic Search Filter */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </CardHeader>

      <CardContent>
        {filteredMembers.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No matching members found in registry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Member Name</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Member Type</th>
                  <th className="py-2.5 px-3">CashBridge Agent</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Joined Date</th>
                  {isOrganizer && <th className="py-2.5 px-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredMembers.map((member) => {
                  const isCash = member.member_type === 'cash';
                  const isExited = member.status === 'exited';

                  return (
                    <tr key={member.id} className={isExited ? 'bg-slate-50/70 text-slate-400' : 'hover:bg-slate-50/50'}>
                      <td className="py-3 px-3 font-bold text-slate-900">{member.member_name}</td>
                      <td className="py-3 px-3">{member.phone_number}</td>
                      <td className="py-3 px-3">
                        {isCash ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                            <Banknote className="w-3 h-3 text-amber-600" /> Cash
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            <QrCode className="w-3 h-3 text-blue-600" /> Digital (UPI)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isCash ? (
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-amber-600" /> {member.agent_name || 'Ramesh Kumar'}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not Required</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isExited ? (
                          <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Exited</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Active</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </td>
                      {isOrganizer && (
                        <td className="py-3 px-3 text-right">
                          {!isExited && onExitMember && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenExitModal(member)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-[11px] h-7 px-2"
                            >
                              <UserX className="w-3.5 h-3.5 mr-1" /> Exit Member
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        isOpen={exitModalOpen}
        title="Exit Member from Chit Group"
        description={`Are you sure you want to exit ${targetMember?.member_name || 'this member'}? Historical financial contributions will be preserved in the audit log.`}
        confirmText="Exit Member"
        variant="danger"
        loading={exiting}
        onConfirm={handleConfirmExit}
        onClose={() => setExitModalOpen(false)}
      />
    </Card>
  );
}
