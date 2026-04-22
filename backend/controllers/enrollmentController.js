const Enrollment = require('../models/Enrollment');
const Course     = require('../models/Course');
const User       = require('../models/User');
const Notification = require('../models/Notification');

// ─── @route  POST /api/enrollments/:courseId ──────────────────────────────────
exports.enrollInCourse = async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
  if (!course.isPublished) return res.status(400).json({ success: false, message: 'Course is not published.' });

  // Check if already enrolled
  const existing = await Enrollment.findOne({ user: req.user.id, course: course._id });
  if (existing) return res.status(400).json({ success: false, message: 'Already enrolled in this course.' });

  // For paid courses, a payment record must exist
  if (course.price > 0 && !req.body.paymentId) {
    return res.status(400).json({ success: false, message: 'Payment required for this course.' });
  }

  const enrollment = await Enrollment.create({
    user:    req.user.id,
    course:  course._id,
    payment: req.body.paymentId || null,
  });

  // Update course enrollment count
  await Course.findByIdAndUpdate(course._id, { $inc: { enrollmentCount: 1 } });

  // Update instructor student count
  await User.findByIdAndUpdate(course.instructor, { $inc: { totalStudents: 1 } });

  // Notify instructor
  await Notification.create({
    user:    course.instructor,
    type:    'new_student',
    title:   'New Enrollment!',
    message: `${req.user.name} enrolled in "${course.title}"`,
    link:    `/courses/${course._id}`,
  });

  res.status(201).json({ success: true, enrollment });
};

// ─── @route  GET /api/enrollments/my ────────────────────────────────────────
exports.getMyEnrollments = async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user.id })
    .populate({
      path: 'course',
      select: 'title thumbnail instructor category level totalLectures totalDuration',
      populate: { path: 'instructor', select: 'name avatar' },
    })
    .sort('-createdAt');

  res.status(200).json({ success: true, enrollments });
};

// ─── @route  GET /api/enrollments/:courseId ──────────────────────────────────
exports.getCourseEnrollment = async (req, res) => {
  const enrollment = await Enrollment.findOne({
    user:   req.user.id,
    course: req.params.courseId,
  }).populate({
    path: 'course',
    populate: {
      path: 'sections',
      populate: { path: 'lectures' },
    },
  });

  if (!enrollment) return res.status(404).json({ success: false, message: 'Not enrolled in this course.' });

  res.status(200).json({ success: true, enrollment });
};

// ─── @route  PATCH /api/enrollments/:courseId/progress ───────────────────────
exports.updateProgress = async (req, res) => {
  const { lectureId } = req.body;
  if (!lectureId) return res.status(400).json({ success: false, message: 'lectureId is required.' });

  const enrollment = await Enrollment.findOne({ user: req.user.id, course: req.params.courseId });
  if (!enrollment) return res.status(404).json({ success: false, message: 'Not enrolled in this course.' });

  // Add lecture to completedLectures (idempotent)
  if (!enrollment.completedLectures.includes(lectureId)) {
    enrollment.completedLectures.push(lectureId);
  }
  enrollment.lastWatched = lectureId;

  // Recalculate progress
  const course = await Course.findById(req.params.courseId).select('totalLectures');
  if (course && course.totalLectures > 0) {
    enrollment.progressPercent = Math.round(
      (enrollment.completedLectures.length / course.totalLectures) * 100
    );
  }

  // Mark as completed
  if (enrollment.progressPercent >= 100) {
    enrollment.isCompleted = true;
    enrollment.completedAt = new Date();
  }

  await enrollment.save();

  res.status(200).json({ success: true, enrollment });
};

// ─── @route  GET /api/enrollments/course/:courseId  (instructor / admin) ──────
exports.getCourseStudents = async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  const enrollments = await Enrollment.find({ course: req.params.courseId })
    .populate('user', 'name email avatar createdAt')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: enrollments.length, enrollments });
};
