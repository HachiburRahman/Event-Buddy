// frontend/src/components/shared/EventTableSkeleton.tsx
import React from 'react';

const EventTableSkeleton = () => {
    return (
        <div className="animate-pulse">
            {/* Table Header Skeleton */}
            <div className="flex bg-gray-50 p-4 rounded-t-lg">
                <div className="w-1/3 h-4 bg-gray-300 rounded"></div>
                <div className="w-1/4 h-4 bg-gray-300 rounded ml-4"></div>
                <div className="w-1/4 h-4 bg-gray-300 rounded ml-4"></div>
                <div className="flex-grow h-4 bg-gray-300 rounded ml-4"></div>
                <div className="w-1/6 h-4 bg-gray-300 rounded ml-4"></div>
            </div>
            {/* Table Body Skeleton */}
            <div className="divide-y divide-gray-200">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center p-4 bg-white">
                        <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                        <div className="w-1/4 h-4 bg-gray-200 rounded ml-4"></div>
                        <div className="w-1/4 h-4 bg-gray-200 rounded ml-4"></div>
                        <div className="flex-grow h-4 bg-gray-200 rounded ml-4"></div>
                        <div className="w-1/6 flex items-center gap-4 ml-4">
                            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white h-10 rounded-b-lg"></div>
        </div>
    );
};
export default EventTableSkeleton;