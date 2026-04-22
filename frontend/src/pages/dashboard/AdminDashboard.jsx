import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import Sidebar from '../../components/Sidebar';
import StatsCard from '../../components/StatsCard';
import {
  FiUsers, FiBook, FiDollarSign, FiGrid, FiShield,
  FiTag, FiBarChart2, FiActivity,
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const LINKS = [
  { to: '/admin/dashboard',  label: 'Dashboard',  icon: <FiGrid    className="w-4 h-4" /> },
  { to: '/admin/users',      label: 'Users',      icon: <FiUsers   className="w-4 h-4" /> },
  { to: '/admin/coupons',    label: 'Coupons',    icon: <FiTag     className="w-4 h-4" /> },
  { to: '/admin/analytics',  label: 'Analytics',  icon: <FiBarChart2 className="w-4 h-4" /> },
];

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b'];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getAdminAnalytics()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const revenueChart = (data?.charts?.revenueByMonth || []).map((r) => ({
    name: MONTHS[(r._id.month || 1) - 1],
    Revenue: Number(r.revenue?.toFixed(2) || 0),
    Orders: r.count,
  }));

  const roleChart = (data?.charts?.usersByRole || []).map((r) => ({
    name: r._id,
    value: r.count,
  }));

  return (
    <div className="container-lms pt-24 pb-16">
      <div className="flex gap-8 flex-col lg:flex-row">
        <Sidebar links={LINKS} title="Admin Menu" />

        <div className="flex-1 min-w-0 space-y-8">
          {/* Header */}
          <div className="animate-fade-in">
            <h1 className="text-3xl font-extrabold text-white">
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-slate-400 mt-1">Platform overview and key metrics</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
            <StatsCard icon={<FiUsers className="w-5 h-5"/>}      label="Total Users"      value={data?.stats?.totalUsers       || 0} color="primary" />
            <StatsCard icon={<FiBook className="w-5 h-5"/>}       label="Published Courses" value={data?.stats?.totalCourses     || 0} color="sky"     />
            <StatsCard icon={<FiActivity className="w-5 h-5"/>}   label="Enrollments"      value={data?.stats?.totalEnrollments || 0} color="amber"   />
            <StatsCard icon={<FiDollarSign className="w-5 h-5"/>} label="Total Revenue"     value={`$${(data?.stats?.totalRevenue || 0).toFixed(2)}`} color="emerald" />
          </div>

          {/* Revenue Chart */}
          <div className="glass p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-6">Revenue (Last 6 Months)</h2>
            {loading ? (
              <div className="h-60 bg-surface-800 animate-pulse rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueChart}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9' }}
                    formatter={(v) => [`$${v}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="Revenue" stroke="#6366f1" fill="url(#revGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Courses */}
            <div className="glass p-6 animate-fade-in">
              <h2 className="text-lg font-bold text-white mb-4">Top Courses</h2>
              {(data?.topCourses || []).map((c, i) => (
                <div key={c._id} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                  <span className="text-slate-600 text-sm font-mono w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium line-clamp-1">{c.title}</p>
                    <p className="text-slate-500 text-xs">{c.enrollmentCount} students · ⭐ {c.averageRating?.toFixed(1)}</p>
                  </div>
                  <span className="text-primary-400 font-semibold text-sm">${c.price}</span>
                </div>
              ))}
              {!data?.topCourses?.length && <p className="text-slate-500 text-sm">No data yet</p>}
            </div>

            {/* User breakdown */}
            <div className="glass p-6 animate-fade-in">
              <h2 className="text-lg font-bold text-white mb-4">User Breakdown</h2>
              {roleChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={roleChart} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      dataKey="value" nameKey="name" paddingAngle={4}>
                      {roleChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend formatter={(v) => <span className="text-slate-300 text-sm capitalize">{v}</span>} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No user data yet</div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 stagger">
            {[
              { to: '/admin/users',     label: 'Manage Users',   icon: <FiUsers className="w-6 h-6" />,   color: 'primary' },
              { to: '/admin/coupons',   label: 'Manage Coupons', icon: <FiTag   className="w-6 h-6" />,   color: 'amber'   },
              { to: '/courses',         label: 'All Courses',    icon: <FiBook  className="w-6 h-6" />,   color: 'sky'     },
            ].map(({ to, label, icon, color }) => (
              <Link key={to} to={to} className={`glass p-5 flex items-center gap-4 hover:border-primary-500/30 hover:-translate-y-1 transition-all duration-300 animate-slide-up`}>
                <div className={`text-${color}-400 bg-${color}-500/10 p-3 rounded-xl`}>{icon}</div>
                <span className="text-white font-semibold text-sm">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
