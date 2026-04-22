import React from 'react';

/** StatsCard — admin/instructor dashboard metric card */
export default function StatsCard({ icon, label, value, sub, color = 'primary' }) {
  const colors = {
    primary: 'from-primary-600/30 to-primary-800/10 border-primary-500/20 text-primary-400',
    emerald: 'from-emerald-600/30 to-emerald-800/10 border-emerald-500/20 text-emerald-400',
    amber:   'from-amber-600/30   to-amber-800/10   border-amber-500/20   text-amber-400',
    rose:    'from-rose-600/30    to-rose-800/10    border-rose-500/20    text-rose-400',
    sky:     'from-sky-600/30     to-sky-800/10     border-sky-500/20     text-sky-400',
  };

  return (
    <div className={`glass bg-gradient-to-br ${colors[color] || colors.primary} p-6 flex items-start gap-4 hover:shadow-glow transition-all duration-300`}>
      <div className={`p-3 rounded-xl bg-current/10 ${colors[color]?.split(' ')[3]} shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-2xl font-extrabold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
