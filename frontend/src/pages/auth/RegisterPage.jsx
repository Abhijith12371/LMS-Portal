import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBook, FiChevronDown } from 'react-icons/fi';

export default function RegisterPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { isAuthenticated, isLoading, error } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPw, setShowPw] = useState(false);
  const [confirmPw, setConfirmPw] = useState('');

  useEffect(() => { if (isAuthenticated) navigate('/dashboard', { replace: true }); }, [isAuthenticated]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    if (form.password !== confirmPw) return toast.error('Passwords do not match.');

    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Welcome to LMS Portal 🎓');
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient px-4 py-20">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="p-2 rounded-xl bg-primary-600 group-hover:bg-primary-500 transition-colors">
              <FiBook className="text-white w-6 h-6" />
            </div>
            <span className="font-extrabold text-white text-2xl">LMS<span className="text-primary-400">Portal</span></span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Create your account</h1>
          <p className="text-slate-400 mt-2">Join 50,000+ learners worldwide</p>
        </div>

        <div className="glass p-8 shadow-card-dark">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role selector */}
            <div>
              <label className="label">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'student',    label: '🎓 Learn',  sub: 'Browse & enroll in courses' },
                  { value: 'instructor', label: '🏫 Teach',  sub: 'Create & sell your courses' },
                ].map(({ value, label, sub }) => (
                  <button
                    key={value} type="button"
                    onClick={() => setForm((f) => ({ ...f, role: value }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.role === value
                        ? 'border-primary-500 bg-primary-600/20 text-white'
                        : 'border-white/10 bg-surface-800 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs mt-0.5 opacity-70">{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Full name */}
            <div>
              <label htmlFor="name" className="label">Full name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input id="name" name="name" type="text" autoComplete="name"
                  value={form.name} onChange={handleChange}
                  placeholder="John Doe" className="input pl-10" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="label">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input id="reg-email" name="email" type="email" autoComplete="email"
                  value={form.email} onChange={handleChange}
                  placeholder="you@example.com" className="input pl-10" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input id="reg-password" name="password" type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password} onChange={handleChange}
                  placeholder="Min. 6 characters" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm-pw" className="label">Confirm password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input id="confirm-pw" type={showPw ? 'text' : 'password'}
                  value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Re-enter password" className="input pl-10" />
              </div>
            </div>

            <p className="text-xs text-slate-500">
              By signing up you agree to our{' '}
              <a href="#" className="text-primary-400 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-primary-400 hover:underline">Privacy Policy</a>.
            </p>

            <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
