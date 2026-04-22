import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Sidebar — role-aware navigation for dashboard layouts.
 * Props: links = [{ to, label, icon: ReactNode }]
 */
export default function Sidebar({ links = [], title = 'Menu' }) {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 shrink-0 glass rounded-2xl p-4 h-fit sticky top-24">
      <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold px-3 mb-3">{title}</p>
      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon }) => {
          const active = pathname === to || pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className={active ? 'text-primary-400' : 'text-slate-400'}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
