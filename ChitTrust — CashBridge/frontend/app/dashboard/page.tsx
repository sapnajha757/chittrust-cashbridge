import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ShieldCheck, Users, Banknote, Clock, ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Member Dashboard</h1>
          <p className="text-sm text-slate-600">Track your active chits, contributions, and trust rating.</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> TrustScore: 745 (Gold)
          </span>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-emerald-900 text-white">
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-emerald-200 font-medium">Total Monthly Savings</p>
                <p className="text-2xl font-extrabold mt-1">₹5,000</p>
              </div>
              <Wallet className="w-8 h-8 text-emerald-400 opacity-80" />
            </div>
            <p className="text-xs text-emerald-300 mt-3">2 Active Chit Groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">Next Due Date</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">10th Sep</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500 opacity-80" />
            </div>
            <p className="text-xs text-amber-600 font-medium mt-3">₹2,500 Due (Ganesh Chits)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium">Verification Mode</p>
                <p className="text-lg font-bold text-slate-900 mt-1">Dual Mode</p>
              </div>
              <Banknote className="w-8 h-8 text-blue-600 opacity-80" />
            </div>
            <p className="text-xs text-slate-500 mt-3">Cash Agent / UPI Enabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Groups Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Your Active Groups</CardTitle>
          <Button size="sm" variant="outline">Explore All</Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 text-sm">Ganesh Traders Chit #1</p>
                <p className="text-xs text-slate-500">Cycle 4 of 12 • Monthly ₹2,500</p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-medium">Paid (Cash Agent Verified)</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 text-sm">Lakshmi Mahila Savings</p>
                <p className="text-xs text-slate-500">Cycle 2 of 10 • Monthly ₹2,500</p>
              </div>
              <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium">Due in 5 days</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
