// frontend/src/app/(dashboard)/user/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { IBooking } from '@/types';

export default function UserDashboardPage() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<IBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        return {
            month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
            day: date.getDate(),
            dayName: date.toLocaleString('en-US', { weekday: 'long' }),
            time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        };
    };

    useEffect(() => {
        const fetchBookings = async () => {
            setIsLoading(true);
            try {
                const { data } = await api.get('/bookings/my-bookings');
                setBookings(data);
            } catch (err) {
                console.error('Failed to fetch bookings:', err);
                setError('Could not load your bookings.');
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchBookings();
        }
    }, [user]);

    const handleCancelBooking = async (bookingId: string) => {
        
        if (!window.confirm('Are you sure you want to cancel this registration?')) {
            return;
        }

        try {
            await api.delete('/bookings/cancel', { data: { bookingId } }); 
            
            setBookings(prevBookings => prevBookings.filter(b => b.id !== bookingId));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to cancel booking.');
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4 animate-pulse">
                    {[1, 2].map(i => (
                        <div key={i} className="flex items-center justify-between p-6 bg-white rounded-lg shadow-sm">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="h-4 w-10 bg-gray-300 rounded"></div>
                                    <div className="h-8 w-10 mt-1 bg-gray-200 rounded"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-5 w-48 bg-gray-300 rounded"></div>
                                    <div className="h-4 w-64 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                            <div className="h-10 w-32 bg-gray-300 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            );
        }

        if (error) {
            return <p className="text-center text-danger-red">{error}</p>;
        }

        if (bookings.length === 0) {
            return (
                <div className="text-center py-16">
                    <h3 className="text-xl font-semibold text-dark-gray">No Registered Events</h3>
                    <p className="mt-2 text-medium-gray">You haven't booked any events yet. Why not find one?</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {bookings.map((booking) => {
                    const { event } = booking;
                    const { month, day, dayName, time } = formatDate(event.date);
                    return (
                        <div key={booking.id} className="bg-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                <div className="text-center flex-shrink-0 w-16">
                                    <p className="text-primary-blue font-bold">{month}</p>
                                    <p className="text-3xl font-extrabold text-dark-gray">{day}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-dark-gray">{event.title}</h4>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-medium-gray mt-1">
                                        <span className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>{dayName}</span>
                                        <span className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>{time}</span>
                                        <span className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>{event.location}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="w-full md:w-auto px-4 py-2 text-sm font-semibold text-white bg-danger-red rounded-lg shadow-sm hover:bg-red-600 transition-colors"
                            >
                                Cancel registration
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-dark-gray">Dashboard</h1>
            <p className="mt-2 text-lg text-medium-gray">
                Welcome back, {user?.fullName?.split(' ')[0]}! Here you can manage your event registrations.
            </p>
            
            <section className="mt-12">
                <h2 className="text-2xl font-bold text-dark-gray">My Registered Events</h2>
                <div className="mt-6">
                    {renderContent()}
                </div>
                <div className="mt-12 text-center">
                    <Link href="/" className="form-btn-primary">
                        Browse more events
                    </Link>
                </div>
            </section>
        </div>
    );
}