// /Users/jalalsmac/event-buddy/frontend/src/app/(dashboard)/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IEvent } from '@/types';
import api from '@/lib/axios';
import EventTableSkeleton from '@/components/shared/EventTableSkeleton';
import Modal from '@/components/ui/Modal';
import EventForm from '@/components/shared/EventForm';

export default function AdminDashboardPage() {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedEvent, setSelectedEvent] = useState<IEvent | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchEvents = async () => { setIsLoading(true);setError(null);try {const { data } = await api.get('/events');setEvents(data);} catch (err) {console.error('Failed to fetch events', err);setError('Could not load events. Please try refreshing the page.');} finally {setIsLoading(false);}};
    useEffect(() => { fetchEvents(); }, []);

    const handleOpenCreateModal = () => { setFormMode('create'); setSelectedEvent(undefined); setIsModalOpen(true); };
    const handleOpenEditModal = (event: IEvent) => { setFormMode('edit'); setSelectedEvent(event); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedEvent(undefined); };

    const handleFormSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            if (formMode === 'create') {
                await api.post('/events', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                if (!selectedEvent?.id) {
                    throw new Error("No event selected for editing.");
                }
                
                await api.patch(`/events/${selectedEvent.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            handleCloseModal();
            fetchEvents();
        } catch (err) {
            console.error('Failed to submit form:', err);
            alert(`Error: Could not ${formMode} event. Please try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (eventId: string) => { if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {return;}try {await api.delete('/events', { data: { id: eventId } }); fetchEvents();} catch (err) {console.error('Failed to delete event:', err); alert('Failed to delete the event. Please try again.');}};
    const formatDate = (isoDate: string) => new Date(isoDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const renderEventTable = () => {
        if (isLoading) return <EventTableSkeleton />;
        if (error) return <p className="text-center text-danger-red">{error}</p>;
        if (events.length === 0) return <p className="text-center text-medium-gray py-8">No events created yet.</p>;
        return (
            <div className="overflow-x-auto"><table className="min-w-full bg-white rounded-lg shadow"><thead className="bg-gray-50"><tr><th scope="col" className="p-4 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Title</th><th scope="col" className="p-4 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Date</th><th scope="col" className="p-4 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Location</th><th scope="col" className="p-4 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Registrations</th><th scope="col" className="p-4 text-left text-xs font-semibold text-medium-gray uppercase tracking-wider">Actions</th></tr></thead><tbody className="divide-y divide-gray-200">{events.map((event) => (<tr key={event.id}><td className="p-4 whitespace-nowrap text-sm font-medium text-dark-gray">{event.title}</td><td className="p-4 whitespace-nowrap text-sm text-medium-gray">{formatDate(event.date)}</td><td className="p-4 whitespace-nowrap text-sm text-medium-gray">{event.location}</td><td className="p-4 whitespace-nowrap text-sm text-medium-gray">{event.bookedSeats} / {event.capacity}</td><td className="p-4 whitespace-nowrap text-sm font-medium"><div className="flex items-center space-x-4"><button onClick={() => router.push(`/events/${event.id}`)} className="text-medium-gray hover:text-primary-blue" title="View Event"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button><button onClick={() => handleOpenEditModal(event)} className="text-medium-gray hover:text-primary-blue" title="Edit Event"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button><button onClick={() => handleDelete(event.id)} className="text-danger-red hover:text-red-700" title="Delete Event"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button></div></td></tr>))}</tbody></table></div>
        );
    }
    
    return (
        <>
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-extrabold text-dark-gray">Admin Dashboard</h1>
                <p className="mt-2 text-lg text-medium-gray">Manage events, view registrations, and monitor your platform.</p>
                <section className="mt-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-dark-gray">Events Management</h2>
                        <button onClick={handleOpenCreateModal} className="form-btn-primary">Create Event</button>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-light-gray">
                        {renderEventTable()}
                    </div>
                </section>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={formMode === 'create' ? 'Create New Event' : 'Edit Event'}>
                <EventForm mode={formMode} initialData={selectedEvent} onSubmit={handleFormSubmit} onCancel={handleCloseModal} isLoading={isSubmitting}/>
            </Modal>
        </>
    );
}