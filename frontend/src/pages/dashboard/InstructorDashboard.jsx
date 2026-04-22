import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import courseService from '../../services/courseService';
import Sidebar from '../../components/Sidebar';
import StatsCard from '../../components/StatsCard';
import Badge from '../../components/Badge';
import {
  FiBook, FiUsers, FiDollarSign, FiStar, FiPlus, FiEdit,
  FiGrid, FiUser, FiBarChart2, FiEye, FiToggleLeft, FiToggleRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const LINKS = [
  { to: '/instructor/dashboard',        label: 'Dashboard',   icon: <FiGrid    className="w-4 h-4" /> },
  { to: '/instructor/courses/create',   label: 'New Course',  icon: <FiPlus    className="w-4 h-4" /> },
  { to: '/admin/analytics',             label: 'Analytics',   icon: <FiBarChart2 className="w-4 h-4" /> },
  { to: '/profile',                     label: 'Profile',     icon: <FiUser    className="w-4 h-4" /> },
];

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userService.getInstructorAnalytics(),
      courseService.getInstructorCourses(user?._id),
    ]).then(([analyticsData, coursesData]) => {
      setStats(analyticsData.stats);
      setCourses(coursesData.courses || []);
    }).finally(() => setLoading(false));
  }, [user?._id]);

  const togglePublish = async (id, current) => {
    try {
      await courseService.publishCourse(id);
      setCourses((cs) => cs.map((c) => c._id === id ? { ...c, isPublished: !current } : c));
      toast.success(`Course ${!current ? 'published' : 'unpublished'}`);
    } catch { toast.error('Failed to update course status'); }
  };

  return (
    <div className="container-lms pt-24 pb-16">
      <div className="flex gap-8 flex-col lg:flex-row">
        <Sidebar links={LINKS} title="Instructor Menu" />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-extrabold text-white">
                Instructor <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-slate-400 mt-1">Manage your courses and track revenue</p>
            </div>
            <Link to="/instructor/courses/create" className="btn-primary">
              <FiPlus className="w-4 h-4" /> New Course
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
            <StatsCard icon={<FiBook className="w-5 h-5"/>}      label="Courses"   value={stats?.totalCourses  || 0} color="primary" />
            <StatsCard icon={<FiUsers className="w-5 h-5"/>}     label="Students"  value={stats?.totalStudents || 0} color="sky"     />
            <StatsCard icon={<FiDollarSign className="w-5 h-5"/>}label="Revenue"   value={`$${(stats?.totalRevenue || 0).toFixed(2)}`} color="emerald" />
            <StatsCard icon={<FiStar className="w-5 h-5"/>}      label="Reviews"   value={stats?.totalReviews  || 0} color="amber"   />
          </div>

          {/* Courses table */}
          <div className="glass overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">My Courses</h2>
              <span className="text-slate-400 text-sm">{courses.length} total</span>
            </div>

            {loading ? (
              <div className="p-8 space-y-3">
                {Array.from({length:3}).map((_,i) => <div key={i} className="h-14 bg-surface-800 rounded-xl animate-pulse" />)}
              </div>
            ) : courses.length === 0 ? (
              <div className="p-12 text-center">
                <FiBook className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No courses yet. Create your first one!</p>
                <Link to="/instructor/courses/create" className="btn-primary">Create Course</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-lms">
                  <thead><tr>
                    <th>Course</th><th>Status</th><th>Students</th><th>Rating</th><th>Price</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-8 rounded-lg bg-surface-700 overflow-hidden shrink-0">
                              {course.thumbnail?.url && <img src={course.thumbnail.url} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <span className="text-white font-medium text-sm line-clamp-1 max-w-[180px]">{course.title}</span>
                          </div>
                        </td>
                        <td>
                          <Badge variant={course.isPublished ? 'success' : 'neutral'}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </td>
                        <td className="text-slate-300">{course.enrollmentCount || 0}</td>
                        <td className="text-amber-400 flex items-center gap-1">
                          <FiStar className="w-3.5 h-3.5 fill-current" /> {course.averageRating?.toFixed(1) || '0.0'}
                        </td>
                        <td className="text-slate-300">{course.price === 0 ? 'Free' : `$${course.price}`}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Link to={`/courses/${course._id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="View"><FiEye className="w-4 h-4" /></Link>
                            <Link to={`/instructor/courses/${course._id}/edit`} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Edit"><FiEdit className="w-4 h-4" /></Link>
                            <button onClick={() => togglePublish(course._id, course.isPublished)}
                              className={`p-1.5 rounded-lg transition-colors ${course.isPublished ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                              title={course.isPublished ? 'Unpublish' : 'Publish'}>
                              {course.isPublished ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
