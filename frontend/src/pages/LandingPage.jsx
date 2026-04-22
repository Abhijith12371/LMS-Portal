import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchFeaturedCourses, fetchCategories } from '../store/slices/courseSlice';
import { useSelector } from 'react-redux';
import CourseCard from '../components/CourseCard';
import CourseCardSkeleton from '../components/CourseCardSkeleton';
import {
  FiArrowRight, FiPlay, FiAward, FiUsers, FiBook,
  FiCheckCircle, FiZap, FiGlobe,
} from 'react-icons/fi';

const STATS = [
  { icon: <FiBook  />,  value: '1,200+', label: 'Courses'   },
  { icon: <FiUsers />,  value: '50,000+', label: 'Students'  },
  { icon: <FiAward />,  value: '250+',    label: 'Instructors'},
  { icon: <FiGlobe />,  value: '80+',     label: 'Countries' },
];

const FEATURES = [
  { icon: <FiPlay  className="w-6 h-6"/>, title: 'HD Video Content',    desc: 'Crystal-clear videos hosted on Cloudinary with adaptive streaming.' },
  { icon: <FiCheckCircle className="w-6 h-6"/>, title: 'Progress Tracking', desc: 'Know exactly where you are and pick up right where you left off.' },
  { icon: <FiAward className="w-6 h-6"/>, title: 'Certificates',         desc: 'Earn shareable certificates upon completing any course.' },
  { icon: <FiZap   className="w-6 h-6"/>, title: 'Instant Access',       desc: 'Enroll and start learning immediately — no waiting.' },
];

export default function LandingPage() {
  const dispatch = useDispatch();
  const { featured, categories, isLoading } = useSelector((s) => s.courses);

  useEffect(() => {
    dispatch(fetchFeaturedCourses());
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="hero-gradient">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container-lms pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-500/30 bg-primary-600/10 text-primary-400 text-sm font-medium mb-8 animate-fade-in">
          <FiZap className="w-3.5 h-3.5 fill-current" />
          New courses added every week
        </div>

        <h1 className="section-heading gradient-text mb-6 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Learn Without Limits.<br />Grow Without Boundaries.
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Master in-demand skills with expert-led courses. Join 50,000+ learners and advance your career today.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Link to="/courses" className="btn-primary text-base px-8 py-3.5 shadow-glow-lg">
            Explore Courses <FiArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/register" className="btn-secondary text-base px-8 py-3.5">
            Teach on LMS Portal
          </Link>
        </div>

        {/* Hero visual */}
        <div className="mt-16 relative max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="glass rounded-3xl p-2 shadow-glow-lg">
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary-900/80 to-surface-800 flex items-center justify-center overflow-hidden">
              <div className="grid grid-cols-3 gap-4 p-8 w-full opacity-60">
                {Array.from({length: 6}).map((_, i) => (
                  <div key={i} className={`rounded-xl bg-primary-${i%2===0?'700':'800'}/30 h-20 animate-pulse-slow`} style={{animationDelay: `${i*0.2}s`}} />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary-600/90 flex items-center justify-center shadow-glow cursor-pointer hover:scale-110 transition-transform">
                  <FiPlay className="w-7 h-7 text-white ml-1 fill-white" />
                </div>
              </div>
            </div>
          </div>
          {/* Glow ring */}
          <div className="absolute -inset-4 rounded-3xl bg-primary-600/5 blur-2xl -z-10" />
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="container-lms py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 stagger">
          {STATS.map(({ icon, value, label }) => (
            <div key={label} className="glass text-center p-6 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 animate-slide-up">
              <div className="text-primary-400 flex justify-center mb-3 text-2xl">{icon}</div>
              <p className="text-3xl font-extrabold text-white">{value}</p>
              <p className="text-slate-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Courses ───────────────────────────────────────────────── */}
      <section className="container-lms py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-primary-400 text-sm font-semibold uppercase tracking-wider mb-2">Top picks</p>
            <h2 className="section-heading text-white">Featured Courses</h2>
          </div>
          <Link to="/courses" className="btn-outline text-sm hidden sm:flex">
            View All <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
            : featured.slice(0, 4).map((course) => <CourseCard key={course._id} course={course} />)
          }
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="container-lms py-16">
          <div className="text-center mb-10">
            <p className="text-primary-400 text-sm font-semibold uppercase tracking-wider mb-2">Explore by topic</p>
            <h2 className="section-heading text-white">Browse Categories</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 stagger">
            {categories.map(({ _id, count }) => (
              <Link
                key={_id}
                to={`/courses?category=${encodeURIComponent(_id)}`}
                className="glass px-5 py-2.5 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:border-primary-500/40 hover:shadow-glow transition-all duration-200 animate-fade-in"
              >
                {_id} <span className="text-primary-400 ml-1">({count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="container-lms py-20">
        <div className="text-center mb-12">
          <p className="text-primary-400 text-sm font-semibold uppercase tracking-wider mb-2">Why choose us</p>
          <h2 className="section-heading text-white">Everything You Need to Succeed</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="glass p-7 hover:border-primary-500/40 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 group animate-fade-in">
              <div className="text-primary-400 mb-4 group-hover:scale-110 transition-transform">{icon}</div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="container-lms py-16 mb-8">
        <div className="relative glass rounded-3xl px-8 py-16 text-center overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-0 left-1/4 -translate-x-1/2 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl -z-0" />
          <div className="absolute bottom-0 right-1/4 translate-x-1/2  w-64 h-64 bg-purple-600/15  rounded-full blur-3xl -z-0" />

          <div className="relative z-10">
            <h2 className="section-heading gradient-text mb-4">Start Learning Today</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of learners already building their future. New courses added weekly.
            </p>
            <Link to="/register" className="btn-primary text-base px-10 py-4 shadow-glow-lg">
              Get Started Free <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
