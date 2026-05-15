

'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {

      await api.post('/auth/forgot-password', { email });

      setSuccess(true);


      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset code. Please check your email and try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold text-dark-gray">Forgot Password</h2>
        <p className="mt-2 text-sm text-medium-gray">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-md">
            <p className="text-sm text-green-800 text-center">
              ✓ Verification code sent successfully! Redirecting...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">

            {error && (
              <p className="form-error text-center bg-red-50 border border-red-200 p-3 rounded-md">
                {error}
              </p>
            )}


            <div>
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="enter your email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>


            <div>
              <button
                type="submit"
                className="w-full form-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>


            <p className="text-center mt-4 text-sm text-medium-gray">
              Remember your password?{' '}
              <Link href="/login" className="font-semibold text-primary-blue hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
