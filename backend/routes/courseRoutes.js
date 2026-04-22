const express   = require('express');
const router    = express.Router();
const {
  getAllCourses, getCourseById, createCourse, updateCourse,
  deleteCourse, publishCourse, getCoursesByInstructor, getFeaturedCourses, getCategories,
} = require('../controllers/courseController');
const protect   = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { uploadImage } = require('../middlewares/upload');

// Public
router.get('/',              getAllCourses);
router.get('/featured',      getFeaturedCourses);
router.get('/categories',    getCategories);
router.get('/instructor/:id', protect, getCoursesByInstructor);
router.get('/:id',           (req, res, next) => {
  // Optionally attach user for isEnrolled check
  const protect = require('../middlewares/auth');
  next();
}, getCourseById);

// Protected — Instructor / Admin
router.post('/',
  protect,
  authorize('instructor', 'admin'),
  uploadImage.single('thumbnail'),
  createCourse
);
router.put('/:id',
  protect,
  authorize('instructor', 'admin'),
  uploadImage.single('thumbnail'),
  updateCourse
);
router.delete('/:id',         protect, authorize('instructor', 'admin'), deleteCourse);
router.patch('/:id/publish',  protect, authorize('instructor', 'admin'), publishCourse);

module.exports = router;
