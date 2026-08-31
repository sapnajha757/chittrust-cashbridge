'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, ShieldCheck, Banknote, Calendar, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function OrganizerDashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Chit Organizer Portal
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {profile?.name || 'Organizer'}
          </h1>
          <p className="text-sm text-slate-600">Manage community savings groups, auctions, and member registries.</p>
        </div>

        <Link href="/groups">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create New Group
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">My Active Groups</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">1</p>
              </div>
              <Users className="w-7 h-7 text-blue-600 opacity-80" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Ganesh Traders Chit #1</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Group Members</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">12</p>
              </div>
              <ShieldCheck className="w-7 h-7 text-emerald-600 opacity-80" />
            </div>
            <p className="text-xs text-slate-500 mt-2">6 Digital + 6 Cash Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">Monthly Pool Collection</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">₹30,000</p>
              </div>
              <Banknote className="w-7 h-7 text-amber-600 opacity-80" />
            </div>
            <p className="text-xs text-slate-500 mt-2">₹2,500 / member</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">Upcoming Auction</p>
                <p className="text-lg font-bold text-slate-900 mt-1">15th Sep</p>
              </div>
              <Calendar className="w-7 h-7 text-purple-600 opacity-80" />
            </div>
            <p className="text-xs text-purple-700 font-medium mt-2">Cycle 5 of 12</p>
          </CardContent>
        </Card>
      </div>

      {/* Managed Groups Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Managed Chit Groups</CardTitle>
          <Link href="/groups">
            <Button size="sm" variant="outline">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 text-sm">Ganesh Traders Community Chit #1</p>
                <p className="text-xs text-slate-500">12 Members • Monthly ₹2,500 • Total Pool ₹30,000</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-medium">Active</span>
                <Link href="/groups">
                  <Button size="sm" variant="ghost">Manage <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
