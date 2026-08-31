import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderPlus, Users, UserX } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'folder' | 'users' | 'agent';
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'folder', title, description, actionText, onAction }: EmptyStateProps) {
  const icons = {
    folder: FolderPlus,
    users: Users,
    agent: UserX,
  };
  const IconComponent = icons[icon];

  return (
    <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 py-8 text-center">
      <CardContent className="space-y-3">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-slate-400">
          <IconComponent className="w-6 h-6 text-slate-500" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">{description}</p>
        </div>
        {actionText && onAction && (
          <Button size="sm" onClick={onAction} className="mt-2 text-xs">
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
