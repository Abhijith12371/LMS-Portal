const express   = require('express');
const router    = express.Router();
const {
  getCourseReviews, addReview, updateReview, deleteReview, replyToReview,
} = require('../controllers/reviewController');
const protect   = require('../middlewares/auth');

router.get('/course/:courseId',        getCourseReviews);
router.post('/course/:courseId',       protect, addReview);
router.put('/:id',                     protect, updateReview);
router.delete('/:id',                  protect, deleteReview);
router.post('/:id/reply',              protect, replyToReview);

module.exports = router;
