const express   = require('express');
const router    = express.Router();
const {
  createLecture, updateLecture, deleteLecture, getLecture,
} = require('../controllers/lectureController');
const protect   = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { uploadVideo } = require('../middlewares/upload');

router.post('/',
  protect,
  authorize('instructor', 'admin'),
  uploadVideo.single('video'),
  createLecture
);
router.get('/:id', protect, getLecture);
router.put('/:id',
  protect,
  authorize('instructor', 'admin'),
  uploadVideo.single('video'),
  updateLecture
);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteLecture);

module.exports = router;
