const Course     = require('../models/Course');
const Section    = require('../models/Section');
const Enrollment = require('../models/Enrollment');
const cloudinary = require('../config/cloudinary');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const buildFilter = (query) => {
  const { category, level, minPrice, maxPrice, search, isFree, isPublished = true } = query;
  const filter = {};

  if (isPublished !== 'all') filter.isPublished = isPublished === 'false' ? false : true;
  if (category) filter.category = category;
  if (level)    filter.level    = level;
  if (isFree === 'true') filter.price = 0;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (search) filter.$text = { $search: search };

  return filter;
};

// ─── @route  GET /api/courses ─────────────────────────────────────────────────
exports.getAllCourses = async (req, res) => {
  const { page = 1, limit = 12, sort = '-createdAt' } = req.query;
  const filter = buildFilter(req.query);

  const total   = await Course.countDocuments(filter);
  const courses = await Course.find(filter)
    .select('title shortDescription thumbnail price discountPrice category level averageRating reviewCount enrollmentCount instructor tags isFree isPublished')
    .populate('instructor', 'name avatar')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    total,
    page:  Number(page),
    pages: Math.ceil(total / limit),
    courses,
  });
};

// ─── @route  GET /api/courses/:id ────────────────────────────────────────────
exports.getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name avatar bio expertise totalStudents')
    .populate({
      path: 'sections',
      populate: { path: 'lectures', select: 'title duration isFree order' },
    });

  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  // Check enrollment if user is logged in
  let isEnrolled = false;
  if (req.user) {
    const enrollment = await Enrollment.findOne({ user: req.user.id, course: course._id });
    isEnrolled = !!enrollment;
  }

  res.status(200).json({ success: true, course, isEnrolled });
};

// ─── @route  POST /api/courses ───────────────────────────────────────────────
exports.createCourse = async (req, res) => {
  req.body.instructor = req.user.id;

  if (req.file) {
    req.body.thumbnail = { public_id: req.file.filename, url: req.file.path };
  }

  const course = await Course.create(req.body);
  res.status(201).json({ success: true, course });
};

// ─── @route  PUT /api/courses/:id ────────────────────────────────────────────
exports.updateCourse = async (req, res) => {
  let course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  // Only instructor who owns it or admin can update
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this course.' });
  }

  if (req.file) {
    // Remove old thumbnail
    if (course.thumbnail && course.thumbnail.public_id) {
      await cloudinary.uploader.destroy(course.thumbnail.public_id);
    }
    req.body.thumbnail = { public_id: req.file.filename, url: req.file.path };
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });

  res.status(200).json({ success: true, course });
};

// ─── @route  DELETE /api/courses/:id ─────────────────────────────────────────
exports.deleteCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this course.' });
  }

  // Delete thumbnail from Cloudinary
  if (course.thumbnail && course.thumbnail.public_id) {
    await cloudinary.uploader.destroy(course.thumbnail.public_id);
  }

  await course.deleteOne();
  res.status(200).json({ success: true, message: 'Course deleted successfully.' });
};

// ─── @route  PATCH /api/courses/:id/publish ──────────────────────────────────
exports.publishCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  course.isPublished = !course.isPublished;
  course.publishedAt = course.isPublished ? new Date() : undefined;
  await course.save();

  res.status(200).json({
    success: true,
    message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully.`,
    isPublished: course.isPublished,
  });
};

// ─── @route  GET /api/courses/instructor/:id ─────────────────────────────────
exports.getCoursesByInstructor = async (req, res) => {
  const instructorId = req.params.id || req.user.id;

  // If not admin/instructor, only show published courses
  const isOwner = req.user && (req.user.id === instructorId || req.user.role === 'admin');
  const filter  = { instructor: instructorId };
  if (!isOwner) filter.isPublished = true;

  const courses = await Course.find(filter)
    .select('title thumbnail price enrollmentCount averageRating isPublished createdAt')
    .sort('-createdAt');

  res.status(200).json({ success: true, courses });
};

// ─── @route  GET /api/courses/featured ───────────────────────────────────────
exports.getFeaturedCourses = async (req, res) => {
  const courses = await Course.find({ isFeatured: true, isPublished: true })
    .populate('instructor', 'name avatar')
    .sort('-averageRating')
    .limit(8);

  res.status(200).json({ success: true, courses });
};

// ─── @route  GET /api/courses/categories ─────────────────────────────────────
exports.getCategories = async (_req, res) => {
  const categories = await Course.aggregate([
    { $match: { isPublished: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.status(200).json({ success: true, categories });
};
