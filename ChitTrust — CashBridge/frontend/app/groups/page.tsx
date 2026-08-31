'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Search, ShieldCheck } from 'lucide-react';
import { GroupCard } from '@/components/groups/GroupCard';
import { EmptyState } from '@/components/groups/EmptyState';
import { useAuth } from '@/hooks/use-auth';
import { Group } from '@/types';

export default function GroupsDirectoryPage() {
  const { profile } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const isOrganizer = profile?.role === 'organizer';

  useEffect(() => {
    async function loadGroups() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/groups');
        if (res.ok) {
          const data = await res.json();
          setGroups(data);
        } else {
          // Demo fallback
          setGroups([
            {
              id: '11111111-1111-1111-1111-111111111111',
              name: 'Ganesh Traders Community Chit #1',
              total_amount: 30000.0,
              duration_months: 12,
              monthly_contribution: 2500.0,
              cycle_months: 12,
              current_cycle: 4,
              total_members: 12,
              status: 'active',
              auction_type: 'bid' as any,
              organizer_id: '00000000-0000-0000-0000-000000000001',
              created_at: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.error('Error fetching groups:', err);
      } finally {
        setLoading(false);
      }
    }

    loadGroups();
  }, []);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isOrganizer ? 'Managed Chit Groups' : 'My Savings Groups'}
          </h1>
          <p className="text-sm text-slate-600">
            {isOrganizer
              ? 'Organize community chits, invite members, and conduct monthly auctions.'
              : 'View your active community chit fund memberships.'}
          </p>
        </div>

        {isOrganizer && (
          <Link href="/groups/create">
            <Button className="flex items-center gap-2 font-bold shadow">
              <Plus className="w-4 h-4" /> Create Group
            </Button>
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search groups by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white shadow-sm"
        />
      </div>

      {/* Group Directory List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading community groups...</div>
      ) : filteredGroups.length === 0 ? (
        <EmptyState
          icon="folder"
          title="No Community Savings Groups Found"
          description={
            isOrganizer
              ? "You haven't created any community chit groups yet. Click below to start your first group."
              : 'You are not currently enrolled in any community chit groups.'
          }
          actionText={isOrganizer ? '+ Create First Group' : undefined}
          onAction={isOrganizer ? () => (window.location.href = '/groups/create') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              userRole={profile?.role || 'member'}
              memberType="cash"
              agentName="Ramesh Kumar"
            />
          ))}
        </div>
      )}
    </div>
  );
}
