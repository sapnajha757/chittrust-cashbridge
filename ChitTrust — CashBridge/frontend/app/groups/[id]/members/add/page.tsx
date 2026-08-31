'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AddMemberForm } from '@/components/groups/AddMemberForm';

export default function AddMemberPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = (params?.id as string) || '';

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/groups/${groupId}`}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Group Dashboard
        </Link>
      </div>

      <AddMemberForm
        groupId={groupId}
        onSuccess={() => router.push(`/groups/${groupId}`)}
      />
    </div>
  );
}
