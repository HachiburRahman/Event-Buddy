// frontend/src/components/shared/EventDetailSkeleton.tsx
import React from 'react';

const EventDetailSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Back to Event Link Skeleton */}
      <div className="h-6 w-32 bg-gray-200 rounded-md mb-8"></div>
      
      {/* Image Skeleton */}
      <div className="relative h-64 md:h-96 w-full bg-gray-200 rounded-lg"></div>

      {/* Title Skeleton */}
      <div className="h-8 w-1/2 bg-gray-300 rounded-md mt-8"></div>
      
      {/* Info Boxes Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8 p-6 bg-white rounded-lg shadow-sm border border-light-gray">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-100 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 w-12 bg-gray-300 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
         <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-100 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 w-12 bg-gray-300 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
         <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-indigo-100 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
            <div className="h-4 w-28 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
      
      {/* About Section Skeleton */}
       <div className="mt-12 space-y-4">
            <div className="h-6 w-48 bg-gray-300 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            </div>
             <div className="space-y-2 pt-4">
              <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
            </div>
        </div>
    </div>
  );
};
export default EventDetailSkeleton;
