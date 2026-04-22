import React from 'react';
import { Link } from 'react-router-dom';
import { FiXCircle, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

export default function PaymentCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient px-4">
      <div className="max-w-md w-full text-center glass p-12 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <FiXCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-3">Payment Cancelled</h1>
        <p className="text-slate-400 mb-8">
          Your payment was cancelled and you haven't been charged. Go back and try again when you're ready.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={() => window.history.back()} className="btn-primary py-3.5 text-base">
            <FiRefreshCw /> Try Again
          </button>
          <Link to="/courses" className="btn-secondary py-3">
            <FiArrowLeft /> Back to Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
