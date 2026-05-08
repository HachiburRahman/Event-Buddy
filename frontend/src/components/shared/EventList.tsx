// frontend/src/components/shared/EventList.tsx

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
};

const EventList = ({ title, type }: EventListProps) => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
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
        },
      });

      setEvents(response.data.data);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.page);
    } catch (err) {
      console.error(`Failed to fetch ${type} events:`, err);
      setError('Could not load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [type]); 

  useEffect(() => {
    fetchEvents(currentPage);
  }, [fetchEvents, currentPage]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: limit }).map((_, index) => (
            <EventCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return <p className="text-center text-danger-red">{error}</p>;
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
