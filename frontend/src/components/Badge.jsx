import React from 'react';

const variants = {
  primary:  'bg-primary-500/20 text-primary-400 border-primary-500/30',
  success:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning:  'bg-amber-500/20   text-amber-400   border-amber-500/30',
  danger:   'bg-red-500/20     text-red-400     border-red-500/30',
  info:     'bg-sky-500/20     text-sky-400     border-sky-500/30',
  neutral:  'bg-slate-500/20   text-slate-400   border-slate-500/30',
};

export default function Badge({ children, variant = 'primary', className = '' }) {
  return (
    <span className={`badge border ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </span>
  );
}
