'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCheck, User, LogOut, Award, PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { clsx } from 'clsx';

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, trustScore, signOut } = useAuth();

  const role = profile?.role || 'member';

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center font-extrabold text-slate-950 text-lg">
              ₹
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">ChitTrust</span>
              <span className="text-amber-400 text-xs font-semibold block leading-none">CashBridge</span>
            </div>
          </Link>

          {/* Desktop Navigation links based on role */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className={clsx(
                'flex items-center space-x-1.5 transition-colors',
                pathname.startsWith('/dashboard') ? 'text-emerald-400 font-bold' : 'hover:text-emerald-300'
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/groups"
              className={clsx(
                'flex items-center space-x-1.5 transition-colors',
                pathname.startsWith('/groups') ? 'text-emerald-400 font-bold' : 'hover:text-emerald-300'
              )}
            >
              <Users className="w-4 h-4" />
              <span>{role === 'organizer' ? 'Manage Groups' : 'Chit Groups'}</span>
            </Link>

            {role === 'agent' && (
              <Link
                href="/agent"
                className={clsx(
                  'flex items-center space-x-1.5 transition-colors',
                  pathname.startsWith('/agent') ? 'text-amber-400 font-bold' : 'hover:text-amber-300'
                )}
              >
                <UserCheck className="w-4 h-4" />
                <span>Cash Collection</span>
              </Link>
            )}

            <Link
              href="/profile"
              className={clsx(
                'flex items-center space-x-1.5 transition-colors',
                pathname.startsWith('/profile') ? 'text-emerald-400 font-bold' : 'hover:text-emerald-300'
              )}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Link>
          </nav>

          {/* Action Button & User Info */}
          <div className="flex items-center space-x-3">
            {user || profile ? (
              <div className="flex items-center space-x-3">
                {trustScore && (
                  <Link href="/profile" className="hidden sm:inline-flex items-center px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 text-xs font-semibold text-emerald-400">
                    <Award className="w-3.5 h-3.5 mr-1 text-amber-400" />
                    <span>{trustScore.score} Score</span>
                  </Link>
                )}
                <span className="hidden sm:inline text-xs text-slate-300 font-medium">
                  {profile?.name || 'Member'}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
