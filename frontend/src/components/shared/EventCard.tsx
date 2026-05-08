import Link from 'next/link';
import Image from 'next/image';
import { IEvent } from '@/types';

type EventCardProps = {
  event: IEvent;
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
  return {
    month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day: date.getDate(),
    dayName: date.toLocaleString('en-US', options),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(' ', '')
  };
};

const EventCard = ({ event }: EventCardProps) => {
  const formattedDate = formatDate(event.date);
  const imageUrl = event.imageUrl
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${event.imageUrl}`
    : '/images/event-placeholder.png'; 

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <article className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col transition-transform transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
        {/* Event Image */}
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={event.title}
            layout="fill"
            objectFit="cover"
            onLoadingComplete={(image) => image.classList.remove("opacity-0")}
            className="transition-opacity duration-300 opacity-0"
          />
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-start gap-4">
            {/* Date Section */}
            <div className="text-center flex-shrink-0">
              <p className="text-primary-blue font-bold text-sm">{formattedDate.month}</p>
              <p className="text-dark-gray font-extrabold text-2xl">{formattedDate.day}</p>
            </div>
            
            {/* Title and Info */}
            <div>
              <h3 className="font-bold text-lg text-dark-gray line-clamp-1">{event.title}</h3>
              <p className="text-medium-gray text-sm mt-1 line-clamp-2">
                We'll get you directly seated and inside for you to enjoy the conference.
              </p>
            </div>
          </div>
          
          {/* Detailed Info (Day, Time, Location) */}
          <div className="mt-4 flex flex-col space-y-2 text-sm text-medium-gray">
             <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                <span>{formattedDate.dayName}</span>
            </div>
             <div className="flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>{formattedDate.time}</span>
            </div>
            <div className="flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
               <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 text-xs font-semibold text-primary-blue bg-indigo-100 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex-grow"></div>

          {/* Card Footer */}
          <div className="mt-5 pt-4 border-t border-light-gray flex justify-between items-center text-sm text-medium-gray">
             <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>{event.spotsLeft} Spots Left</span>
            </div>
            <span className="font-semibold text-dark-gray">Total {event.capacity} Seats</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default EventCard;
