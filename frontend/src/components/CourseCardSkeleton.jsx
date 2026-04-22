import React from 'react';

/** Animated skeleton shimmer for course cards while loading */
export default function CourseCardSkeleton() {
  return (
    <div className="glass flex flex-col overflow-hidden animate-pulse">
      {/* Thumbnail */}
      <div className="aspect-video bg-surface-800 rounded-t-2xl" />
      {/* Content */}
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 bg-surface-800 rounded w-3/4" />
        <div className="h-3 bg-surface-800 rounded w-1/2" />
        <div className="h-3 bg-surface-800 rounded w-2/3" />
        <div className="mt-2 h-5 bg-surface-800 rounded w-1/4" />
      </div>
    </div>
  );
}
