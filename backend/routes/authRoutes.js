const express  = require('express');
const router   = express.Router();
const {
  register, login, getMe, forgotPassword, resetPassword, changePassword,
  registerValidation, loginValidation,
} = require('../controllers/authController');
const protect  = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { body } = require('express-validator');

router.post('/register', validate(registerValidation), register);
router.post('/login',    validate(loginValidation),    login);
router.post('/forgot-password', [body('email').isEmail()], forgotPassword);
router.put('/reset-password/:token',
  [body('password').isLength({ min: 6 })],
  resetPassword
);

// Protected
router.get('/me',              protect, getMe);
router.put('/change-password', protect,
  validate([
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
  ]),
  changePassword
);

module.exports = router;
