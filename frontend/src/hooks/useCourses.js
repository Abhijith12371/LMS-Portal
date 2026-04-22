import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, fetchCourseById, fetchFeaturedCourses } from '../store/slices/courseSlice';

/**
 * useCourses — convenience wrapper around course redux state + filters.
 */
export const useCourses = () => {
  const dispatch = useDispatch();
  const { list, featured, current, total, pages, isLoading, error } = useSelector((s) => s.courses);

  const [filters, setFilters] = useState({
    page: 1, limit: 12, search: '', category: '', level: '', sort: '-createdAt',
  });

  const loadCourses = useCallback((overrides = {}) => {
    const params = { ...filters, ...overrides };
    setFilters(params);
    dispatch(fetchCourses(params));
  }, [dispatch, filters]);

  const loadCourseById    = useCallback((id) => dispatch(fetchCourseById(id)), [dispatch]);
  const loadFeaturedCourses = useCallback(() => dispatch(fetchFeaturedCourses()), [dispatch]);

  return {
    courses: list, featured, currentCourse: current,
    total, pages, isLoading, error, filters,
    loadCourses, loadCourseById, loadFeaturedCourses,
  };
};

export default useCourses;
