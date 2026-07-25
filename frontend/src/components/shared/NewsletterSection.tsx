'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

const CONTACT_INFO = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    label: 'Contact',
    value: 'Hachibur Rahman',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    label: 'Email',
    value: 'hachiburrahman533@gmail.com',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.1 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    label: 'Phone',
    value: '01650100716',
  },
];

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-blue via-indigo-600 to-violet-700 p-10 md:p-16 shadow-2xl shadow-primary-blue/30">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: Newsletter */}
            <div>
              <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">Stay in the Loop</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Never Miss an Event Again
              </h2>
              <p className="mt-4 text-white/70 max-w-md leading-relaxed">
                Subscribe to our newsletter and get early access to exclusive events, special discounts, and curated picks straight to your inbox.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md">
                {!submitted ? (
                  <>
                    <input
                      type="email"
                      id="newsletter-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="flex-1 px-5 py-3.5 rounded-xl bg-white/15 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-sm text-sm"
                    />
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-primary-blue font-bold rounded-xl hover:bg-white/90 transition-all duration-300 hover:-translate-y-0.5 shadow-lg text-sm flex-shrink-0"
                    >
                      Subscribe <Send size={16} />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/20 border border-white/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-white font-semibold text-sm">You're subscribed! 🎉</span>
                  </div>
                )}
              </form>
              <p className="mt-3 text-white/50 text-xs">No spam, ever. Unsubscribe anytime.</p>
            </div>

            {/* Right: Contact Info */}
            <div className="space-y-5">
              <p className="text-white/70 text-sm font-semibold uppercase tracking-widest">Contact Us</p>
              {CONTACT_INFO.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-medium uppercase tracking-wider">{item.label}</p>
                    <p className="text-white font-semibold text-sm mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
