import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import ProgressBar from '../../components/ProgressBar';
import StarRating from '../../components/StarRating';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import {
  FiChevronLeft, FiChevronRight, FiCheckCircle, FiLock,
  FiMenu, FiX, FiStar, FiSend, FiBook,
} from 'react-icons/fi';

export default function CoursePlayer() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [enrollment,     setEnrollment]     = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [allLectures,    setAllLectures]    = useState([]);
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [showReview,     setShowReview]     = useState(false);
  const [review,         setReview]         = useState({ rating: 5, comment: '' });
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    userService.getCourseEnrollment(id).then((d) => {
      setEnrollment(d.enrollment);
      // Flatten all lectures
      const lectures = (d.enrollment?.course?.sections || []).flatMap((s) => s.lectures || []);
      setAllLectures(lectures);
      // Resume last watched or start from first
      const lastId = d.enrollment?.lastWatched;
      const resume  = lastId ? lectures.find((l) => l._id === lastId) : lectures[0];
      setCurrentLecture(resume || lectures[0]);
      setLoading(false);
    }).catch(() => {
      toast.error('You are not enrolled in this course.');
      navigate(`/courses/${id}`);
    });
  }, [id, navigate]);

  const markComplete = useCallback(async (lectureId) => {
    try {
      const result = await userService.updateProgress(id, { lectureId });
      setEnrollment(result.enrollment);
    } catch (err) { console.error(err); }
  }, [id]);

  const handleLectureEnd = () => {
    if (!currentLecture) return;
    markComplete(currentLecture._id);
    // Auto-advance
    const idx  = allLectures.findIndex((l) => l._id === currentLecture._id);
    if (idx >= 0 && idx < allLectures.length - 1) {
      setCurrentLecture(allLectures[idx + 1]);
    } else {
      setShowReview(true); // Prompt review on completion
    }
  };

  const submitReview = async () => {
    try {
      await userService.addReview(id, review);
      toast.success('Review submitted! ⭐');
      setShowReview(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review.');
    }
  };

  const isCompleted = (lectureId) => enrollment?.completedLectures?.includes(lectureId);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading course…</p>
      </div>
    </div>
  );

  const course     = enrollment?.course;
  const currentIdx = allLectures.findIndex((l) => l._id === currentLecture?._id);

  return (
    <div className="min-h-screen flex flex-col bg-surface-950 pt-16">
      {/* Top bar */}
      <div className="border-b border-white/10 bg-surface-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen((o) => !o)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
          <div>
            <p className="text-white font-semibold text-sm line-clamp-1">{course?.title}</p>
            <ProgressBar value={enrollment?.progressPercent || 0} size="sm" showLabel={false} />
          </div>
        </div>
        <span className="text-primary-400 text-sm font-semibold">{enrollment?.progressPercent || 0}% complete</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-72 shrink-0 bg-surface-900 border-r border-white/10 overflow-y-auto">
            {(course?.sections || []).map((section, si) => (
              <div key={section._id}>
                <div className="px-4 py-3 border-b border-white/5 bg-surface-850">
                  <p className="text-white text-xs font-semibold uppercase tracking-wider">{section.title}</p>
                </div>
                {(section.lectures || []).map((lecture, li) => {
                  const active    = currentLecture?._id === lecture._id;
                  const completed = isCompleted(lecture._id);
                  return (
                    <button key={lecture._id}
                      onClick={() => setCurrentLecture(lecture)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-white/5 transition-colors ${active ? 'bg-primary-600/20' : 'hover:bg-white/5'}`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${completed ? 'bg-emerald-500' : active ? 'bg-primary-600' : 'border border-slate-600'}`}>
                        {completed && <FiCheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className={`text-xs font-medium line-clamp-2 ${active ? 'text-primary-300' : 'text-slate-300'}`}>
                          {li + 1}. {lecture.title}
                        </p>
                        {lecture.video?.duration && (
                          <p className="text-slate-600 text-xs mt-0.5">{Math.round(lecture.video.duration / 60)}min</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>
        )}

        {/* Main player */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Video */}
          <div className="bg-black aspect-video w-full">
            {currentLecture?.video?.url ? (
              <ReactPlayer
                url={currentLecture.video.url}
                width="100%" height="100%"
                controls
                onEnded={handleLectureEnd}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <div className="text-center">
                  <FiBook className="w-16 h-16 mx-auto mb-3" />
                  <p>No video for this lecture</p>
                </div>
              </div>
            )}
          </div>

          {/* Lecture info */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{currentLecture?.title}</h2>
                {currentLecture?.description && (
                  <p className="text-slate-400 text-sm mt-2">{currentLecture.description}</p>
                )}
              </div>
              <button
                onClick={() => currentLecture && markComplete(currentLecture._id)}
                className={`btn-secondary shrink-0 ${isCompleted(currentLecture?._id) ? 'border-emerald-500 text-emerald-400' : ''}`}
              >
                <FiCheckCircle className="w-4 h-4" />
                {isCompleted(currentLecture?._id) ? 'Completed' : 'Mark Done'}
              </button>
            </div>

            {/* Nav */}
            <div className="flex items-center gap-3 border-t border-white/10 pt-4">
              <button
                onClick={() => currentIdx > 0 && setCurrentLecture(allLectures[currentIdx - 1])}
                disabled={currentIdx <= 0}
                className="btn-secondary text-sm disabled:opacity-40"
              >
                <FiChevronLeft /> Previous
              </button>
              <button
                onClick={() => currentIdx < allLectures.length - 1 && setCurrentLecture(allLectures[currentIdx + 1])}
                disabled={currentIdx >= allLectures.length - 1}
                className="btn-primary text-sm disabled:opacity-40"
              >
                Next <FiChevronRight />
              </button>
              {enrollment?.progressPercent >= 100 && (
                <button onClick={() => setShowReview(true)} className="btn-outline text-sm ml-auto">
                  <FiStar /> Leave a Review
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Review modal */}
      <Modal isOpen={showReview} onClose={() => setShowReview(false)} title="Rate this Course" size="sm">
        <div className="space-y-5">
          <p className="text-slate-400 text-sm">Share your experience with other learners</p>
          <div>
            <label className="label">Your Rating</label>
            <StarRating rating={review.rating} interactive onChange={(r) => setReview((rv) => ({...rv, rating: r}))} size="lg" />
          </div>
          <div>
            <label className="label">Comment (optional)</label>
            <textarea
              value={review.comment}
              onChange={(e) => setReview((rv) => ({...rv, comment: e.target.value}))}
              rows={4} placeholder="What did you like or dislike?"
              className="input resize-none"
            />
          </div>
          <button onClick={submitReview} className="btn-primary w-full">
            <FiSend /> Submit Review
          </button>
        </div>
      </Modal>
    </div>
  );
}
