// /Users/jalalsmac/event-buddy/frontend/src/components/shared/DashboardNavbar.tsx

'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { IUser } from '@/types';

type DashboardNavbarProps = {
  user: IUser | null;
};

const DashboardNavbar = ({ user }: DashboardNavbarProps) => {
  const { logout } = useAuth();
  
  if (!user) return null;
  
  const dashboardHref = user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';

  const displayName =
    user.role === 'ADMIN'
      ? 'Admin' 
      : user.fullName?.split(' ')[0] || 'User'; 

  return (
    <header className="bg-light-violet/80 backdrop-blur-sm sticky top-0 z-50 border-b border-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-blue"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              <span className="font-bold text-xl text-dark-gray">Event buddy.</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
              <Link href={dashboardHref} className="font-semibold text-dark-gray hover:text-primary-blue transition-colors">
                  Hello, {displayName} 
              </Link>
              <button 
                  onClick={logout}
                  className="px-4 py-2 flex items-center gap-2 text-sm font-semibold text-white bg-primary-blue rounded-lg shadow-sm hover:bg-indigo-600 transition-colors"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                  Logout
              </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;