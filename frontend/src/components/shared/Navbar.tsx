

'use client'; 

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const Navbar = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderAuthLinks = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2 animate-pulse">
          <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
          <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        </div>
      );
    }
    
    if (isAuthenticated && user) {
      const dashboardHref = user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';
      
      const displayName =
        user.role === 'ADMIN'
          ? 'Admin'
          : user.fullName?.split(' ')[0] || 'User';

      return (
        <div className="flex items-center space-x-4">
          <Link href={dashboardHref} className="text-dark-gray hover:text-primary-blue font-semibold transition-colors">
            Hello, {displayName}
          </Link>
          <ThemeToggle />
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-semibold text-white bg-primary-blue rounded-lg shadow-sm hover:opacity-90 transition-all duration-300"
          >
            Logout
          </button>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-3">
        <ThemeToggle />
        <Link href="/login">
          <span className="px-4 py-2 text-sm font-semibold text-dark-gray dark:text-gray-200 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300">
            Sign in
          </span>
        </Link>
        <Link href="/register">
          <span className="px-4 py-2 text-sm font-semibold text-white bg-primary-blue rounded-lg shadow-md shadow-primary-blue/30 hover:shadow-primary-blue/50 hover:-translate-y-0.5 transition-all duration-300">
            Sign up
          </span>
        </Link>
      </div>
    );
  };
  
  return (
    <nav className="bg-background/70 dark:bg-background/60 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 group">
            <Link href="/" className="flex items-center space-x-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-blue group-hover:scale-110 transition-transform duration-300"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              <span className="font-bold text-xl text-dark-gray bg-clip-text">Event buddy.</span>
            </Link>
          </div>
          <div className="hidden md:block">
            {renderAuthLinks()}
          </div>
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-dark-gray hover:text-primary-blue focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-background/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <div className="flex flex-col items-center space-y-4 py-4">
            {renderAuthLinks()}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
