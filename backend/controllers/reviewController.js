const Review     = require('../models/Review');
const Course     = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// ─── @route  GET /api/reviews/course/:courseId ───────────────────────────────
exports.getCourseReviews = async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const total   = await Review.countDocuments({ course: req.params.courseId });
  const reviews = await Review.find({ course: req.params.courseId })
    .populate('user', 'name avatar')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({ success: true, total, reviews });
};

// ─── @route  POST /api/reviews/course/:courseId ──────────────────────────────
exports.addReview = async (req, res) => {
  const { courseId } = req.params;

  // Must be enrolled
  const enrolled = await Enrollment.findOne({ user: req.user.id, course: courseId });
  if (!enrolled) {
    return res.status(403).json({ success: false, message: 'You must be enrolled to leave a review.' });
  }

  // One review per user
  const existing = await Review.findOne({ user: req.user.id, course: courseId });
  if (existing) {
    return res.status(400).json({ success: false, message: 'You have already reviewed this course.' });
  }

  const review = await Review.create({
    user:    req.user.id,
    course:  courseId,
    rating:  req.body.rating,
    comment: req.body.comment,
  });

  await review.populate('user', 'name avatar');

  res.status(201).json({ success: true, review });
};

// ─── @route  PUT /api/reviews/:id ────────────────────────────────────────────
exports.updateReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

  if (review.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this review.' });
  }

  review.rating  = req.body.rating  || review.rating;
  review.comment = req.body.comment || review.comment;
  await review.save();

  res.status(200).json({ success: true, review });
};

// ─── @route  DELETE /api/reviews/:id ─────────────────────────────────────────
exports.deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this review.' });
  }

  await review.deleteOne();

  res.status(200).json({ success: true, message: 'Review deleted.' });
};

// ─── @route  POST /api/reviews/:id/reply  (instructor/admin) ─────────────────
exports.replyToReview = async (req, res) => {
  const review = await Review.findById(req.params.id).populate('course', 'instructor');
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

  if (
    review.course.instructor.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  review.instructorReply = { comment: req.body.comment, repliedAt: new Date() };
  await review.save();

  res.status(200).json({ success: true, review });
};
