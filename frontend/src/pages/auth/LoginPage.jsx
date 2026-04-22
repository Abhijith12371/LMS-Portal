import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiBook } from 'react-icons/fi';

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { isAuthenticated, isLoading, error } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  // Redirect if already authenticated
  useEffect(() => { if (isAuthenticated) navigate('/dashboard', { replace: true }); }, [isAuthenticated]);

  // Show error toast
  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields.');
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back! 👋');
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient px-4 py-20">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="p-2 rounded-xl bg-primary-600 group-hover:bg-primary-500 transition-colors">
              <FiBook className="text-white w-6 h-6" />
            </div>
            <span className="font-extrabold text-white text-2xl">LMS<span className="text-primary-400">Portal</span></span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-2">Sign in to continue your learning journey</p>
        </div>

        {/* Card */}
        <div className="glass p-8 shadow-card-dark">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="email" name="email" type="email" autoComplete="email"
                  value={form.email} onChange={handleChange}
                  placeholder="you@example.com"
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label !mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="password" name="password" type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-primary w-full py-3.5 text-base mt-2" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="divider flex items-center gap-3 text-slate-600 text-xs">
            <div className="flex-1 h-px bg-white/10" />
            or continue with
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Demo accounts */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {[
              { label: 'Student',    email: 'student@lms.com',    pw: 'password123' },
              { label: 'Instructor', email: 'instructor@lms.com', pw: 'password123' },
              { label: 'Admin',      email: 'admin@lms.com',      pw: 'password123' },
            ].map(({ label, email, pw }) => (
              <button
                key={label}
                type="button"
                onClick={() => setForm({ email, password: pw })}
                className="btn-secondary text-xs py-2 px-2"
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-slate-600 mb-2">Click a demo account to auto-fill credentials</p>
        </div>

        {/* Sign up link */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
