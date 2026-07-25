'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import api from '@/lib/axios';

interface SessionData {
  paymentStatus: string;
  amountTotal: number;
  currency: string;
  bookingId: string | null;
  customerEmail: string | null;
  eventName: string | null;
}

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setError('No session ID found. Unable to verify payment.');
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/payments/verify-session?session_id=${sessionId}`);
        setSessionData(data);
      } catch (err: any) {
        console.error('Failed to verify session:', err);
        setError('Unable to verify your payment. Please check your email for confirmation or contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  if (isLoading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full bg-card border border-light-gray dark:border-gray-800 rounded-3xl p-8 text-center shadow-xl backdrop-blur-md">
          <Loader2 className="h-12 w-12 text-primary-blue animate-spin mx-auto" />
          <p className="mt-4 text-medium-gray dark:text-gray-400 font-medium">Verifying your payment...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full bg-card border border-light-gray dark:border-gray-800 rounded-3xl p-8 text-center shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full -z-10" />
          <div className="flex justify-center mb-6">
            <AlertTriangle className="h-16 w-16 text-amber-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-dark-gray dark:text-gray-100 tracking-tight">
            Verification Issue
          </h1>
          <p className="mt-4 text-medium-gray dark:text-gray-400">{error}</p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/user/dashboard"
              className="w-full py-3 px-6 text-sm font-semibold text-white bg-primary-blue rounded-xl shadow-md shadow-primary-blue/30 hover:opacity-90 transition-all duration-300"
            >
              Go to My Bookings
            </Link>
            <Link
              href="/"
              className="w-full py-3 px-6 text-sm font-semibold text-dark-gray dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isPaid = sessionData?.paymentStatus === 'paid';

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card border border-light-gray dark:border-gray-800 rounded-3xl p-8 text-center shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary-blue/10 blur-[60px] rounded-full -z-10" />

        <div className="flex justify-center mb-6">
          <CheckCircle2 className={`h-16 w-16 ${isPaid ? 'text-emerald-500' : 'text-amber-500'}`} />
        </div>

        <h1 className="text-3xl font-extrabold text-dark-gray dark:text-gray-100 tracking-tight">
          {isPaid ? 'Booking Confirmed!' : 'Payment Pending'}
        </h1>

        <p className="mt-4 text-medium-gray dark:text-gray-400">
          {isPaid
            ? 'Thank you for your purchase. Your transaction was completed successfully, and your ticket has been secured.'
            : 'Your payment is still being processed. You will receive a confirmation email once it completes.'
          }
        </p>

        <div className="mt-8 p-4 bg-light-violet/30 dark:bg-slate-800/30 border border-light-gray dark:border-gray-800 rounded-2xl text-left text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-medium-gray dark:text-gray-400">Status</span>
            <span className={`font-bold font-mono ${isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {isPaid ? 'PAID & SECURED' : 'PROCESSING'}
            </span>
          </div>
          {sessionData?.eventName && (
            <div className="flex justify-between">
              <span className="text-medium-gray dark:text-gray-400">Event</span>
              <span className="font-semibold text-dark-gray dark:text-gray-200 text-right max-w-[200px] truncate">{sessionData.eventName}</span>
            </div>
          )}
          {sessionData?.amountTotal != null && sessionData.amountTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-medium-gray dark:text-gray-400">Amount Paid</span>
              <span className="font-semibold text-dark-gray dark:text-gray-200">
                ${sessionData.amountTotal.toFixed(2)} {sessionData.currency?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-medium-gray dark:text-gray-400">Confirmation</span>
            <span className="font-semibold text-dark-gray dark:text-gray-200">Sent via Email</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/user/dashboard"
            className="w-full py-3 px-6 text-sm font-semibold text-white bg-primary-blue rounded-xl shadow-md shadow-primary-blue/30 hover:opacity-90 transition-all duration-300"
          >
            Go to My Bookings
          </Link>
          <Link
            href="/"
            className="w-full py-3 px-6 text-sm font-semibold text-dark-gray dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function BookingSuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <main className="min-h-[70vh] flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full bg-card border border-light-gray dark:border-gray-800 rounded-3xl p-8 text-center shadow-xl backdrop-blur-md">
              <Loader2 className="h-12 w-12 text-primary-blue animate-spin mx-auto" />
              <p className="mt-4 text-medium-gray dark:text-gray-400 font-medium">Loading...</p>
            </div>
          </main>
        }
      >
        <BookingSuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}
