const express    = require('express');
const router     = express.Router();
const {
  getAllUsers, getUserById, updateProfile, uploadAvatar, deleteUser, updateUserRole, getInstructors,
} = require('../controllers/userController');
const protect    = require('../middlewares/auth');
const authorize  = require('../middlewares/authorize');
const { uploadImage } = require('../middlewares/upload');

router.get('/instructors',     getInstructors);
router.get('/',   protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, getUserById);

router.put('/profile', protect, updateProfile);
router.put('/avatar',  protect, uploadImage.single('avatar'), uploadAvatar);

router.delete('/:id',       protect, authorize('admin'), deleteUser);
router.patch('/:id/role',   protect, authorize('admin'), updateUserRole);

module.exports = router;
