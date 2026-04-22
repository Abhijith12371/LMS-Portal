/**
 * Centralized Error Handler Middleware
 * Catches all errors passed via next(err) and returns a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // ─── Mongoose CastError (invalid ObjectId) ────────────────────────────────
  if (err.name === 'CastError') {
    error.message = `Resource not found with id: ${err.value}`;
    error.statusCode = 404;
  }

  // ─── Mongoose Duplicate Key ───────────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `Duplicate value for field: ${field}. Please use a different value.`;
    error.statusCode = 400;
  }

  // ─── Mongoose Validation Error ────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map((e) => e.message).join('. ');
    error.statusCode = 400;
  }

  // ─── JWT Errors ───────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token. Please log in again.';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Your session has expired. Please log in again.';
    error.statusCode = 401;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
