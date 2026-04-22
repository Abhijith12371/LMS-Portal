import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import useAuth from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import {
  FiBook, FiMenu, FiX, FiLogOut, FiUser, FiGrid,
  FiPlus, FiShield, FiBarChart2,
} from 'react-icons/fi';

export default function Navbar() {
  const { isAuthenticated, user, isAdmin, isInstructor } = useAuth();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isActive = (path) =>
    location.pathname === path ? 'nav-link nav-link-active' : 'nav-link';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-surface-900/90 backdrop-blur-xl border-b border-white/10 shadow-card-dark' : 'bg-transparent'
    }`}>
      <div className="container-lms">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-primary-600 group-hover:bg-primary-500 transition-colors">
              <FiBook className="text-white w-5 h-5" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">
              LMS<span className="text-primary-400">Portal</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/"        className={isActive('/')}>Home</Link>
            <Link to="/courses" className={isActive('/courses')}>Courses</Link>

            {isAuthenticated && (
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
            )}
            {isInstructor && (
              <Link to="/instructor/courses/create" className="nav-link flex items-center gap-1">
                <FiPlus className="w-3.5 h-3.5" /> New Course
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin/dashboard" className="nav-link flex items-center gap-1">
                <FiShield className="w-3.5 h-3.5" /> Admin
              </Link>
            )}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                {/* Avatar dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors">
                    {user?.avatar?.url
                      ? <img src={user.avatar.url} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500" />
                      : <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
                          {user?.name?.[0]?.toUpperCase()}
                        </div>
                    }
                    <span className="text-sm font-medium text-white">{user?.name?.split(' ')[0]}</span>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-card-dark">
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
                      <FiUser className="w-4 h-4" /> My Profile
                    </Link>
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
                      <FiGrid className="w-4 h-4" /> Dashboard
                    </Link>
                    {isAdmin && (
                      <Link to="/admin/analytics" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
                        <FiBarChart2 className="w-4 h-4" /> Analytics
                      </Link>
                    )}
                    <div className="divider !my-0" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                      <FiLogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn-secondary text-sm py-2 px-4">Log in</Link>
                <Link to="/register" className="btn-primary  text-sm py-2 px-4">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 glass mt-2 rounded-2xl animate-slide-up">
            <nav className="flex flex-col p-3 gap-1">
              <Link to="/"        className="nav-link">Home</Link>
              <Link to="/courses" className="nav-link">Courses</Link>
              {isAuthenticated && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
              {isInstructor     && <Link to="/instructor/courses/create" className="nav-link">New Course</Link>}
              {isAdmin          && <Link to="/admin/dashboard" className="nav-link">Admin Panel</Link>}
              <div className="divider" />
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="nav-link">My Profile</Link>
                  <button onClick={handleLogout} className="nav-link text-red-400 text-left">Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login"    className="btn-secondary w-full justify-center mt-1">Log in</Link>
                  <Link to="/register" className="btn-primary  w-full justify-center mt-1">Get Started</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
