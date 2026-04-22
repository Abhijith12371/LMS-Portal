import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import Sidebar from '../../components/Sidebar';
import ProgressBar from '../../components/ProgressBar';
import { FiBook, FiClock, FiAward, FiPlay, FiGrid, FiUser, FiStar } from 'react-icons/fi';

const LINKS = [
  { to: '/student/dashboard', label: 'My Courses',   icon: <FiBook    className="w-4 h-4" /> },
  { to: '/courses',           label: 'Browse',       icon: <FiGrid    className="w-4 h-4" /> },
  { to: '/profile',           label: 'Profile',      icon: <FiUser    className="w-4 h-4" /> },
];

export default function StudentDashboard() {
  const { user }    = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    userService.getMyEnrollments()
      .then((d) => setEnrollments(d.enrollments || []))
      .finally(() => setLoading(false));
  }, []);

  const completed = enrollments.filter((e) => e.isCompleted).length;
  const inProgress = enrollments.filter((e) => !e.isCompleted && e.progressPercent > 0).length;

  return (
    <div className="container-lms pt-24 pb-16">
      <div className="flex gap-8 flex-col lg:flex-row">
        {/* Sidebar */}
        <Sidebar links={LINKS} title="Student Menu" />

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Greeting */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-extrabold text-white">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-400 mt-1">Continue where you left off.</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 stagger">
            {[
              { icon: <FiBook className="w-5 h-5"/>,  label:'Enrolled',    value: enrollments.length,   color:'text-primary-400' },
              { icon: <FiPlay className="w-5 h-5"/>,  label:'In Progress', value: inProgress,           color:'text-amber-400'   },
              { icon: <FiAward className="w-5 h-5"/>, label:'Completed',   value: completed,            color:'text-emerald-400' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="glass p-5 flex items-center gap-4 animate-slide-up">
                <div className={`${color} bg-current/10 p-3 rounded-xl`}>{icon}</div>
                <div>
                  <p className="text-2xl font-extrabold text-white">{value}</p>
                  <p className="text-slate-400 text-sm">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Enrolled Courses */}
          <h2 className="text-xl font-bold text-white mb-5">My Courses</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({length:4}).map((_,i) => (
                <div key={i} className="glass h-32 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <div className="glass p-12 text-center">
              <FiBook className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No courses yet</h3>
              <p className="text-slate-400 mb-6">Start your learning journey today</p>
              <Link to="/courses" className="btn-primary">Browse Courses</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
              {enrollments.map(({ _id, course, progressPercent, isCompleted, lastWatched }) => (
                <div key={_id} className="glass p-5 flex gap-4 hover:border-primary-500/30 transition-all duration-300 animate-slide-up">
                  {/* Thumbnail */}
                  <div className="w-20 h-16 rounded-xl bg-surface-800 overflow-hidden shrink-0">
                    {course?.thumbnail?.url
                      ? <img src={course.thumbnail.url} alt={course.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-primary-900/50 flex items-center justify-center">
                          <FiBook className="text-primary-500 w-6 h-6" />
                        </div>
                    }
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm line-clamp-1 mb-1">{course?.title}</h3>
                    <p className="text-slate-500 text-xs mb-3">{course?.instructor?.name}</p>
                    <ProgressBar value={progressPercent} size="sm" />
                    <div className="flex items-center justify-between mt-2">
                      {isCompleted
                        ? <span className="text-xs text-emerald-400 flex items-center gap-1"><FiAward className="w-3 h-3" /> Completed</span>
                        : <span className="text-xs text-slate-500">{progressPercent}% done</span>
                      }
                      <Link to={`/courses/${course?._id}/learn`} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 font-medium">
                        <FiPlay className="w-3 h-3" /> {progressPercent > 0 ? 'Continue' : 'Start'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
