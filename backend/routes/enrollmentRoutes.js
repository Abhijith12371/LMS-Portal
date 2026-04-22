const express   = require('express');
const router    = express.Router();
const {
  enrollInCourse, getMyEnrollments, getCourseEnrollment, updateProgress, getCourseStudents,
} = require('../controllers/enrollmentController');
const protect   = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.post('/:courseId',           protect, enrollInCourse);
router.get('/my',                   protect, getMyEnrollments);
router.get('/:courseId',            protect, getCourseEnrollment);
router.patch('/:courseId/progress', protect, updateProgress);
router.get('/course/:courseId/students',
  protect,
  authorize('instructor', 'admin'),
  getCourseStudents
);

module.exports = router;
