// frontend/src/app/events/[id]/page.tsx

'use client';

import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { IEvent } from '@/types';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import EventDetailSkeleton from '@/components/shared/EventDetailSkeleton';

export default function EventDetailPage() {
  const { id: eventId } = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  const [event, setEvent] = useState<IEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number>(1);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const formatDateDetails = (isoDate: string) => {
    if (!isoDate) return { full: '', time: '' };
    const date = new Date(isoDate);
    const full = date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { full, time };
  };
  
  const formattedDate = event ? formatDateDetails(event.date) : { full: '', time: '' };
  
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      setIsLoading(true);
      try {
        const response = await api.post('/events/public/find', { id: eventId });
        setEvent(response.data);
      } catch (err) {
        console.error("Failed to fetch event", err);
        setError('Event not found or an error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
        router.push('/login');
        return;
    }
    if (!event || event.spotsLeft === 0 || new Date(event.date) < new Date()) {
      setBookingError("This event cannot be booked.");
      return;
    }
    setIsBooking(true);
    setBookingError(null);
    try {
        await api.post('/bookings', { eventId: event.id, numberOfSeats: selectedSeats });
        router.push('/user/dashboard');
    } catch (err: any) {
        const message = err.response?.data?.message || 'An unexpected error occurred.';
        setBookingError(message);
    } finally {
        setIsBooking(false);
    }
  };
  
  if (isLoading) {
    return (
        <>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <EventDetailSkeleton />
            </main>
            <Footer />
        </>
    )
  }

  if (error || !event) {
    return (
      <>
        <Navbar />
        <main className="min-h-[60vh] flex items-center justify-center">
            <p className="text-xl text-danger-red">{error}</p>
        </main>
        <Footer />
      </>
    );
  }

  const imageUrl = event.imageUrl ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${event.imageUrl}` : '/images/event-placeholder.png';
  const isEventPast = new Date(event.date) < new Date();

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-medium-gray hover:text-dark-gray font-semibold mb-8 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to events
        </Link>
        
        <article>
          <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-lg"><Image src={imageUrl} alt={event.title} layout="fill" objectFit="cover" /></div>
          <div className="mt-8 flex flex-wrap gap-2">{event.tags.map(tag => (<span key={tag} className="px-3 py-1 text-sm font-semibold text-primary-blue bg-indigo-100 rounded-full">{tag}</span>))}</div>
          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-dark-gray">{event.title}</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8 p-6 bg-white rounded-lg shadow-sm border border-light-gray">
              <div className="flex items-center gap-4">
                  <div className="grid place-items-center h-12 w-12 rounded-lg bg-indigo-100 text-primary-blue"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg></div>
                  <div><h4 className="font-semibold text-dark-gray">Date</h4><p className="text-sm text-medium-gray">{formattedDate.full}</p></div>
              </div>
              <div className="flex items-center gap-4">
                   <div className="grid place-items-center h-12 w-12 rounded-lg bg-indigo-100 text-primary-blue"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
                  <div><h4 className="font-semibold text-dark-gray">Time</h4><p className="text-sm text-medium-gray">{formattedDate.time}</p></div>
              </div>
              <div className="flex items-center gap-4">
                  <div className="grid place-items-center h-12 w-12 rounded-lg bg-indigo-100 text-primary-blue"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
                  <div><h4 className="font-semibold text-dark-gray">Location</h4><p className="text-sm text-medium-gray">{event.location}</p></div>
              </div>
          </div>
          
          {(user?.role !== 'ADMIN') && !isEventPast && event.spotsLeft > 0 && (
            <div className="p-8 bg-white rounded-lg shadow-sm border border-light-gray">
                <h3 className="font-bold text-xl text-center text-dark-gray">Select Number of Seats</h3>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto">
                  {[1, 2, 3, 4].map((num) => (
                      <button 
                          key={num} onClick={() => setSelectedSeats(num)} disabled={num > event.spotsLeft}
                          className={`p-4 rounded-lg border-2 text-center transition-all duration-200 
                              ${selectedSeats === num ? 'bg-primary-blue border-primary-blue text-white shadow-lg' : 'bg-gray-50 border-gray-200 text-dark-gray hover:border-primary-blue'}
                              ${num > event.spotsLeft ? 'opacity-50 cursor-not-allowed' : ''}
                          `}>
                        <span className="font-bold text-3xl block">{num}</span><span className="text-sm">{num === 1 ? 'Seat' : 'Seats'}</span>
                      </button>
                  ))}
                </div>
                <div className="mt-8 text-center"><button onClick={handleBooking} disabled={isBooking} className="form-btn-primary px-10 py-3">{isBooking ? 'Booking...' : `Book ${selectedSeats} ${selectedSeats === 1 ? 'Seat' : 'Seats'}`}</button></div>
                 {bookingError && <p className="mt-4 text-center text-danger-red">{bookingError}</p>}
            </div>
          )}

           {user?.role === 'ADMIN' && !isEventPast && (
            <div className="p-4 text-center bg-indigo-100 text-primary-blue rounded-lg font-semibold">
                This is an Admin view. Admin not allow for Booking.
            </div>
           )}
           
          {isEventPast && <div className="p-4 bg-gray-100 text-center text-medium-gray rounded-lg">This event has already passed.</div>}
          {event.spotsLeft === 0 && !isEventPast && <div className="p-4 bg-red-100 text-center text-danger-red rounded-lg">This event is fully booked.</div>}

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-dark-gray">About this event</h2>
            <div className="mt-4 prose-sm sm:prose-base text-medium-gray max-w-none">
                {event.description.split('\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </div>
          
          <div className="mt-12 flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-light-gray">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-blue"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
             <p className="font-bold text-lg text-dark-gray">
                 {event.spotsLeft} Spots Left 
                 <span className="text-sm font-normal text-medium-gray ml-2">({event.bookedSeats} registered)</span>
             </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
