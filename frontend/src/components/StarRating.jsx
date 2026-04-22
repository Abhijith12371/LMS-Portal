import React from 'react';
import { FiStar } from 'react-icons/fi';

/** StarRating — renders filled/empty stars. interactive=true allows clicking to set rating. */
export default function StarRating({ rating = 0, max = 5, interactive = false, onChange, size = 'md' }) {
  const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' };
  const cls     = sizeMap[size] || sizeMap.md;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(rating);
        return (
          <button
            key={i}
            type="button"
            onClick={interactive ? () => onChange?.(i + 1) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            aria-label={`${i + 1} star`}
          >
            <FiStar
              className={`${cls} transition-colors ${
                filled ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
