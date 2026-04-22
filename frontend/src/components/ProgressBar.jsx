import React from 'react';

/** ProgressBar — visual course completion indicator */
export default function ProgressBar({ value = 0, showLabel = true, size = 'md' }) {
  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';
  const pct    = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400">Progress</span>
          <span className="text-xs font-semibold text-primary-400">{pct}%</span>
        </div>
      )}
      <div className={`${height} rounded-full bg-surface-800 overflow-hidden`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
