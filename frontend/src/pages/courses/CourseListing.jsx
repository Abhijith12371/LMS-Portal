import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchCourses, fetchCategories } from '../../store/slices/courseSlice';
import { useSelector } from 'react-redux';
import CourseCard from '../../components/CourseCard';
import CourseCardSkeleton from '../../components/CourseCardSkeleton';
import useDebounce from '../../hooks/useDebounce';
import { FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const LEVELS    = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const SORT_OPTS = [
  { value: '-createdAt',       label: 'Newest'      },
  { value: '-enrollmentCount', label: 'Most Popular' },
  { value: '-averageRating',   label: 'Top Rated'   },
  { value: 'price',            label: 'Price: Low'  },
  { value: '-price',           label: 'Price: High' },
];

export default function CourseListing() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { list: courses, categories, total, pages, isLoading } = useSelector((s) => s.courses);

  const [search,   setSearch]   = useState(searchParams.get('search')   || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [level,    setLevel]    = useState('');
  const [sort,     setSort]     = useState('-createdAt');
  const [page,     setPage]     = useState(1);
  const [isFree,   setIsFree]   = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    const params = { page, limit: 12, sort };
    if (debouncedSearch) params.search   = debouncedSearch;
    if (category)        params.category = category;
    if (level)           params.level    = level;
    if (isFree)          params.isFree   = 'true';
    dispatch(fetchCourses(params));
  }, [dispatch, debouncedSearch, category, level, sort, page, isFree]);

  const clearFilters = () => {
    setSearch(''); setCategory(''); setLevel('');
    setSort('-createdAt'); setPage(1); setIsFree(false);
  };

  const hasFilters = search || category || level || isFree;

  return (
    <div className="container-lms pt-24 pb-16">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="section-heading text-white mb-2">
          Explore <span className="gradient-text">Courses</span>
        </h1>
        <p className="text-slate-400">
          {total > 0 ? `${total} courses available` : 'Discover your next skill'}
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6 animate-slide-up">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search courses, topics, instructors…"
            className="input pl-11 py-3.5 text-base"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((f) => !f)}
          className={`btn-secondary gap-2 ${showFilters ? 'border-primary-500 text-primary-400' : ''}`}
        >
          <FiFilter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasFilters && <span className="w-2 h-2 rounded-full bg-primary-500" />}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="glass p-5 mb-6 animate-slide-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="label">Category</label>
              <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="select">
                <option value="">All Categories</option>
                {categories.map(({ _id }) => <option key={_id} value={_id}>{_id}</option>)}
              </select>
            </div>
            {/* Level */}
            <div>
              <label className="label">Level</label>
              <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }} className="select">
                <option value="">Any Level</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            {/* Sort */}
            <div>
              <label className="label">Sort By</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="select">
                {SORT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {/* Free */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  onClick={() => { setIsFree((f) => !f); setPage(1); }}
                  className={`w-10 h-6 rounded-full transition-colors ${isFree ? 'bg-primary-600' : 'bg-surface-700'} relative cursor-pointer`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isFree ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-slate-300 text-sm">Free only</span>
              </label>
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
              <FiX className="w-3.5 h-3.5" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Category chips */}
      {!showFilters && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
          <button
            onClick={() => { setCategory(''); setPage(1); }}
            className={`badge border px-4 py-1.5 cursor-pointer transition-colors ${!category ? 'border-primary-500 bg-primary-600/20 text-primary-400' : 'border-white/10 text-slate-400 hover:border-white/20'}`}
          >All</button>
          {categories.slice(0, 8).map(({ _id }) => (
            <button key={_id}
              onClick={() => { setCategory(category === _id ? '' : _id); setPage(1); }}
              className={`badge border px-4 py-1.5 cursor-pointer transition-colors ${category === _id ? 'border-primary-500 bg-primary-600/20 text-primary-400' : 'border-white/10 text-slate-400 hover:border-white/20'}`}
            >{_id}</button>
          ))}
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="glass p-16 text-center animate-fade-in">
          <FiSearch className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No courses found</h3>
          <p className="text-slate-400 mb-6">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger">
            {courses.map((course) => <CourseCard key={course._id} course={course} />)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10 animate-fade-in">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary p-2 disabled:opacity-40">
                <FiChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pages }).map((_, i) => (
                <button key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                    page === i + 1 ? 'bg-primary-600 text-white shadow-glow' : 'bg-surface-800 text-slate-400 hover:text-white hover:bg-surface-700'
                  }`}
                >{i + 1}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                className="btn-secondary p-2 disabled:opacity-40">
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
