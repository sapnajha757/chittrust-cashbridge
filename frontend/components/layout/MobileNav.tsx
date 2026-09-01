'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCheck, User, Home, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { clsx } from 'clsx';

export function MobileNav() {
  const pathname = usePathname();
  const { user, profile } = useAuth();

  const role = profile?.role || 'member';

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/groups', label: 'Groups', icon: Users },
    ...(role === 'agent' ? [{ href: '/agent', label: 'Agent', icon: UserCheck }] : []),
    ...(user ? [{ href: '/profile', label: 'Profile', icon: User }] : [{ href: '/login', label: 'Sign In', icon: LogIn }]),
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 text-slate-300">
      <div className={`grid grid-cols-${navItems.length} h-16 text-center text-xs`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center py-1 transition-colors',
                isActive ? 'text-emerald-400 font-bold' : 'hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
