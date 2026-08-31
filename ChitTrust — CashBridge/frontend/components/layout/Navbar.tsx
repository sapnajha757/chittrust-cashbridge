'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Users, UserCheck, LayoutDashboard, User } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900 text-lg">
              ₹
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">ChitTrust</span>
              <span className="text-amber-400 text-xs font-semibold block leading-none">CashBridge</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="flex items-center space-x-1.5 hover:text-emerald-400 transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link href="/groups" className="flex items-center space-x-1.5 hover:text-emerald-400 transition-colors">
              <Users className="w-4 h-4" />
              <span>Chit Groups</span>
            </Link>
            <Link href="/agent" className="flex items-center space-x-1.5 hover:text-amber-400 transition-colors">
              <UserCheck className="w-4 h-4" />
              <span>Agent Portal</span>
            </Link>
            <Link href="/profile" className="flex items-center space-x-1.5 hover:text-emerald-400 transition-colors">
              <User className="w-4 h-4" />
              <span>Profile & Trust</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
