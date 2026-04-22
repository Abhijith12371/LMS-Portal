import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { FiMail, FiArrowLeft, FiBook, FiSend } from 'react-icons/fi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address.');
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-extrabold text-white">Reset your password</h1>
          <p className="text-slate-400 mt-2">We'll send a reset link to your email</p>
        </div>

        <div className="glass p-8 shadow-card-dark">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <FiSend className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-slate-400 text-sm">
                If an account exists for <strong className="text-white">{email}</strong>,
                you'll receive a reset link shortly.
              </p>
              <Link to="/login" className="btn-primary mt-6 inline-flex">Back to Sign In</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="forgot-email" className="label">Email address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input id="forgot-email" type="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" className="input pl-10" />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3.5" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <Link to="/login" className="flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm mt-6 transition-colors">
          <FiArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    </div>
  );
}
