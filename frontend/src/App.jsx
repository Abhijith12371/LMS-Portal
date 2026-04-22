import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { logout } from './store/slices/authSlice';
import { fetchMe } from './store/slices/authSlice';
import useAuth from './hooks/useAuth';

// ── Layouts ───────────────────────────────────────────────────────────────────
import Navbar  from './components/Navbar';
import Footer  from './components/Footer';

// ── Pages ─────────────────────────────────────────────────────────────────────
import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/auth/LoginPage';
import RegisterPage       from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import CourseListing      from './pages/courses/CourseListing';
import CourseDetail       from './pages/courses/CourseDetail';
import CoursePlayer       from './pages/courses/CoursePlayer';
import CreateCourse       from './pages/courses/CreateCourse';
import EditCourse         from './pages/courses/EditCourse';
import CheckoutPage       from './pages/checkout/CheckoutPage';
import PaymentSuccess     from './pages/checkout/PaymentSuccess';
import PaymentCancel      from './pages/checkout/PaymentCancel';
import StudentDashboard   from './pages/dashboard/StudentDashboard';
import InstructorDashboard from './pages/dashboard/InstructorDashboard';
import AdminDashboard     from './pages/dashboard/AdminDashboard';
import ProfilePage        from './pages/profile/ProfilePage';
import UserManagement     from './pages/admin/UserManagement';
import CouponManagement   from './pages/admin/CouponManagement';
import Analytics          from './pages/admin/Analytics';
import NotFound           from './pages/NotFound';

// ── Protected Route ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Dashboard Redirect ────────────────────────────────────────────────────────
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'admin')      return <Navigate to="/admin/dashboard"      replace />;
  if (user?.role === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

// ── Auth Expiry Listener ──────────────────────────────────────────────────────
const AuthListener = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  useEffect(() => {
    const handler = () => { dispatch(logout()); navigate('/login', { replace: true }); };
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, [dispatch, navigate]);

  return null;
};

// ── App ───────────────────────────────────────────────────────────────────────
const AppContent = () => {
  const dispatch = useDispatch();
  const { token } = useAuth();

  // Rehydrate user on page refresh if token exists
  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, []);  // eslint-disable-line

  return (
    <div className="min-h-screen flex flex-col bg-surface-900">
      <Navbar />
      <AuthListener />

      <main className="flex-1 page-enter">
        <Routes>
          {/* Public */}
          <Route path="/"              element={<LandingPage />} />
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/register"      element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/courses"       element={<CourseListing />} />
          <Route path="/courses/:id"   element={<CourseDetail />} />

          {/* Payment results */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel"  element={<PaymentCancel />} />

          {/* Dashboard redirect */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardRedirect /></ProtectedRoute>
          } />

          {/* Student */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/courses/:id/learn" element={
            <ProtectedRoute><CoursePlayer /></ProtectedRoute>
          } />

          {/* Instructor */}
          <Route path="/instructor/dashboard" element={
            <ProtectedRoute roles={['instructor', 'admin']}><InstructorDashboard /></ProtectedRoute>
          } />
          <Route path="/instructor/courses/create" element={
            <ProtectedRoute roles={['instructor', 'admin']}><CreateCourse /></ProtectedRoute>
          } />
          <Route path="/instructor/courses/:id/edit" element={
            <ProtectedRoute roles={['instructor', 'admin']}><EditCourse /></ProtectedRoute>
          } />

          {/* Checkout */}
          <Route path="/checkout/:id" element={
            <ProtectedRoute><CheckoutPage /></ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>
          } />
          <Route path="/admin/coupons" element={
            <ProtectedRoute roles={['admin']}><CouponManagement /></ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute roles={['admin']}><Analytics /></ProtectedRoute>
          } />

          {/* Profile */}
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
