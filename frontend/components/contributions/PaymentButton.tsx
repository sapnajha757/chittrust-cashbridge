'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { loadRazorpayScript } from '@/lib/razorpay';

interface PaymentButtonProps {
  membershipId: string;
  monthNumber: number;
  amount: number;
  groupName: string;
  isPaid?: boolean;
  onSuccess: (receipt: any) => void;
  onProcessingChange?: (processing: boolean) => void;
}

export function PaymentButton({
  membershipId,
  monthNumber,
  amount,
  groupName,
  isPaid = false,
  onSuccess,
  onProcessingChange,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  if (isPaid) {
    return (
      <Button disabled variant="outline" className="w-full bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 py-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Paid for Month {monthNumber} ✓
      </Button>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    onProcessingChange?.(true);

    try {
      // 1. Request Order Creation from Backend (Server calculates amount in integer paise)
      const orderRes = await fetch('/api/v1/contributions/upi/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membership_id: membershipId,
          month_number: monthNumber,
        }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create Razorpay Order.');
      }

      const orderData = await orderRes.json();

      // 2. Load Razorpay Checkout Script
      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && (window as any).Razorpay && !orderData.order_id.startsWith('order_demo_')) {
        // Real Razorpay Checkout modal
        const options = {
          key: orderData.key_id,
          amount: orderData.amount_paise,
          currency: orderData.currency,
          name: 'ChitTrust + CashBridge',
          description: `Contribution for ${groupName} (Month ${monthNumber})`,
          order_id: orderData.order_id,
          handler: async function (response: any) {
            // 3. Send payment callback parameters to backend for cryptographic signature verification
            const verifyRes = await fetch('/api/v1/contributions/upi/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                membership_id: membershipId,
                month_number: monthNumber,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              const verifiedData = await verifyRes.json();
              onSuccess({
                groupName,
                monthNumber,
                amount,
                paymentMode: 'UPI',
                transactionRef: response.razorpay_payment_id,
                paymentDate: new Date().toISOString(),
              });
            } else {
              alert('Payment verification failed on server.');
            }
            setLoading(false);
            onProcessingChange?.(false);
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              onProcessingChange?.(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Test Mode Simulation (Auto verify mock checkout)
        setTimeout(async () => {
          const mockPaymentId = `pay_demo_${Math.floor(100000 + Math.random() * 900000)}`;
          const mockSignature = `sig_demo_${Math.floor(100000 + Math.random() * 900000)}`;

          const verifyRes = await fetch('/api/v1/contributions/upi/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              membership_id: membershipId,
              month_number: monthNumber,
              razorpay_order_id: orderData.order_id,
              razorpay_payment_id: mockPaymentId,
              razorpay_signature: mockSignature,
            }),
          });

          if (verifyRes.ok) {
            onSuccess({
              groupName,
              monthNumber,
              amount,
              paymentMode: 'UPI',
              transactionRef: mockPaymentId,
              paymentDate: new Date().toISOString(),
            });
          }
          setLoading(false);
          onProcessingChange?.(false);
        }, 1200);
      }
    } catch (err: unknown) {
      console.error('Payment flow exception:', err);
      alert('We could not initiate the payment. Please try again.');
      setLoading(false);
      onProcessingChange?.(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow flex items-center justify-center gap-2"
    >
      {loading ? (
        <span className="flex items-center gap-1.5">
          <Loader2 className="w-4 h-4 animate-spin" /> Verifying Test Payment...
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <CreditCard className="w-4 h-4" /> Pay ₹{amount.toLocaleString('en-IN')} via UPI
        </span>
      )}
    </Button>
  );
}
