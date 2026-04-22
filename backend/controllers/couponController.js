const Coupon = require('../models/Coupon');

// ─── @route  GET /api/coupons  (admin) ───────────────────────────────────────
exports.getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find()
    .populate('createdBy', 'name')
    .sort('-createdAt');
  res.status(200).json({ success: true, coupons });
};

// ─── @route  POST /api/coupons  (admin) ──────────────────────────────────────
exports.createCoupon = async (req, res) => {
  req.body.createdBy = req.user.id;
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
};

// ─── @route  PUT /api/coupons/:id  (admin) ───────────────────────────────────
exports.updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
  res.status(200).json({ success: true, coupon });
};

// ─── @route  DELETE /api/coupons/:id  (admin) ────────────────────────────────
exports.deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
  res.status(200).json({ success: true, message: 'Coupon deleted.' });
};

// ─── @route  POST /api/coupons/validate  (student) ───────────────────────────
exports.validateCoupon = async (req, res) => {
  const { code, courseId, price } = req.body;

  const coupon = await Coupon.findOne({ code: code?.toUpperCase() });

  if (!coupon || !coupon.isValid) {
    return res.status(400).json({ success: false, message: 'Invalid or expired coupon code.' });
  }

  if (coupon.usedBy.includes(req.user.id)) {
    return res.status(400).json({ success: false, message: 'You have already used this coupon.' });
  }

  if (price < coupon.minOrderValue) {
    return res.status(400).json({
      success: false,
      message: `Minimum order value for this coupon is $${coupon.minOrderValue}.`,
    });
  }

  // Check if coupon is applicable to this course
  if (coupon.applicableCourses.length > 0 && !coupon.applicableCourses.includes(courseId)) {
    return res.status(400).json({ success: false, message: 'This coupon is not valid for this course.' });
  }

  const discountAmount = coupon.discountType === 'percentage'
    ? (price * coupon.discountValue) / 100
    : coupon.discountValue;

  const finalPrice = Math.max(0, price - discountAmount);

  res.status(200).json({
    success: true,
    coupon: {
      code:          coupon.code,
      discountType:  coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalPrice:    Math.round(finalPrice * 100) / 100,
    },
  });
};
