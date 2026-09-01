import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GroupStatusBadge } from './GroupStatusBadge';
import { Plus, PauseCircle, XCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Group } from '@/types';

interface GroupHeaderProps {
  group: Group;
  isOrganizer: boolean;
  onPauseGroup?: () => void;
  onCloseGroup?: () => void;
}

export function GroupHeader({ group, isOrganizer, onPauseGroup, onCloseGroup }: GroupHeaderProps) {
  return (
    <div className="space-y-4 border-b border-slate-200 pb-4">
      <div className="flex items-center justify-between">
        <Link href="/groups" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to All Groups
        </Link>
        <GroupStatusBadge status={group.status} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{group.name}</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Managed by Organizer • Created {new Date(group.created_at).toLocaleDateString()}
          </p>
        </div>

        {isOrganizer && group.status !== 'closed' && (
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/groups/${group.id}/members/add`}>
              <Button size="sm" className="text-xs font-bold flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Member
              </Button>
            </Link>

            {group.status === 'active' && onPauseGroup && (
              <Button size="sm" variant="outline" onClick={onPauseGroup} className="text-xs text-amber-700 hover:bg-amber-50 border-amber-200 flex items-center gap-1">
                <PauseCircle className="w-4 h-4" /> Pause
              </Button>
            )}

            {onCloseGroup && (
              <Button size="sm" variant="outline" onClick={onCloseGroup} className="text-xs text-red-600 hover:bg-red-50 border-red-200 flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Close Group
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
