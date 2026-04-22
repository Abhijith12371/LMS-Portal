import { useSelector, useDispatch } from 'react-redux';
import { logout, clearError } from '../store/slices/authSlice';

/**
 * useAuth — convenience hook to read auth state and dispatch actions.
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isLoading, error } = useSelector((state) => state.auth);

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
    isAdmin:      user?.role === 'admin',
    isInstructor: user?.role === 'instructor',
    isStudent:    user?.role === 'student',
    logout:       ()  => dispatch(logout()),
    clearError:   ()  => dispatch(clearError()),
  };
};

export default useAuth;
