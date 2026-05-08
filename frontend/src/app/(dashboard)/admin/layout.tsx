// frontend/src/app/(dashboard)/admin/layout.tsx

'use client'; 

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; 
    }
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/user/dashboard');
    }
  }, [user, isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="flex justify-center items-center h-screen bg-light-violet">
        <p>Verifying access...</p>
      </div>
    );
  }

  return <>{children}</>;
}