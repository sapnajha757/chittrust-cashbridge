'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GroupHeader } from '@/components/groups/GroupHeader';
import { GroupStats } from '@/components/groups/GroupStats';
import { MemberList, MembershipItem } from '@/components/groups/MemberList';
import { ConfirmDialog } from '@/components/groups/ConfirmDialog';
import { EmptyState } from '@/components/groups/EmptyState';
import { useAuth } from '@/hooks/use-auth';
import { Group } from '@/types';
import { Loader2 } from 'lucide-react';

export default function GroupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = (params?.id as string) || '';

  const { profile } = useAuth();
  const isOrganizer = profile?.role === 'organizer';

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<MembershipItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    action: 'pause' | 'close' | null;
  }>({ open: false, action: null });
  const [actionLoading, setActionLoading] = useState(false);

  const loadGroupDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [groupRes, membersRes] = await Promise.all([
        fetch(`/api/v1/groups/${groupId}`),
        fetch(`/api/v1/groups/${groupId}/members`),
      ]);

      if (groupRes.ok) {
        const groupData = await groupRes.json();
        setGroup(groupData);
      } else {
        // Fallback demo data
        setGroup({
          id: groupId,
          name: 'Ganesh Traders Community Chit #1',
          total_amount: 30000.0,
          duration_months: 12,
          monthly_contribution: 2500.0,
          cycle_months: 12,
          current_cycle: 4,
          total_members: 2,
          status: 'active',
          auction_type: 'bid' as any,
          organizer_id: '00000000-0000-0000-0000-000000000001',
          created_at: new Date().toISOString(),
        });
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      } else {
        // Fallback demo members
        setMembers([
          {
            id: '22222222-2222-2222-2222-222222222222',
            group_id: groupId,
            user_id: '00000000-0000-0000-0000-000000000003',
            member_name: 'Priya Sharma',
            phone_number: '+919900000003',
            member_type: 'digital',
            status: 'active',
            joined_at: new Date().toISOString(),
          },
          {
            id: '33333333-3333-3333-3333-333333333333',
            group_id: groupId,
            user_id: '00000000-0000-0000-0000-000000000004',
            member_name: 'Anil Verma',
            phone_number: '+919900000004',
            member_type: 'cash',
            agent_id: '00000000-0000-0000-0000-000000000002',
            agent_name: 'Suresh Patel (CashBridge Agent)',
            status: 'active',
            joined_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching group details:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadGroupDetails();
  }, [loadGroupDetails]);

  const handlePauseGroup = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/v1/groups/${groupId}/pause`, { method: 'POST' });
      await loadGroupDetails();
    } catch (err) {
      console.error('Error pausing group:', err);
    } finally {
      setActionLoading(false);
      setConfirmModal({ open: false, action: null });
    }
  };

  const handleCloseGroup = async () => {
    setActionLoading(true);
    try {
      await fetch(`/api/v1/groups/${groupId}/close`, { method: 'POST' });
      await loadGroupDetails();
    } catch (err) {
      console.error('Error closing group:', err);
    } finally {
      setActionLoading(false);
      setConfirmModal({ open: false, action: null });
    }
  };

  const handleExitMember = async (membershipId: string) => {
    await fetch(`/api/v1/memberships/${membershipId}/exit`, { method: 'POST' });
    await loadGroupDetails();
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-2">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-600">Loading chit group dashboard...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <EmptyState
        title="Group Not Found"
        description="The requested community chit group does not exist or has been removed."
        actionText="Back to Groups"
        onAction={() => router.push('/groups')}
      />
    );
  }

  const activeMembers = members.filter((m) => m.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <GroupHeader
        group={group}
        isOrganizer={isOrganizer}
        onPauseGroup={() => setConfirmModal({ open: true, action: 'pause' })}
        onCloseGroup={() => setConfirmModal({ open: true, action: 'close' })}
      />

      {/* Financial & Member Stats */}
      <GroupStats group={group} activeMemberCount={activeMembers.length} />

      {/* Member Registry */}
      <MemberList
        members={members}
        isOrganizer={isOrganizer}
        onExitMember={handleExitMember}
      />

      {/* Pause Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmModal.open && confirmModal.action === 'pause'}
        title="Pause Chit Group Activity"
        description="Pausing this group will temporarily suspend upcoming auctions and contribution collections until resumed."
        confirmText="Pause Group"
        variant="warning"
        loading={actionLoading}
        onConfirm={handlePauseGroup}
        onClose={() => setConfirmModal({ open: false, action: null })}
      />

      {/* Close Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmModal.open && confirmModal.action === 'close'}
        title="Close Chit Group Permanently"
        description="Are you sure you want to close this group? Closing the group is irreversible and will mark the group as read-only. All contribution audit logs will remain preserved."
        confirmText="Close Group"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleCloseGroup}
        onClose={() => setConfirmModal({ open: false, action: null })}
      />
    </div>
  );
}
