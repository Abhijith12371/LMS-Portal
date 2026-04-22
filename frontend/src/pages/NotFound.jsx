import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiSearch, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient px-4">
      <div className="text-center animate-slide-up">
        <p className="text-primary-400 font-mono text-sm mb-4 uppercase tracking-widest">404 — Page Not Found</p>
        <h1 className="text-8xl font-extrabold gradient-text mb-4">404</h1>
        <p className="text-xl text-slate-300 font-semibold mb-3">Oops! This page doesn't exist.</p>
        <p className="text-slate-500 mb-10 max-w-md mx-auto">
          The page you're looking for might have been moved, deleted, or never existed.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button onClick={() => window.history.back()} className="btn-secondary">
            <FiArrowLeft /> Go Back
          </button>
          <Link to="/" className="btn-primary">
            <FiHome /> Home
          </Link>
          <Link to="/courses" className="btn-outline">
            <FiSearch /> Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
