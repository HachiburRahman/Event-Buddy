// frontend/src/app/(auth)/reset-password/page.tsx

'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeVerified, setCodeVerified] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  const handleVerifyCode = async () => {
    if (!resetCode || resetCode.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setVerifyingCode(true);
    setError(null);

    try {
      await api.post('/auth/verify-reset-code', {
        email: email || '',
        resetCode,
      });

      setCodeVerified(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid or expired verification code.';
      setError(errorMessage);
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    // Check if password contains at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      setError('Password must contain at least one letter and one number.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.patch('/auth/reset-password', {
        email: email || '',
        resetCode,
        newPassword,
      });

      // Show success message
      alert('Password has been reset successfully! Please log in with your new password.');
      router.push('/login');

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password. The code may be invalid or expired.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold text-dark-gray">Reset Your Password</h2>
        <p className="mt-2 text-sm text-medium-gray">
          Enter the 6-digit verification code sent to{' '}
          <span className="font-medium text-dark-gray">{email || 'your email'}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <p className="form-error text-center bg-red-50 border border-red-200 p-3 rounded-md">
              {error}
            </p>
          )}

          {/* Verification Code Input */}
          <div>
            <label htmlFor="resetCode" className="form-label">Verification Code</label>
            <input
              id="resetCode"
              name="resetCode"
              type="text"
              required
              maxLength={6}
              placeholder="Enter 6-digit code"
              className="form-input text-center text-lg tracking-widest"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))} // Only allow numbers
              disabled={isLoading || codeVerified}
            />
            {!codeVerified && (
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={verifyingCode || resetCode.length !== 6}
                className="w-full mt-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {verifyingCode ? 'Verifying...' : 'Verify Code'}
              </button>
            )}
            {codeVerified && (
              <p className="mt-2 text-sm text-green-600 text-center">✓ Code verified successfully</p>
            )}
          </div>

          {/* New Password Input */}
          <div>
            <label htmlFor="newPassword" className="form-label">New Password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="enter new password (min. 8 characters)"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading || !codeVerified}
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="confirm new password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || !codeVerified}
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full form-btn-primary"
              disabled={isLoading || !codeVerified}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>

          {/* Resend Code Link */}
          <div className="text-center">
            <p className="text-sm text-medium-gray">
              Didn't receive the code?{' '}
              <Link
                href="/forgot-password"
                className="font-semibold text-primary-blue hover:underline"
              >
                Resend
              </Link>
            </p>
          </div>

          {/* Back to Login Link */}
          <div className="text-center">
            <Link href="/login" className="text-sm text-primary-blue hover:underline">
              ← Back to Sign in
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
