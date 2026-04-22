const User       = require('../models/User');
const Course     = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment    = require('../models/Payment');
const Review     = require('../models/Review');

// ─── @route  GET /api/analytics/admin  (admin only) ──────────────────────────
exports.getAdminAnalytics = async (req, res) => {
  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalRevenue,
    studentsByMonth,
    revenueByMonth,
    topCourses,
    usersByRole,
  ] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments({ isPublished: true }),
    Enrollment.countDocuments(),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]),
    // Students registered per month (last 6 months)
    User.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id:   { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    // Revenue per month
    Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id:     { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          revenue: { $sum: '$paidAmount' },
          count:   { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    // Top 5 courses by enrollment
    Course.find({ isPublished: true })
      .select('title thumbnail enrollmentCount averageRating price')
      .sort('-enrollmentCount')
      .limit(5)
      .populate('instructor', 'name'),
    // Users by role
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue: totalRevenue[0]?.total || 0,
    },
    charts: {
      studentsByMonth,
      revenueByMonth,
      usersByRole,
    },
    topCourses,
  });
};

// ─── @route  GET /api/analytics/instructor  (instructor) ─────────────────────
exports.getInstructorAnalytics = async (req, res) => {
  const instructorId = req.user.id;

  const courses = await Course.find({ instructor: instructorId }).select('_id');
  const courseIds = courses.map((c) => c._id);

  const [
    totalStudents,
    totalRevenue,
    totalReviews,
    courseStats,
  ] = await Promise.all([
    Enrollment.countDocuments({ course: { $in: courseIds } }),
    Payment.aggregate([
      { $match: { course: { $in: courseIds }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]),
    Review.countDocuments({ course: { $in: courseIds } }),
    Course.find({ instructor: instructorId })
      .select('title enrollmentCount averageRating reviewCount price isPublished')
      .sort('-enrollmentCount'),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalCourses:  courses.length,
      totalStudents,
      totalRevenue:  totalRevenue[0]?.total || 0,
      totalReviews,
    },
    courseStats,
  });
};
