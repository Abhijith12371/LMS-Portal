const crypto    = require('crypto');
const User      = require('../models/User');
const { body }  = require('express-validator');
const validate  = require('../middlewares/validate');
const nodemailer = require('nodemailer');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();
  user.password = undefined; // Strip password from response

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to, subject, html,
  });
};

// ─── Validation Rules ─────────────────────────────────────────────────────────
exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'instructor']).withMessage('Role must be student or instructor'),
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if email already registered
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email already registered.' });
  }

  const user = await User.create({ name, email, password, role: role || 'student' });
  sendToken(user, 201, res);
};

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field included
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account has been deactivated. Contact support.' });
  }

  sendToken(user, 200, res);
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
};

// ─── @route  POST /api/auth/forgot-password ───────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Don't reveal if email exists → always 200
    return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'LMS Portal — Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
        <a href="${resetUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
    res.status(200).json({ success: true, message: 'Reset link sent to your email.' });
  } catch (err) {
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ success: false, message: 'Email could not be sent.' });
  }
};

// ─── @route  PUT /api/auth/reset-password/:token ─────────────────────────────
exports.resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken:  hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
  }

  user.password            = req.body.password;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, res);
};

// ─── @route  PUT /api/auth/change-password ───────────────────────────────────
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  await user.save();

  sendToken(user, 200, res);
};
