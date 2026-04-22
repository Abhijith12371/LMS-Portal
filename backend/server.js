require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// ─── Route Imports ────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/authRoutes');
const userRoutes         = require('./routes/userRoutes');
const courseRoutes       = require('./routes/courseRoutes');
const lectureRoutes      = require('./routes/lectureRoutes');
const enrollmentRoutes   = require('./routes/enrollmentRoutes');
const paymentRoutes      = require('./routes/paymentRoutes');
const couponRoutes       = require('./routes/couponRoutes');
const reviewRoutes       = require('./routes/reviewRoutes');
const analyticsRoutes    = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());                   // Set security HTTP headers
app.use(mongoSanitize());            // Sanitize NoSQL injection attacks

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);

// ─── Stripe Webhook (raw body needed BEFORE json parser) ──────────────────────
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logging (dev only) ───────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'LMS API is running 🚀', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/courses',       courseRoutes);
app.use('/api/lectures',      lectureRoutes);
app.use('/api/enrollments',   enrollmentRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/coupons',       couponRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 LMS Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
