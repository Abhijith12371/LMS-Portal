const express   = require('express');
const router    = express.Router();
const { getAdminAnalytics, getInstructorAnalytics } = require('../controllers/analyticsController');
const protect   = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.get('/admin',      protect, authorize('admin'),      getAdminAnalytics);
router.get('/instructor', protect, authorize('instructor', 'admin'), getInstructorAnalytics);

module.exports = router;
