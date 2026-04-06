import React from "react";

function MoodSelectorSkeleton({ count = 6 }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      aria-busy="true"
      aria-label="Loading recommendations"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse"
        >
          <div className="h-24 rounded-lg bg-gray-200" />
          <div className="mt-3 h-5 w-3/4 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
          <div className="mt-4 h-10 rounded bg-gray-200" />
          <div className="mt-4 h-9 w-full rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export default MoodSelectorSkeleton;

