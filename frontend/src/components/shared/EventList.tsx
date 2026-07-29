

'use client'; 

import { useState, useEffect, useCallback } from 'react';
import { IEvent, PaginatedResponse } from '@/types';
import api from '@/lib/axios';
import EventCard from './EventCard';
import EventCardSkeleton from './EventCardSkeleton';
import Pagination from '../ui/Pagination';

type EventListProps = {
  title: string;
  type: 'upcoming' | 'past';
  search?: string;
};

const EventList = ({ title, type, search }: EventListProps) => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // The API runs on a Render free instance that sleeps when idle. A cold start
  // takes a while, so tell the user that instead of showing a silent skeleton.
  const [isSlow, setIsSlow] = useState(false);

  const limit = 6;

  const fetchEvents = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {

      const endpoint = `/events/${type}`;
      const response = await api.get<PaginatedResponse<IEvent>>(endpoint, {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
        },
      });

      setEvents(response.data.data);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.page);
    } catch (err) {
      console.error(`Failed to fetch ${type} events:`, err);
      setError('Could not load events. The server may be waking up.');
    } finally {
      setIsLoading(false);
    }
  }, [type, search]);

  useEffect(() => {
    fetchEvents(currentPage);
  }, [fetchEvents, currentPage]);

  useEffect(() => {
    if (!isLoading) {
      setIsSlow(false);
      return;
    }
    const timer = setTimeout(() => setIsSlow(true), 4000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          {isSlow && (
            <p className="text-center text-medium-gray mb-6">
              Waking up the server, this can take up to a minute on the first visit.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: limit }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        </>
      );
    }

    if (error) {
      return (
        <div className="text-center">
          <p className="text-danger-red">{error}</p>
          <button
            type="button"
            onClick={() => fetchEvents(currentPage)}
            className="mt-4 py-2 px-6 text-sm font-semibold text-white bg-primary-blue rounded-xl shadow-md shadow-primary-blue/30 hover:opacity-90 transition-all duration-300"
          >
            Try again
          </button>
        </div>
      );
    }

    if (events.length === 0) {
      return <p className="text-center text-medium-gray">No events found.</p>;
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    );
  };
  
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-dark-gray mb-8">{title}</h2>
        
        {renderContent()}

        {!isLoading && !error && events.length > 0 && totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default EventList;
