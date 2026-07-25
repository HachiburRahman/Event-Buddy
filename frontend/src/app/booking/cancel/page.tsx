'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import api from '@/lib/axios';

function BookingCancelContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');

  const [cleanupDone, setCleanupDone] = useState(false);
  const [isLoading, setIsLoading] = useState(!!bookingId);

  useEffect(() => {
    const cleanupPendingBooking = async () => {
      if (!bookingId) return;

      try {
        await api.delete(`/bookings/cancel-pending/${bookingId}`);
        setCleanupDone(true);
      } catch (err) {
        // Booking may already be cleaned up or paid — not a critical error
        console.warn('Could not clean up pending booking:', err);
      } finally {
        setIsLoading(false);
      }
    };

    cleanupPendingBooking();
  }, [bookingId]);

  if (isLoading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full bg-card border border-light-gray dark:border-gray-800 rounded-3xl p-8 text-center shadow-xl backdrop-blur-md">
          <Loader2 className="h-12 w-12 text-medium-gray animate-spin mx-auto" />
          <p className="mt-4 text-medium-gray dark:text-gray-400 font-medium">Cancelling booking...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card border border-light-gray dark:border-gray-800 rounded-3xl p-8 text-center shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-danger-red/10 blur-[60px] rounded-full -z-10" />

        <div className="flex justify-center mb-6">
          <XCircle className="h-16 w-16 text-danger-red" />
        </div>

        <h1 className="text-3xl font-extrabold text-dark-gray dark:text-gray-100 tracking-tight">
          Checkout Cancelled
        </h1>

        <p className="mt-4 text-medium-gray dark:text-gray-400">
          {cleanupDone
            ? 'Your checkout was cancelled and the pending booking has been removed. No payment was processed.'
            : 'It looks like you cancelled the Stripe checkout process. No payment has been processed.'
          }
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-3 px-6 text-sm font-semibold text-white bg-primary-blue rounded-xl shadow-md shadow-primary-blue/30 hover:opacity-90 transition-all duration-300"
          >
            Browse Events Again
          </Link>
          <Link
            href="/user/dashboard"
            className="w-full py-3 px-6 text-sm font-semibold text-dark-gray dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function BookingCancelPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <main className="min-h-[70vh] flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full bg-card border border-light-gray dark:border-gray-800 rounded-3xl p-8 text-center shadow-xl backdrop-blur-md">
              <Loader2 className="h-12 w-12 text-medium-gray animate-spin mx-auto" />
              <p className="mt-4 text-medium-gray dark:text-gray-400 font-medium">Loading...</p>
            </div>
          </main>
        }
      >
        <BookingCancelContent />
      </Suspense>
      <Footer />
    </>
  );
}
