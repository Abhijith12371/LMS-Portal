import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourseById } from '../../store/slices/courseSlice';
import { addToCart } from '../../store/slices/cartSlice';
import useAuth from '../../hooks/useAuth';
import StarRating from '../../components/StarRating';
import Badge from '../../components/Badge';
import userService from '../../services/userService';
import toast from 'react-hot-toast';
import {
  FiClock, FiUsers, FiStar, FiTag, FiGlobe, FiCheckCircle,
  FiPlay, FiLock, FiChevronDown, FiChevronUp, FiShoppingCart,
  FiArrowRight, FiAward,
} from 'react-icons/fi';

export default function CourseDetail() {
  const { id }      = useParams();
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { current: course, isLoading } = useSelector((s) => s.courses);

  const [reviews,     setReviews]     = useState([]);
  const [isEnrolled,  setIsEnrolled]  = useState(false);
  const [openSection, setOpenSection] = useState(0);

  useEffect(() => {
    dispatch(fetchCourseById(id));
    userService.getCourseReviews(id).then((d) => setReviews(d.reviews || []));
  }, [id, dispatch]);

  useEffect(() => {
    if (!course || !isAuthenticated) return;
    userService.getCourseEnrollment(id)
      .then(() => setIsEnrolled(true))
      .catch(() => setIsEnrolled(false));
  }, [course, isAuthenticated, id]);

  const handleEnrollOrBuy = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (isEnrolled) { navigate(`/courses/${id}/learn`); return; }
    if (course.price === 0) {
      // Free enroll
      userService.enrollFree(id)
        .then(() => { toast.success('Enrolled successfully!'); setIsEnrolled(true); })
        .catch(() => toast.error('Enrollment failed.'));
    } else {
      dispatch(addToCart(course));
      navigate(`/checkout/${id}`);
    }
  };

  if (isLoading || !course) return (
    <div className="container-lms pt-24 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({length:5}).map((_,i) => <div key={i} className="h-10 bg-surface-800 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-96 bg-surface-800 rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  const totalHours = Math.round((course.totalDuration || 0) / 60);

  return (
    <div className="pt-16">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-surface-900 via-surface-850 to-surface-900 border-b border-white/10">
        <div className="container-lms py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 animate-fade-in">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="primary">{course.category}</Badge>
              <Badge variant={course.level === 'Beginner' ? 'success' : course.level === 'Advanced' ? 'danger' : 'warning'}>
                {course.level}
              </Badge>
              {course.isFeatured && <Badge variant="info">⭐ Featured</Badge>}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
              {course.title}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-6 line-clamp-3">
              {course.shortDescription || course.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <FiStar className="fill-current" /> {course.averageRating?.toFixed(1) || '0.0'}
                <span className="text-slate-400 font-normal">({course.reviewCount} reviews)</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <FiUsers /> {course.enrollmentCount} students
              </span>
              {totalHours > 0 && (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <FiClock /> {totalHours}h total
                </span>
              )}
              <span className="flex items-center gap-1.5 text-slate-400">
                <FiPlay /> {course.totalLectures} lectures
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <FiGlobe /> {course.language}
              </span>
            </div>

            {/* Instructor */}
            {course.instructor && (
              <div className="flex items-center gap-3">
                {course.instructor.avatar?.url
                  ? <img src={course.instructor.avatar.url} alt={course.instructor.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500" />
                  : <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold">{course.instructor.name?.[0]}</div>
                }
                <div>
                  <p className="text-xs text-slate-500">Created by</p>
                  <p className="text-primary-400 font-medium text-sm">{course.instructor.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Purchase Card (desktop) */}
          <div className="hidden lg:block">
            <PurchaseCard course={course} isEnrolled={isEnrolled} onAction={handleEnrollOrBuy} />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container-lms py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">

          {/* What you'll learn */}
          {course.learningOutcomes?.length > 0 && (
            <section className="glass p-6 animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-5">What You'll Learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.learningOutcomes.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <FiCheckCircle className="text-primary-400 w-4 h-4 mt-0.5 shrink-0" />{item}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Curriculum */}
          {course.sections?.length > 0 && (
            <section className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-5">Course Curriculum</h2>
              <div className="space-y-2">
                {course.sections.map((section, idx) => (
                  <div key={section._id} className="glass overflow-hidden">
                    <button
                      onClick={() => setOpenSection(openSection === idx ? -1 : idx)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                      <div>
                        <span className="text-white font-semibold">{section.title}</span>
                        <span className="text-slate-500 text-xs ml-2">{section.lectures?.length || 0} lectures</span>
                      </div>
                      {openSection === idx ? <FiChevronUp /> : <FiChevronDown />}
                    </button>

                    {openSection === idx && (
                      <div className="border-t border-white/5 divide-y divide-white/5">
                        {(section.lectures || []).map((lecture, li) => (
                          <div key={lecture._id} className="flex items-center gap-3 px-5 py-3">
                            {lecture.isFree
                              ? <FiPlay className="text-primary-400 w-4 h-4 shrink-0" />
                              : <FiLock className="text-slate-600 w-4 h-4 shrink-0" />
                            }
                            <span className={`text-sm flex-1 ${lecture.isFree ? 'text-slate-300' : 'text-slate-500'}`}>
                              {li + 1}. {lecture.title}
                            </span>
                            {lecture.video?.duration && (
                              <span className="text-xs text-slate-600">
                                {Math.round(lecture.video.duration / 60)}min
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Requirements */}
          {course.requirements?.length > 0 && (
            <section className="animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-4">Requirements</h2>
              <ul className="space-y-2">
                {course.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                    <span className="text-primary-400 mt-1">•</span>{req}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Reviews */}
          <section className="animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-5">Student Reviews</h2>
            {reviews.length === 0 ? (
              <div className="glass p-8 text-center text-slate-500">No reviews yet. Be the first!</div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="glass p-5">
                    <div className="flex items-start gap-3 mb-3">
                      {r.user?.avatar?.url
                        ? <img src={r.user.avatar.url} alt={r.user.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                        : <div className="w-9 h-9 rounded-full bg-primary-700 flex items-center justify-center text-white text-sm font-bold shrink-0">{r.user?.name?.[0]}</div>
                      }
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{r.user?.name}</span>
                          <StarRating rating={r.rating} size="sm" />
                        </div>
                        <p className="text-slate-400 text-sm mt-1">{r.comment}</p>
                        {r.instructorReply?.comment && (
                          <div className="mt-3 pl-4 border-l-2 border-primary-600/50">
                            <p className="text-xs text-primary-400 mb-1">Instructor Reply</p>
                            <p className="text-slate-400 text-sm">{r.instructorReply.comment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Mobile purchase card */}
        <div className="lg:hidden">
          <PurchaseCard course={course} isEnrolled={isEnrolled} onAction={handleEnrollOrBuy} />
        </div>
      </div>
    </div>
  );
}

// ── Purchase Card ─────────────────────────────────────────────────────────────
function PurchaseCard({ course, isEnrolled, onAction }) {
  return (
    <div className="glass sticky top-24 p-6 animate-slide-up">
      {/* Preview thumbnail */}
      <div className="aspect-video rounded-xl overflow-hidden mb-5 bg-surface-800">
        {course.thumbnail?.url
          ? <img src={course.thumbnail.url} alt={course.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <FiPlay className="w-10 h-10 text-primary-500/50" />
            </div>
        }
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-5">
        {course.price === 0 ? (
          <span className="text-3xl font-extrabold text-emerald-400">Free</span>
        ) : (
          <>
            <span className="text-3xl font-extrabold text-white">${course.discountPrice && course.discountPrice < course.price ? course.discountPrice : course.price}</span>
            {course.discountPrice && course.discountPrice < course.price && (
              <span className="text-slate-500 line-through text-lg">${course.price}</span>
            )}
          </>
        )}
      </div>

      {/* CTA */}
      <button onClick={onAction} className="btn-primary w-full py-4 text-base mb-4">
        {isEnrolled ? (
          <><FiPlay /> Continue Learning</>
        ) : course.price === 0 ? (
          <><FiCheckCircle /> Enroll Free</>
        ) : (
          <><FiShoppingCart /> Enroll Now</>
        )}
      </button>

      {!isEnrolled && course.price > 0 && (
        <p className="text-center text-slate-500 text-xs mb-4">30-day money-back guarantee</p>
      )}

      {/* Includes */}
      <div className="space-y-2 text-sm text-slate-400">
        {[
          { icon: <FiPlay />,  text: `${course.totalLectures} on-demand lectures` },
          { icon: <FiClock />, text: `${Math.round((course.totalDuration||0)/60)}h of content` },
          { icon: <FiGlobe />, text: 'Full lifetime access' },
          { icon: <FiAward />, text: 'Certificate of completion' },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2">{icon}{text}</div>
        ))}
      </div>

      {/* Tags */}
      {course.tags?.length > 0 && (
        <div className="mt-5 pt-5 border-t border-white/10">
          <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><FiTag /> Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {course.tags.map((tag) => (
              <span key={tag} className="badge bg-surface-800 text-slate-400 text-xs">{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
