const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'Software Engineer',
    avatar: 'SM',
    avatarColor: 'from-violet-500 to-indigo-500',
    quote:
      'Event Lounge completely changed how I discover tech events. The booking process was seamless and I received my confirmation instantly. Absolutely love the platform!',
    rating: 5,
    event: 'React Summit 2025',
  },
  {
    id: 2,
    name: 'James Okonkwo',
    role: 'Music Producer',
    avatar: 'JO',
    avatarColor: 'from-pink-500 to-rose-500',
    quote:
      "I've used many event platforms but none come close to Event Lounge. The UI is gorgeous, the search is fast, and booking took less than 30 seconds. 10/10!",
    rating: 5,
    event: 'Music Festival Dhaka',
  },
  {
    id: 3,
    name: 'Priya Sharma',
    role: 'PhD Researcher',
    avatar: 'PS',
    avatarColor: 'from-emerald-500 to-teal-500',
    quote:
      'Finally a platform that respects my time. I found a fantastic seminar within minutes of registering. The email confirmation was professional and detailed.',
    rating: 5,
    event: 'AI Research Symposium',
  },
];

const StarRating = ({ count }: { count: number }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={i < count ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        className={i < count ? 'text-amber-400' : 'text-gray-300'}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-blue/[0.03] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-blue mb-2">What People Say</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-dark-gray tracking-tight">
            Loved by Event Enthusiasts
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-medium-gray">
            Real experiences from real attendees who discovered their next great event on Event Lounge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((t, index) => (
            <div
              key={t.id}
              className={`relative bg-card border border-light-gray dark:border-gray-800 rounded-3xl p-7 flex flex-col gap-5 shadow-md dark:shadow-none hover:shadow-xl dark:hover:border-primary-blue/40 transition-all duration-300 hover:-translate-y-1 ${
                index === 1 ? 'md:-mt-4 md:mb-4' : ''
              }`}
            >
              {/* Quote mark decoration */}
              <div className="absolute top-5 right-6 text-6xl text-primary-blue/10 font-serif leading-none select-none">
                "
              </div>

              <StarRating count={t.rating} />

              <p className="text-medium-gray dark:text-gray-400 text-sm leading-relaxed italic">
                "{t.quote}"
              </p>

              <div className="mt-auto pt-4 border-t border-light-gray dark:border-gray-800 flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-dark-gray dark:text-gray-200">{t.name}</p>
                  <p className="text-xs text-medium-gray">{t.role} · {t.event}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
