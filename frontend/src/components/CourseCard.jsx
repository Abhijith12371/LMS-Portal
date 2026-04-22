import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiUsers, FiClock, FiBarChart } from 'react-icons/fi';

const levelColors = {
  Beginner:     'bg-emerald-500/20 text-emerald-400',
  Intermediate: 'bg-amber-500/20   text-amber-400',
  Advanced:     'bg-red-500/20     text-red-400',
  'All Levels': 'bg-primary-500/20 text-primary-400',
};

export default function CourseCard({ course }) {
  const {
    _id, title, thumbnail, instructor, price, discountPrice,
    averageRating, reviewCount, enrollmentCount,
    totalDuration, totalLectures, level, category,
  } = course;

  const displayPrice = discountPrice && discountPrice < price ? discountPrice : price;
  const hasDiscount  = discountPrice && discountPrice < price;

  return (
    <Link to={`/courses/${_id}`} className="course-card flex flex-col group animate-fade-in">
      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-t-2xl aspect-video bg-surface-800">
        {thumbnail?.url
          ? <img src={thumbnail.url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-900 to-surface-800">
              <FiBarChart className="w-12 h-12 text-primary-500/50" />
            </div>
        }
        {/* Category badge */}
        <span className="absolute top-3 left-3 badge bg-surface-900/80 backdrop-blur text-slate-300 border border-white/10">
          {category}
        </span>
        {/* Level badge */}
        <span className={`absolute top-3 right-3 badge ${levelColors[level] || levelColors['All Levels']}`}>
          {level}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-white text-base leading-snug line-clamp-2 mb-2 group-hover:text-primary-300 transition-colors">
          {title}
        </h3>

        {/* Instructor */}
        {instructor && (
          <div className="flex items-center gap-2 mb-3">
            {instructor.avatar?.url
              ? <img src={instructor.avatar.url} alt={instructor.name} className="w-5 h-5 rounded-full object-cover" />
              : <div className="w-5 h-5 rounded-full bg-primary-700 flex items-center justify-center text-white text-xs font-bold">
                  {instructor.name?.[0]}
                </div>
            }
            <span className="text-slate-400 text-xs">{instructor.name}</span>
          </div>
        )}

        {/* Rating + Meta */}
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <FiStar className="fill-current" /> {averageRating?.toFixed(1) || '0.0'}
          </span>
          <span>({reviewCount || 0})</span>
          <span className="flex items-center gap-1"><FiUsers className="w-3.5 h-3.5" /> {enrollmentCount || 0}</span>
          {totalDuration > 0 && (
            <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /> {Math.round(totalDuration / 60)}h</span>
          )}
        </div>

        {/* Price */}
        <div className="mt-auto flex items-center gap-2">
          {price === 0 ? (
            <span className="text-emerald-400 font-bold text-lg">Free</span>
          ) : (
            <>
              <span className="text-white font-bold text-lg">${displayPrice}</span>
              {hasDiscount && (
                <span className="text-slate-500 text-sm line-through">${price}</span>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
