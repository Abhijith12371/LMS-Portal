import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import StatsCard from '../../components/StatsCard';
import userService from '../../services/userService';
import { FiUsers, FiGrid, FiTag, FiBarChart2, FiDollarSign, FiBook, FiActivity } from 'react-icons/fi';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard',  icon: <FiGrid    className="w-4 h-4" /> },
  { to: '/admin/users',     label: 'Users',      icon: <FiUsers   className="w-4 h-4" /> },
  { to: '/admin/coupons',   label: 'Coupons',    icon: <FiTag     className="w-4 h-4" /> },
  { to: '/admin/analytics', label: 'Analytics',  icon: <FiBarChart2 className="w-4 h-4" /> },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Analytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getAdminAnalytics().then(setData).finally(() => setLoading(false));
  }, []);

  const revenueData = (data?.charts?.revenueByMonth || []).map((r) => ({
    name: MONTHS[(r._id.month || 1) - 1],
    Revenue: +r.revenue?.toFixed(2),
    Orders:  r.count,
  }));

  const studentData = (data?.charts?.studentsByMonth || []).map((r) => ({
    name: MONTHS[(r._id.month || 1) - 1],
    Students: r.count,
  }));

  const TooltipStyle = { contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9' } };

  return (
    <div className="container-lms pt-24 pb-16">
      <div className="flex gap-8 flex-col lg:flex-row">
        <Sidebar links={LINKS} title="Admin Menu" />

        <div className="flex-1 min-w-0 space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-extrabold text-white">Platform <span className="gradient-text">Analytics</span></h1>
            <p className="text-slate-400 mt-1">Comprehensive platform statistics</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
            <StatsCard icon={<FiUsers className="w-5 h-5"/>}      label="Total Users"      value={data?.stats?.totalUsers       || 0} color="primary" />
            <StatsCard icon={<FiBook className="w-5 h-5"/>}       label="Published Courses" value={data?.stats?.totalCourses     || 0} color="sky"     />
            <StatsCard icon={<FiActivity className="w-5 h-5"/>}   label="Enrollments"      value={data?.stats?.totalEnrollments || 0} color="amber"   />
            <StatsCard icon={<FiDollarSign className="w-5 h-5"/>} label="Total Revenue"     value={`$${(data?.stats?.totalRevenue || 0).toFixed(0)}`} color="emerald" />
          </div>

          {/* Revenue chart */}
          <div className="glass p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-6">Revenue & Orders — Last 6 Months</h2>
            {loading ? <div className="h-64 bg-surface-800 rounded-xl animate-pulse" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill:'#94a3b8', fontSize:12 }} />
                  <YAxis stroke="#64748b" tick={{ fill:'#94a3b8', fontSize:12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip {...TooltipStyle} formatter={(v, n) => [n === 'Revenue' ? `$${v}` : v, n]} />
                  <Legend formatter={(v) => <span className="text-slate-400 text-sm">{v}</span>} />
                  <Area type="monotone" dataKey="Revenue" stroke="#6366f1" fill="url(#g1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Orders"  stroke="#22d3ee" fill="none"        strokeWidth={2} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* New students chart */}
          <div className="glass p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-6">New Students — Last 6 Months</h2>
            {loading ? <div className="h-56 bg-surface-800 rounded-xl animate-pulse" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={studentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill:'#94a3b8', fontSize:12 }} />
                  <YAxis stroke="#64748b" tick={{ fill:'#94a3b8', fontSize:12 }} />
                  <Tooltip {...TooltipStyle} />
                  <Bar dataKey="Students" fill="#6366f1" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Courses */}
          <div className="glass p-6 animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-5">Top Performing Courses</h2>
            {(data?.topCourses || []).length === 0
              ? <p className="text-slate-500 text-sm">No data yet</p>
              : (
              <div className="space-y-3">
                {data.topCourses.map((c, i) => (
                  <div key={c._id} className="flex items-center gap-4 p-4 glass rounded-xl">
                    <span className="text-2xl font-extrabold text-slate-700 w-6 text-center">{i+1}</span>
                    {c.thumbnail?.url && <img src={c.thumbnail.url} alt="" className="w-12 h-9 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm line-clamp-1">{c.title}</p>
                      <p className="text-slate-500 text-xs">{c.instructor?.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white font-semibold">{c.enrollmentCount} students</p>
                      <p className="text-amber-400 text-xs">⭐ {c.averageRating?.toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
