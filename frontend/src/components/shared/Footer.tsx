// frontend/src/components/shared/Footer.tsx

import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-light-violet mt-16 md:mt-24">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              {/* Simple Briefcase Icon for Logo */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-blue"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              <span className="font-bold text-xl text-dark-gray">Event buddy.</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/" className="text-sm font-medium text-medium-gray hover:text-primary-blue transition-colors">
              Home
            </Link>
            <Link href="/login" className="text-sm font-medium text-medium-gray hover:text-primary-blue transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="text-sm font-medium text-medium-gray hover:text-primary-blue transition-colors">
              Sign up
            </Link>
            {/* Assuming a privacy page exists or will be created */}
            <Link href="/privacy" className="text-sm font-medium text-medium-gray hover:text-primary-blue transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Divider and Copyright */}
        <div className="mt-8 pt-8 border-t border-light-gray text-center">
          <p className="text-sm text-medium-gray">
            © {new Date().getFullYear()} Event buddy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;