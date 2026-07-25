const SPONSORS = [
  { name: 'TechCorp', logo: 'TC' },
  { name: 'Innovate BD', logo: 'IB' },
  { name: 'DevHub', logo: 'DH' },
  { name: 'NexaCloud', logo: 'NC' },
  { name: 'MediaWave', logo: 'MW' },
  { name: 'StartupX', logo: 'SX' },
  { name: 'BizPeak', logo: 'BP' },
  { name: 'FutureLink', logo: 'FL' },
];

// Duplicate for seamless infinite scroll
const ALL_SPONSORS = [...SPONSORS, ...SPONSORS];

const SponsorsSection = () => {
  return (
    <section className="py-14 md:py-18 border-y border-light-gray dark:border-gray-800/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-medium-gray">
          Trusted by Leading Organizations
        </p>
      </div>

      {/* Scrolling track */}
      <div className="relative">
        {/* Fade masks */}
        <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex gap-8 animate-scroll-x" style={{ width: 'max-content' }}>
          {ALL_SPONSORS.map((sponsor, index) => (
            <div
              key={`${sponsor.name}-${index}`}
              className="flex-shrink-0 flex items-center gap-3 px-6 py-3 rounded-2xl border border-light-gray dark:border-gray-800 bg-card opacity-60 hover:opacity-100 hover:border-primary-blue/50 transition-all duration-300 group cursor-default"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-blue/20 to-indigo-500/20 flex items-center justify-center text-primary-blue font-bold text-sm">
                {sponsor.logo}
              </div>
              <span className="text-sm font-semibold text-dark-gray dark:text-gray-300 whitespace-nowrap group-hover:text-primary-blue transition-colors">
                {sponsor.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
