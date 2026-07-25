'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { label: 'All', emoji: '✨', tag: '' },
  { label: 'Music', emoji: '🎵', tag: 'music' },
  { label: 'Tech', emoji: '💻', tag: 'tech' },
  { label: 'Seminar', emoji: '🎓', tag: 'seminar' },
  { label: 'Sports', emoji: '🏃', tag: 'sports' },
  { label: 'Cultural', emoji: '🎭', tag: 'cultural' },
  { label: 'Food Festival', emoji: '🍽️', tag: 'food' },
];

const CategoriesSection = () => {
  const [active, setActive] = useState('');
  const router = useRouter();

  const handleSelect = (tag: string) => {
    setActive(tag);
    if (tag) {
      router.push(`/?search=${encodeURIComponent(tag)}`);
    } else {
      router.push('/');
    }
  };

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-blue mb-2">Browse by Type</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-dark-gray tracking-tight">
            Explore Event Categories
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-medium-gray">
            From live concerts to coding workshops — find what excites you most.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {CATEGORIES.map((cat) => {
            const isActive = active === cat.tag;
            return (
              <button
                key={cat.tag}
                onClick={() => handleSelect(cat.tag)}
                className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold border-2 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-blue/50 ${
                  isActive
                    ? 'bg-primary-blue border-primary-blue text-white shadow-lg shadow-primary-blue/30'
                    : 'bg-card border-light-gray dark:border-gray-700 text-dark-gray dark:text-gray-200 hover:border-primary-blue dark:hover:border-primary-blue hover:text-primary-blue hover:shadow-md'
                }`}
              >
                <span className="text-lg transition-transform duration-300 group-hover:scale-110">{cat.emoji}</span>
                <span>{cat.label}</span>
                {isActive && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white border-2 border-primary-blue animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
