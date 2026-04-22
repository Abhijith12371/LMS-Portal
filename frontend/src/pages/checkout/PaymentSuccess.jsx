import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../store/slices/cartSlice';
import { FiCheckCircle, FiArrowRight, FiPlay } from 'react-icons/fi';

export default function PaymentSuccess() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => { dispatch(clearCart()); }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient px-4">
      <div className="max-w-md w-full text-center glass p-12 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-3">Payment Successful!</h1>
        <p className="text-slate-400 mb-2">
          Welcome to the course! You're now enrolled and can start learning immediately.
        </p>
        {sessionId && (
          <p className="text-slate-600 text-xs mb-8">Session: {sessionId.slice(-12)}</p>
        )}
        <div className="flex flex-col gap-3">
          <Link to="/student/dashboard" className="btn-primary py-3.5 text-base">
            <FiPlay /> Go to My Courses
          </Link>
          <Link to="/courses" className="btn-secondary py-3">
            Browse More Courses <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
