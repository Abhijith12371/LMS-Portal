const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    // Original price before discount
    originalAmount: { type: Number, required: true },
    // Final paid amount (after coupon)
    paidAmount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    // Applied coupon (if any)
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode:    { type: String, default: '' },
    discountAmount:{ type: Number, default: 0 },
    // Stripe fields
    stripeSessionId:       { type: String, default: '' },
    stripePaymentIntentId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    // Receipt URL from Stripe
    receiptUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

PaymentSchema.index({ user: 1 });
PaymentSchema.index({ course: 1 });
PaymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
