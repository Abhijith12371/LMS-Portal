const express   = require('express');
const router    = express.Router();
const {
  getAllCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon,
} = require('../controllers/couponController');
const protect   = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

router.post('/validate', protect, validateCoupon);

// Admin only
router.get('/',      protect, authorize('admin'), getAllCoupons);
router.post('/',     protect, authorize('admin'), createCoupon);
router.put('/:id',   protect, authorize('admin'), updateCoupon);
router.delete('/:id',protect, authorize('admin'), deleteCoupon);

module.exports = router;
