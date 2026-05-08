// src/components/shared/Hero.tsx
import { Search } from 'lucide-react';

const Hero = () => {
  return (
    <section 
      className="relative bg-cover bg-center bg-no-repeat pt-40 pb-20 text-center"
      style={{ backgroundImage: "url('/images/hero-bg.png')" }}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl md:text-7xl font-bold text-dark-gray tracking-tight">
          Discover
          <br />
          <span className="text-primary-blue">Amazing Events</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-medium-gray">
          Find and book events that match your interests. From tech conferences to music festivals, we've got you covered.
        </p>

        <div className="mt-10">
          <p className="font-semibold text-dark-gray mb-4">Find Your Next Event</p>
          <form className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search events" 
                className="w-full pl-12 pr-4 py-3 bg-white border border-light-gray rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-8 py-3 text-base font-semibold text-white bg-primary-blue rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300 flex-shrink-0"
            >
              Search Events
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;