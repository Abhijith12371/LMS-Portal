const express   = require('express');
const router    = express.Router();
const {
  createCheckoutSession, stripeWebhook, getMyPayments, getAllPayments,
} = require('../controllers/paymentController');
const protect   = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

// Stripe webhook — raw body, no auth
router.post('/webhook', stripeWebhook);

// Protected
router.post('/checkout',  protect, createCheckoutSession);
router.get('/my',         protect, getMyPayments);
router.get('/',           protect, authorize('admin'), getAllPayments);

module.exports = router;
