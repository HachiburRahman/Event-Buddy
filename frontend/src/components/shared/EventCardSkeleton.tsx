// frontend/src/components/shared/EventCardSkeleton.tsx

import React from 'react';

const EventCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      {/* Image Skeleton */}
      <div className="relative h-48 w-full bg-gray-200 animate-pulse"></div>

      {/* Content Skeleton */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start gap-4">
          {/* Date Skeleton */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            <div className="h-3 w-8 bg-gray-300 rounded-sm animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          
          {/* Title and Info Skeleton */}
          <div className="flex-grow space-y-2">
            <div className="h-5 w-3/4 bg-gray-300 rounded-sm animate-pulse"></div>
            <div className="h-3 w-full bg-gray-200 rounded-sm animate-pulse"></div>
            <div className="h-3 w-5/6 bg-gray-200 rounded-sm animate-pulse"></div>
          </div>
        </div>
        
        {/* Detailed Info Skeleton */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-3 w-1/3 bg-gray-200 rounded-sm animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-3 w-1/4 bg-gray-200 rounded-sm animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-3 w-1/2 bg-gray-200 rounded-sm animate-pulse"></div>
          </div>
        </div>
        
        {/* Tags Skeleton */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        {/* Spacer */}
        <div className="flex-grow"></div>
        
        {/* Footer Skeleton */}
        <div className="mt-5 pt-4 border-t border-light-gray flex justify-between items-center">
          <div className="h-4 w-1/4 bg-gray-200 rounded-sm animate-pulse"></div>
          <div className="h-4 w-1/3 bg-gray-200 rounded-sm animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;