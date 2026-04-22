const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9_-]{3,20}$/, 'Code must be 3–20 uppercase alphanumeric chars'],
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Discount type is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount cannot be negative'],
    },
    // If null, applies to all courses
    applicableCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    // Validity window
    startsAt:  { type: Date, default: Date.now },
    expiresAt: { type: Date, required: [true, 'Expiry date is required'] },
    // Usage control
    usageLimit: { type: Number, default: 100 },
    usedCount:  { type: Number, default: 0 },
    // Users who have used this coupon (to prevent duplicate use)
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Minimum order value to apply coupon
    minOrderValue: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ─── Virtual: isValid ─────────────────────────────────────────────────────────
CouponSchema.virtual('isValid').get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.usedCount < this.usageLimit &&
    now >= this.startsAt &&
    now <= this.expiresAt
  );
});

CouponSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Coupon', CouponSchema);
