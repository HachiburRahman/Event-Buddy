// /Users/jalalsmac/event-buddy/frontend/src/components/shared/EventForm.tsx
'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { IEvent } from '@/types';

type EventFormData = Omit<IEvent, 'id' | 'createdAt' | 'updatedAt' | 'bookedSeats' | 'spotsLeft' | 'date' | 'tags'> & {
    date: string;
    time: string;
    image: File | null;
    tags: string; 
};

type EventFormProps = {
    mode: 'create' | 'edit';
    initialData?: IEvent;
    onSubmit: (formData: FormData) => void;
    onCancel: () => void;
    isLoading: boolean;
};

const EventForm = ({ mode, initialData, onSubmit, onCancel, isLoading }: EventFormProps) => {
    const [formData, setFormData] = useState<EventFormData>({
        title: '', description: '', date: '', time: '', location: '', capacity: 100, tags: '', imageUrl: '', image: null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            const eventDate = new Date(initialData.date);
            const dateStr = eventDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

            setFormData({
                title: initialData.title,
                description: initialData.description,
                date: dateStr,
                time: timeStr,
                location: initialData.location,
                capacity: initialData.capacity,
                tags: initialData.tags.join(', '), // Convert string[] to string
                imageUrl: initialData.imageUrl,
                image: null,
            });
            
            if (initialData.imageUrl) {
                setImagePreview(`${process.env.NEXT_PUBLIC_API_BASE_URL}${initialData.imageUrl}`);
            }
        }
    }, [mode, initialData]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { alert('File is too large. Max size is 5MB.'); return; }
            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.title || !formData.date || !formData.time || !formData.location) {
            setError('Please fill out all required fields.'); return;
        }
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('date', formData.date);
        data.append('time', formData.time);
        data.append('location', formData.location);
        data.append('capacity', String(formData.capacity));
        data.append('tags', formData.tags);

        if (formData.image) { data.append('image', formData.image); }
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2"><label htmlFor="title" className="form-label">Title</label><input type="text" name="title" id="title" className="form-input" value={formData.title} onChange={handleChange} required /></div>
                 <div><label htmlFor="date" className="form-label">Date</label><input type="date" name="date" id="date" className="form-input" value={formData.date} onChange={handleChange} required /></div>
                 <div><label htmlFor="time" className="form-label">Time</label><input type="text" name="time" id="time" placeholder="e.g. 09:00AM - 11:00AM" className="form-input" value={formData.time} onChange={handleChange} required /></div>
                 <div className="md:col-span-2"><label htmlFor="description" className="form-label">Description</label><textarea name="description" id="description" rows={3} className="form-input" value={formData.description} onChange={handleChange}></textarea></div>
                 <div className="md:col-span-2"><label htmlFor="location" className="form-label">Event Location</label><input type="text" name="location" id="location" className="form-input" value={formData.location} onChange={handleChange} required /></div>
                 <div><label htmlFor="capacity" className="form-label">Capacity</label><input type="number" name="capacity" id="capacity" className="form-input" value={formData.capacity} onChange={handleChange} min="1" /></div>
                 <div><label htmlFor="tags" className="form-label">Tags (comma separated)</label><input type="text" name="tags" id="tags" className="form-input" value={formData.tags} onChange={handleChange} /></div>
             </div>
             <div>
                <label className="form-label">Image</label>
                <div className="mt-1 flex flex-col items-center justify-center p-4 border-2 border-gray-300 border-dashed rounded-md">
                    {imagePreview && <div className="relative h-24 w-48 mb-2"><Image src={imagePreview} alt="Preview" layout="fill" objectFit="contain" /></div>}
                    <span className="text-sm text-gray-600">Drag or <label htmlFor="image-upload" className="cursor-pointer font-medium text-primary-blue hover:underline">upload</label> the picture here</span>
                    <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg" />
                    <p className="text-xs text-gray-500 mt-1">Max. 5MB | JPG, PNG</p>
                </div>
            </div>
            {error && <p className="form-error text-center">{error}</p>}
             <div className="flex justify-end gap-4 pt-4">
                 <button type="button" className="form-btn-secondary" disabled={isLoading} onClick={onCancel}>Cancel</button>
                 <button type="submit" className="form-btn-primary" disabled={isLoading}>{isLoading ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create Event' : 'Update')}</button>
             </div>
        </form>
    );
};
export default EventForm;