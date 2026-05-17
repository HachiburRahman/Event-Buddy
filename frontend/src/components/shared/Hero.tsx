'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

const Hero = ({ initialSearch = '' }: { initialSearch?: string }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <section className="relative pt-40 pb-24 text-center overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-blue/10 via-background to-background -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary-blue/15 dark:bg-primary-blue/10 blur-[120px] rounded-full -z-10 mix-blend-multiply dark:mix-blend-screen" />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold text-dark-gray tracking-tight drop-shadow-sm">
          Discover
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-indigo-400">Amazing Events</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-medium-gray leading-relaxed">
          Find and book events that match your interests. From tech conferences to music festivals, we've got you covered.
        </p>

        <div className="mt-12 max-w-2xl mx-auto">
          <p className="font-semibold text-dark-gray mb-4">Find Your Next Event</p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 dark:bg-card/50 backdrop-blur-md p-2 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-gray-200/50 dark:shadow-none transition-all">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search events" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-transparent border-none rounded-xl focus:outline-none focus:ring-0 text-dark-gray placeholder-gray-400"
              />
            </div>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-8 py-3 text-base font-semibold text-white bg-primary-blue rounded-xl shadow-md shadow-primary-blue/30 hover:shadow-primary-blue/50 hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;