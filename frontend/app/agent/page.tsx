import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, Camera, CheckCircle2, MapPin, Banknote, ShieldAlert } from 'lucide-react';

export default function AgentPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CashBridge Agent Portal</h1>
          <p className="text-sm text-slate-600">Record cash collections, upload photo proof, and credit cash members.</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
            <UserCheck className="w-3.5 h-3.5 mr-1" /> Agent ID: CB-8921 (Verified)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Action Card */}
        <Card className="md:col-span-2 border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-amber-600" /> Record Doorstep Cash Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Cash Member</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none">
                  <option value="">-- Choose Member --</option>
                  <option value="1">Anil Verma (+91 98123 45678) - Ganesh Chit</option>
                  <option value="2">Priya Sharma (+91 97654 32109) - Lakshmi Chit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cash Amount Collected (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 2500"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Photo Proof Placeholder */}
            <div className="border-2 border-dashed border-amber-300 rounded-xl p-6 text-center bg-white space-y-2">
              <Camera className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">Upload Photo Proof of Cash Receipt</p>
              <p className="text-xs text-slate-500">Capture cash + physical receipt for instant verification</p>
              <Button size="sm" variant="cash" className="mt-2">
                Take / Upload Photo
              </Button>
            </div>

            <Button variant="cash" className="w-full font-bold py-2.5">
              Submit & Issue Digital Verification Receipt
            </Button>
          </CardContent>
        </Card>

        {/* Agent Stats & Pending Verification */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Today&apos;s Collection Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Total Cash Collected</span>
                <span className="font-bold text-slate-900">₹12,500</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Members Serviced</span>
                <span className="font-bold text-slate-900">5 Members</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Service Area</span>
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> Ward 14, Jaipur
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Audit Log & Proofs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">
                All cash collection receipts are timestamped and cryptographically linked to member trust profiles.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
