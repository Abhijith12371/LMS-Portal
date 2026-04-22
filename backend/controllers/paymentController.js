const stripe     = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment    = require('../models/Payment');
const Course     = require('../models/Course');
const Coupon     = require('../models/Coupon');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');

// ─── @route  POST /api/payments/checkout ─────────────────────────────────────
exports.createCheckoutSession = async (req, res) => {
  const { courseId, couponCode } = req.body;

  const course = await Course.findById(courseId).populate('instructor', 'name');
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
  if (!course.isPublished) return res.status(400).json({ success: false, message: 'Course is not available.' });

  // Check not already enrolled
  const alreadyEnrolled = await Enrollment.findOne({ user: req.user.id, course: courseId });
  if (alreadyEnrolled) return res.status(400).json({ success: false, message: 'Already enrolled in this course.' });

  // ─── Apply Coupon ─────────────────────────────────────────────────────────
  let finalPrice     = course.price;
  let discountAmount = 0;
  let appliedCoupon  = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

    if (!coupon || !coupon.isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code.' });
    }
    if (coupon.usedBy.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon.' });
    }
    if (course.price < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value for this coupon is $${coupon.minOrderValue}.`,
      });
    }

    discountAmount = coupon.discountType === 'percentage'
      ? (course.price * coupon.discountValue) / 100
      : coupon.discountValue;

    finalPrice    = Math.max(0, course.price - discountAmount);
    appliedCoupon = coupon;
  }

  // ─── Free Course — skip Stripe ────────────────────────────────────────────
  if (finalPrice === 0) {
    const payment = await Payment.create({
      user:           req.user.id,
      course:         courseId,
      originalAmount: course.price,
      paidAmount:     0,
      discountAmount,
      coupon:         appliedCoupon?._id,
      couponCode:     couponCode || '',
      status:         'completed',
    });
    await Enrollment.create({ user: req.user.id, course: courseId, payment: payment._id });
    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      appliedCoupon.usedBy.push(req.user.id);
      await appliedCoupon.save();
    }

    return res.status(200).json({ success: true, free: true, message: 'Enrolled successfully (free course).' });
  }

  // ─── Create Stripe Session ────────────────────────────────────────────────
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency:     'usd',
          unit_amount:  Math.round(finalPrice * 100), // cents
          product_data: {
            name:        course.title,
            description: course.shortDescription || '',
            images:      course.thumbnail?.url ? [course.thumbnail.url] : [],
          },
        },
        quantity: 1,
      },
    ],
    customer_email: req.user.email,
    metadata: {
      userId:        req.user.id.toString(),
      courseId:      courseId.toString(),
      couponCode:    couponCode || '',
      couponId:      appliedCoupon?._id.toString() || '',
      originalPrice: course.price.toString(),
      discountAmount: discountAmount.toString(),
    },
    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.CLIENT_URL}/payment/cancel`,
  });

  // Pre-create payment record in pending state
  await Payment.create({
    user:           req.user.id,
    course:         courseId,
    originalAmount: course.price,
    paidAmount:     finalPrice,
    discountAmount,
    coupon:         appliedCoupon?._id,
    couponCode:     couponCode || '',
    stripeSessionId: session.id,
    status:         'pending',
  });

  res.status(200).json({ success: true, sessionId: session.id, url: session.url });
};

// ─── @route  POST /api/payments/webhook ──────────────────────────────────────
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object;
    const { userId, courseId, couponId, couponCode, originalPrice, discountAmount } = session.metadata;

    // Update payment to completed
    const payment = await Payment.findOneAndUpdate(
      { stripeSessionId: session.id },
      { status: 'completed', stripePaymentIntentId: session.payment_intent, receiptUrl: session.receipt_email },
      { new: true }
    );

    if (payment) {
      // Create enrollment
      const enrollment = await Enrollment.create({
        user:    userId,
        course:  courseId,
        payment: payment._id,
      });

      await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

      // Update coupon usage
      if (couponId) {
        await Coupon.findByIdAndUpdate(couponId, {
          $inc:  { usedCount: 1 },
          $push: { usedBy: userId },
        });
      }

      // Notify user
      const course = await Course.findById(courseId).select('title instructor');
      await Notification.create({
        user:    userId,
        type:    'payment',
        title:   'Payment Successful!',
        message: `You are now enrolled in "${course.title}"`,
        link:    `/courses/${courseId}/learn`,
      });

      // Notify instructor
      await Notification.create({
        user:    course.instructor,
        type:    'new_student',
        title:   'New Enrollment!',
        message: `A student purchased "${course.title}"`,
        link:    `/instructor/courses/${courseId}`,
      });
    }
  }

  if (event.type === 'checkout.session.expired') {
    await Payment.findOneAndUpdate(
      { stripeSessionId: event.data.object.id },
      { status: 'failed' }
    );
  }

  res.json({ received: true });
};

// ─── @route  GET /api/payments/my ────────────────────────────────────────────
exports.getMyPayments = async (req, res) => {
  const payments = await Payment.find({ user: req.user.id })
    .populate('course', 'title thumbnail')
    .sort('-createdAt');

  res.status(200).json({ success: true, payments });
};

// ─── @route  GET /api/payments  (admin) ──────────────────────────────────────
exports.getAllPayments = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const total    = await Payment.countDocuments(filter);
  const payments = await Payment.find(filter)
    .populate('user',   'name email')
    .populate('course', 'title')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({ success: true, total, payments });
};
