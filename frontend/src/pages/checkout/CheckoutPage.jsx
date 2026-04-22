import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart, applyCoupon, removeCoupon } from '../../store/slices/cartSlice';
import { fetchCourseById } from '../../store/slices/courseSlice';
import paymentService from '../../services/paymentService';
import couponService  from '../../services/couponService';
import useAuth from '../../hooks/useAuth';
import StarRating from '../../components/StarRating';
import toast from 'react-hot-toast';
import {
  FiTag, FiX, FiLock, FiCheckCircle, FiShoppingCart,
  FiAlertCircle, FiClock,
} from 'react-icons/fi';

export default function CheckoutPage() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const dispatch      = useDispatch();
  const { user }      = useAuth();
  const { item: cartItem, coupon, finalPrice, discountAmount } = useSelector((s) => s.cart);
  const { current: course, isLoading } = useSelector((s) => s.courses);

  const [couponInput, setCouponInput] = useState('');
  const [validating,  setValidating]  = useState(false);
  const [processing,  setProcessing]  = useState(false);

  useEffect(() => {
    dispatch(fetchCourseById(id));
  }, [id, dispatch]);

  const displayCourse = course;
  const price         = displayCourse?.price || 0;
  const total         = coupon ? finalPrice : price;

  const handleCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidating(true);
    try {
      const result = await couponService.validate({ code: couponInput, courseId: id, price });
      dispatch(applyCoupon({ coupon: result.coupon, discountAmount: result.coupon.discountAmount, finalPrice: result.coupon.finalPrice }));
      toast.success(`Coupon applied! You save $${result.coupon.discountAmount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    } finally { setValidating(false); }
  };

  const handleCheckout = async () => {
    if (!displayCourse) return;
    setProcessing(true);
    try {
      const result = await paymentService.createCheckout({
        courseId:   id,
        couponCode: coupon?.code || '',
      });

      if (result.free) {
        dispatch(clearCart());
        toast.success('Enrolled successfully!');
        navigate(`/courses/${id}/learn`);
      } else {
        // Redirect to Stripe
        window.location.href = result.url;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally { setProcessing(false); }
  };

  if (isLoading || !displayCourse) return (
    <div className="container-lms pt-24 pb-16">
      <div className="max-w-2xl mx-auto space-y-4">
        {Array.from({length:5}).map((_,i) => <div key={i} className="h-12 bg-surface-800 rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="container-lms pt-24 pb-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-8 animate-fade-in">
          Complete Your <span className="gradient-text">Enrollment</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — Course summary + coupon */}
          <div className="lg:col-span-3 space-y-5 animate-slide-up">
            {/* Course card */}
            <div className="glass p-5">
              <div className="flex gap-4">
                <div className="w-24 h-16 rounded-xl overflow-hidden bg-surface-800 shrink-0">
                  {displayCourse.thumbnail?.url
                    ? <img src={displayCourse.thumbnail.url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-primary-900/50" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-base line-clamp-2">{displayCourse.title}</h2>
                  <p className="text-slate-500 text-xs mt-1">{displayCourse.instructor?.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={displayCourse.averageRating || 0} size="sm" />
                    <span className="text-slate-500 text-xs">({displayCourse.reviewCount})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="glass p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FiTag className="text-primary-400" /> Have a Coupon?
              </h3>
              <div className="flex gap-2">
                <input
                  type="text" value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleCoupon()}
                  placeholder="Enter coupon code"
                  disabled={!!coupon}
                  className="input flex-1 uppercase tracking-widest font-mono"
                />
                {coupon ? (
                  <button onClick={() => { dispatch(removeCoupon()); setCouponInput(''); }}
                    className="btn-secondary px-4">
                    <FiX className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handleCoupon} disabled={validating || !couponInput}
                    className="btn-primary px-6 disabled:opacity-50">
                    {validating ? '…' : 'Apply'}
                  </button>
                )}
              </div>
              {coupon && (
                <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm">
                  <FiCheckCircle className="w-4 h-4" />
                  Coupon <strong>{coupon.code}</strong> applied — You save ${coupon.discountAmount}
                </div>
              )}
            </div>

            {/* Security note */}
            <div className="flex items-start gap-3 text-slate-500 text-sm px-1">
              <FiLock className="w-4 h-4 mt-0.5 shrink-0 text-primary-400" />
              <p>Your payment is secured by Stripe. We never store your card details.</p>
            </div>
          </div>

          {/* Right — Order summary */}
          <div className="lg:col-span-2 animate-slide-up" style={{animationDelay:'0.1s'}}>
            <div className="glass p-6 sticky top-24">
              <h3 className="text-white font-bold text-lg mb-5">Order Summary</h3>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-slate-300">
                  <span>Original Price</span>
                  <span>${price.toFixed(2)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount</span>
                    <span>-${(coupon.discountAmount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="divider !my-3" />
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className={total === 0 ? 'text-emerald-400' : ''}>
                    {total === 0 ? 'FREE' : `$${total.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processing}
                className="btn-primary w-full py-4 text-base mb-4"
              >
                {processing ? (
                  <span className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing…
                  </span>
                ) : (
                  <><FiShoppingCart /> {total === 0 ? 'Enroll Free' : `Pay $${total.toFixed(2)}`}</>
                )}
              </button>

              <div className="space-y-2 text-xs text-slate-500">
                <p className="flex items-center gap-1.5"><FiCheckCircle className="text-emerald-400" /> 30-day money-back guarantee</p>
                <p className="flex items-center gap-1.5"><FiClock className="text-primary-400" /> Lifetime access</p>
                <p className="flex items-center gap-1.5"><FiLock className="text-primary-400" /> Secure payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
