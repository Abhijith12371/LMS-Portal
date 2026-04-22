const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — verifies JWT from Authorization header or cookie.
 * Attaches req.user to the request.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Fallback: check httpOnly cookie
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    if (!req.user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is invalid or has expired.' });
  }
};

module.exports = protect;
