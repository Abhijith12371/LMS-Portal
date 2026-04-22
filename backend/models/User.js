const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const crypto    = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
    },
    avatar: {
      public_id: String,
      url: { type: String, default: '' },
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    website: { type: String, default: '' },
    social: {
      twitter:  { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github:   { type: String, default: '' },
    },
    // Instructor specific
    expertise: [String],
    totalStudents: { type: Number, default: 0 },
    // Password reset
    resetPasswordToken:   String,
    resetPasswordExpire:  Date,
    // Email verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: String,
    // Stripe customer
    stripeCustomerId: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Hash password before save ────────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Compare passwords ────────────────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Generate JWT ─────────────────────────────────────────────────────────────
UserSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── Generate password reset token ───────────────────────────────────────────
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken  = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
